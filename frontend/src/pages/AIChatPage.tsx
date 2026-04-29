import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { apiBaseUrl } from '../api/client'
import { AIReportSheet } from '../components/AIReportSheet'
import { ContentRatingGate } from '../components/ContentRatingGate'
import { StatusCard } from '../components/FeedbackBlocks'
import { InfoIcon } from '../components/Icons'
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
  const [showRoleInfo, setShowRoleInfo] = useState(false)
  const [showSafetyTip, setShowSafetyTip] = useState(false)
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
    setShowRoleInfo(false)
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
  const ageGateOpen = !ageAcknowledged

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
      if (!text) return
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

  const userMessageCount = messages.filter((m) => m.speaker === 'user').length
  const showStarters = userMessageCount === 0
  const minuteBadgeTone = outOfMinutes ? 'danger' : lowMinutesWarning ? 'warning' : 'default'

  return (
    <div className="page page--detail page--ai-chat">
      <SubPageHeader title={session.roleName} />

      <ContentRatingGate
        acknowledged={ageAcknowledged}
        onAcknowledge={acknowledgeAge}
        onDecline={() => navigate('/')}
      />

      <section className={`ai-chat-hero ai-chat-hero--${session.tone}`}>
        <div className="ai-chat-hero__top">
          <div className="ai-chat-hero__avatar" aria-hidden="true">
            {role.name.slice(0, 1)}
          </div>
          <div className="ai-chat-hero__meta">
            <div className="ai-chat-hero__name-row">
              <h1 className="ai-chat-hero__name">{session.roleName}</h1>
              <span className="ai-chat-hero__rating">17+</span>
            </div>
            <div className="ai-chat-hero__subline">{session.roleSubtitle}</div>
            <div className="ai-chat-hero__chip-row">
              <span className="ai-chat-chip ai-chat-chip--scene">{role.scene}</span>
              <span className="ai-chat-chip">{role.relationship}</span>
              <span className={`ai-chat-chip ai-chat-chip--minutes ai-chat-chip--${minuteBadgeTone}`}>
                {outOfMinutes ? '体验时长已用完' : `剩余 ${aiMinutes} 分钟`}
              </span>
            </div>
          </div>
        </div>
        <p className="ai-chat-hero__intro">{role.intro}</p>
        <div className="ai-chat-hero__actions">
          <button
            type="button"
            className={showRoleInfo ? 'ai-chat-hero__toggle ai-chat-hero__toggle--open' : 'ai-chat-hero__toggle'}
            onClick={() => setShowRoleInfo((value) => !value)}
            aria-expanded={showRoleInfo}
          >
            {showRoleInfo ? '收起角色信息' : '查看角色信息'}
          </button>
          <button
            type="button"
            className="ai-chat-hero__toggle"
            onClick={() => setShowSafetyTip((value) => !value)}
            aria-expanded={showSafetyTip}
          >
            内容与安全说明
          </button>
        </div>
      </section>

      {showRoleInfo ? (
        <section className="ai-chat-info-panel">
          <div className="ai-chat-info-panel__row">
            <span className="ai-chat-info-panel__label">会话状态</span>
            <span className="ai-chat-info-panel__value">{session.sessionStatus}</span>
          </div>
          <div className="ai-chat-info-panel__memory">
            <span className="ai-chat-info-panel__label">记忆要点</span>
            <p className="ai-chat-info-panel__memory-text">{session.memory}</p>
          </div>
          <div className="ai-chat-info-panel__row ai-chat-info-panel__row--wrap">
            <span className="ai-chat-info-panel__label">基础偏好</span>
            <div className="ai-chat-info-panel__chips">
              {session.preferences.map((item) => (
                <span key={item.label} className="ai-chat-info-panel__pref">
                  <em>{item.label}</em>
                  {item.value}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {showSafetyTip ? (
        <section className="ai-chat-info-panel ai-chat-info-panel--safety">
          <p className="ai-chat-info-panel__memory-text">
            AI 回复均由模型即时生成，可能与事实不符。耳边已开启敏感词过滤；如发现不当回复，请点击该条消息下方的「举报」按钮，开发团队会在 24 小时内核查处理。本服务面向 17 岁及以上用户。
          </p>
        </section>
      ) : null}

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

      <section className="ai-chat-thread-card">
        <div className="ai-chat-thread-card__head">
          <span className="ai-chat-thread-card__title">对话</span>
          <span className="ai-chat-thread-card__status">{isTyping ? '对方正在输入…' : '已连线'}</span>
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

        {showStarters ? (
          <div className="ai-chat-thread-card__starters">
            <div className="ai-chat-thread-card__starters-label">不知道说什么 · 试试这些开场</div>
            <div className="starter-prompt-list">
              {session.starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="starter-prompt"
                  onClick={() => handleStarterClick(prompt)}
                  disabled={outOfMinutes || ageGateOpen}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}
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

      <section className="ai-chat-footer">
        <Link to="/ai" className="ai-chat-footer__link">切换角色</Link>
        <span className="ai-chat-footer__sep">·</span>
        <Link to="/support/help" className="ai-chat-footer__link">帮助与反馈</Link>
        <span className="ai-chat-footer__sep">·</span>
        <Link to="/support/terms" className="ai-chat-footer__link">社区准则</Link>
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
