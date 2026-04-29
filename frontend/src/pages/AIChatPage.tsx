import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { apiBaseUrl } from '../api/client'
import { AIReportSheet } from '../components/AIReportSheet'
import { ContentRatingGate } from '../components/ContentRatingGate'
import { StatusCard } from '../components/FeedbackBlocks'
import { InfoIcon, WalletIcon } from '../components/Icons'
import { SubPageHeader } from '../components/SubPageHeader'
import { loadAIChat } from '../data/source'
import { useAppData } from '../hooks/useAppData'
import { useMockSession } from '../hooks/useMockSession'
import type { AIChatSessionData, AIMessageItem, AIRoleItem } from '../types/app'
import { checkUserInput, sanitizeAIOutput } from '../utils/aiContentGuard'

const FALLBACK_REPLIES = [
  '我在呢, 你继续说, 我会认真听。',
  '收到了, 我陪你慢慢聊, 不着急。',
  '嗯, 我看到你发来的话了, 现在我陪着你。',
  '别急, 先把今天放下, 我在。',
]

function pickFallback(): string {
  return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)]
}

function createMessage(speaker: AIMessageItem['speaker'], text: string): AIMessageItem {
  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    speaker,
    text,
  }
}

function toApiMessages(messages: AIMessageItem[]): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages.map((m) => ({
    role: m.speaker === 'user' ? 'user' : 'assistant',
    content: m.text,
  }))
}

async function callAIChat(
  history: AIMessageItem[],
  role: AIRoleItem,
  signal: AbortSignal,
): Promise<string> {
  const base = apiBaseUrl()
  if (!base) return pickFallback()

  const res = await fetch(`${base}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: toApiMessages(history),
      role: {
        name: role.name,
        subtitle: role.subtitle,
        scene: role.scene,
        relationship: role.relationship,
        intro: role.intro,
      },
    }),
    signal,
  })
  if (!res.ok) throw new Error(`ai chat ${res.status}`)
  const data = (await res.json()) as { reply?: string }
  return (data.reply ?? '').trim() || pickFallback()
}

export function AIChatPage() {
  const navigate = useNavigate()
  const { roleId = 'lanlan' } = useParams()

  const loader = useCallback(() => loadAIChat(roleId), [roleId])
  const { data } = useAppData(loader, [roleId])

  if (!data) {
    return (
      <div className="page page--detail page--ai-chat">
        <SubPageHeader title="AI 对话" />
      </div>
    )
  }

  return <AIChatView role={data.role} session={data.session} navigate={navigate} />
}

interface AIChatViewProps {
  role: AIRoleItem
  session: AIChatSessionData
  navigate: ReturnType<typeof useNavigate>
}

function AIChatView({ role, session, navigate }: AIChatViewProps) {
  const {
    aiMinutes,
    consumeAiMinutes,
    isAuthenticated,
    ageAcknowledged,
    acknowledgeAge,
    submitReport,
  } = useMockSession()

  const [messages, setMessages] = useState<AIMessageItem[]>(session.messages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [syncedRoleId, setSyncedRoleId] = useState(session.roleId)
  const [guardNotice, setGuardNotice] = useState('')
  const [reportTarget, setReportTarget] = useState<AIMessageItem | null>(null)
  const [reportFeedback, setReportFeedback] = useState('')
  const threadEndRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  if (syncedRoleId !== session.roleId) {
    setSyncedRoleId(session.roleId)
    setMessages(session.messages)
    setInput('')
    setIsTyping(false)
    setGuardNotice('')
    setReportTarget(null)
    setReportFeedback('')
    abortRef.current?.abort()
    abortRef.current = null
  }

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, isTyping])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const outOfMinutes = aiMinutes <= 0
  const lowMinutesWarning = aiMinutes > 0 && aiMinutes <= 3

  const ageGateOpen = useMemo(() => !ageAcknowledged, [ageAcknowledged])

  const requestReply = useCallback(
    async (history: AIMessageItem[]) => {
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      setIsTyping(true)
      try {
        const reply = await callAIChat(history, role, ctrl.signal)
        const guarded = sanitizeAIOutput(reply)
        setMessages((prev) => [...prev, createMessage('ai', guarded.text)])
        if (guarded.intervened) {
          setGuardNotice('刚才那条回复触发了我们的安全过滤，已自动替换为安全回复。')
        }
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') return
        setMessages((prev) => [...prev, createMessage('ai', pickFallback())])
      } finally {
        if (abortRef.current === ctrl) {
          abortRef.current = null
          setIsTyping(false)
        }
      }
    },
    [role],
  )

  const handleSend = useCallback(
    (raw: string) => {
      const text = raw.trim()

      if (!text) {
        return
      }

      if (!isAuthenticated) {
        navigate('/auth')
        return
      }

      if (outOfMinutes) {
        setGuardNotice('体验时长已用完，新版本上线后会通过会员体系补充。')
        return
      }

      const guard = checkUserInput(text)
      if (!guard.ok) {
        setGuardNotice(guard.message ?? '这条消息触发了安全过滤，已为你拦截。')
        setInput('')
        return
      }

      const userMsg = createMessage('user', text)
      setMessages((prev) => {
        const next = [...prev, userMsg]
        void requestReply(next)
        return next
      })
      setInput('')
      setGuardNotice('')
      consumeAiMinutes(1)
    },
    [consumeAiMinutes, isAuthenticated, navigate, outOfMinutes, requestReply],
  )

  const handleStarterClick = useCallback(
    (prompt: string) => {
      if (outOfMinutes) {
        setGuardNotice('体验时长已用完，欢迎在「帮助与反馈」里联系我们补充。')
        return
      }

      handleSend(prompt)
    },
    [handleSend, outOfMinutes],
  )

  return (
    <div className="page page--detail page--ai-chat">
      <SubPageHeader title="AI 对话" />

      <ContentRatingGate
        acknowledged={ageAcknowledged}
        onAcknowledge={acknowledgeAge}
        onDecline={() => navigate('/')}
      />

      <section className={`detail-hero detail-hero--${session.tone}`}>
        <div className="ai-chat-hero__top">
          <div className="ai-role-card__avatar ai-role-card__avatar--large" aria-hidden="true">
            {role.name.slice(0, 1)}
          </div>
          <div>
            <div className="detail-hero__eyebrow">{role.scene}</div>
            <h1 className="detail-hero__title">{session.roleName}</h1>
            <div className="detail-hero__meta">{session.roleSubtitle}</div>
          </div>
        </div>
        <p className="detail-hero__description">{role.intro}</p>
      </section>

      <StatusCard
        eyebrow="安全提示"
        title="AI 内容由模型生成"
        description="所有 AI 回复均由模型即时生成，可能与事实不符。我们已开启敏感词过滤；如发现不当回复，请点击该条消息下方的「举报」按钮，开发团队会在 24 小时内核查处理。"
        tone="default"
        icon={<InfoIcon className="status-card__glyph" />}
      />

      <StatusCard
        eyebrow="剩余体验时长"
        title={`${aiMinutes} 分钟可用`}
        description={
          outOfMinutes
            ? '体验时长已用完。会员与时长包功能尚未开放，可在「帮助与反馈」里联系我们补充。'
            : lowMinutesWarning
              ? '剩余时长不多了，建议合理安排今天的对话节奏。'
              : '每次发送会消耗 1 分钟。这是我们提供的体验额度，未来会员上线后会有正式的时长方案。'
        }
        tone={outOfMinutes ? 'warning' : lowMinutesWarning ? 'warning' : 'default'}
        icon={<WalletIcon className="status-card__glyph" />}
      />

      {guardNotice ? (
        <StatusCard
          eyebrow="安全过滤"
          title="刚才的内容已被拦截"
          description={guardNotice}
          tone="warning"
          icon={<InfoIcon className="status-card__glyph" />}
          actions={
            <button type="button" className="button button--ghost" onClick={() => setGuardNotice('')}>
              我知道了
            </button>
          }
        />
      ) : null}

      {reportFeedback ? (
        <StatusCard
          eyebrow="举报已提交"
          title="我们会在 24 小时内核查"
          description={reportFeedback}
          tone="success"
          icon={<InfoIcon className="status-card__glyph" />}
          actions={
            <button type="button" className="button button--ghost" onClick={() => setReportFeedback('')}>
              我知道了
            </button>
          }
        />
      ) : null}

      <section className="info-card info-card--memory">
        <div className="info-card__label">当前会话状态</div>
        <div className="info-card__value info-card__value--sm">{session.sessionStatus}</div>
        <p className="info-card__text">{session.memory}</p>
      </section>

      <section className="page-section page-section--compact">
        <div className="section-header">
          <h2 className="section-header__title">基础偏好</h2>
        </div>
        <div className="preference-grid">
          {session.preferences.map((item) => (
            <div key={item.label} className="preference-chip">
              <span className="preference-chip__label">{item.label}</span>
              <span className="preference-chip__value">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="page-section page-section--compact">
        <div className="section-header">
          <h2 className="section-header__title">对话片段</h2>
          <span className="section-header__action">{isTyping ? '对方正在输入…' : '语音中'}</span>
        </div>
        <div className="chat-thread">
          {messages.map((message) => (
            <div
              key={message.id}
              className={message.speaker === 'ai' ? 'chat-bubble chat-bubble--ai' : 'chat-bubble chat-bubble--user'}
            >
              <div className="chat-bubble__text">{message.text}</div>
              {message.speaker === 'ai' ? (
                <button
                  type="button"
                  className="chat-bubble__report"
                  aria-label="举报这条回复"
                  onClick={() => setReportTarget(message)}
                >
                  举报
                </button>
              ) : null}
            </div>
          ))}
          {isTyping ? (
            <div className="chat-bubble chat-bubble--ai chat-bubble--typing">
              <span className="chat-typing-dot" />
              <span className="chat-typing-dot" />
              <span className="chat-typing-dot" />
            </div>
          ) : null}
          <div ref={threadEndRef} />
        </div>
      </section>

      <section className="page-section page-section--compact">
        <div className="section-header">
          <h2 className="section-header__title">推荐开场</h2>
        </div>
        <div className="starter-prompt-list">
          {session.starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="starter-prompt"
              onClick={() => handleStarterClick(prompt)}
              disabled={outOfMinutes}
            >
              {prompt}
            </button>
          ))}
        </div>
      </section>

      <form
        className="chat-composer"
        onSubmit={(event) => {
          event.preventDefault()
          handleSend(input)
        }}
      >
        <input
          className="chat-composer__input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={ageGateOpen ? '请先确认年龄分级' : outOfMinutes ? '体验时长已用完' : '说点什么，发送会消耗 1 分钟'}
          disabled={outOfMinutes || ageGateOpen}
          aria-label="聊天输入"
        />
        <button
          type="submit"
          className="button button--primary chat-composer__send"
          disabled={outOfMinutes || ageGateOpen || !input.trim()}
        >
          发送
        </button>
      </form>

      <section className="detail-actions">
        <Link to="/ai" className="button button--secondary button--block">
          切换角色
        </Link>
        <Link to="/support/help" className="button button--ghost button--block">
          帮助与反馈
        </Link>
      </section>

      <AIReportSheet
        open={Boolean(reportTarget)}
        targetText={reportTarget?.text ?? ''}
        onClose={() => setReportTarget(null)}
        onSubmit={(reason, note) => {
          if (reportTarget) {
            submitReport({
              surface: 'ai',
              targetId: reportTarget.id,
              targetTitle: `${role.name} 的 AI 回复`,
              reason,
              note,
            })
          }
          setReportTarget(null)
          setReportFeedback(`举报理由：${reason}${note ? ' · 已记录补充说明' : ''}`)
        }}
      />
    </div>
  )
}
