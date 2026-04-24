import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { apiBaseUrl } from '../api/client'
import { StatusCard } from '../components/FeedbackBlocks'
import { InfoIcon, WalletIcon } from '../components/Icons'
import { SubPageHeader } from '../components/SubPageHeader'
import { loadAIChat } from '../data/source'
import { useAppData } from '../hooks/useAppData'
import { useMockSession } from '../hooks/useMockSession'
import type { AIChatSessionData, AIMessageItem, AIRoleItem } from '../types/app'

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
  const { aiMinutes, consumeAiMinutes, isAuthenticated } = useMockSession()

  const [messages, setMessages] = useState<AIMessageItem[]>(session.messages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [syncedRoleId, setSyncedRoleId] = useState(session.roleId)
  const threadEndRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  if (syncedRoleId !== session.roleId) {
    setSyncedRoleId(session.roleId)
    setMessages(session.messages)
    setInput('')
    setIsTyping(false)
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

  const requestReply = useCallback(
    async (history: AIMessageItem[]) => {
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      setIsTyping(true)
      try {
        const reply = await callAIChat(history, role, ctrl.signal)
        setMessages((prev) => [...prev, createMessage('ai', reply)])
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
        navigate('/ai/packs')
        return
      }

      const userMsg = createMessage('user', text)
      setMessages((prev) => {
        const next = [...prev, userMsg]
        void requestReply(next)
        return next
      })
      setInput('')
      consumeAiMinutes(1)
    },
    [consumeAiMinutes, isAuthenticated, navigate, outOfMinutes, requestReply],
  )

  const handleStarterClick = useCallback(
    (prompt: string) => {
      if (outOfMinutes) {
        navigate('/ai/packs')
        return
      }

      handleSend(prompt)
    },
    [handleSend, navigate, outOfMinutes],
  )

  return (
    <div className="page page--detail page--ai-chat">
      <SubPageHeader title="AI 对话" />

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
        eyebrow="剩余时长"
        title={`${aiMinutes} 分钟可用`}
        description={
          outOfMinutes
            ? '时长已用完，补充时长包后即可继续当前会话，角色记忆仍然保留。'
            : lowMinutesWarning
              ? '剩余时长不多了，建议先补充时长包，避免对话中途被中断。'
              : '每次发送会消耗 1 分钟，时长不足可在时长包页面补充。'
        }
        tone={outOfMinutes ? 'warning' : lowMinutesWarning ? 'warning' : 'default'}
        icon={<WalletIcon className="status-card__glyph" />}
        actions={
          <button type="button" className="button button--secondary" onClick={() => navigate('/ai/packs')}>
            {outOfMinutes ? '去购买时长' : '查看时长包'}
          </button>
        }
      />

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
              {message.text}
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

      {outOfMinutes ? (
        <StatusCard
          eyebrow="时长耗尽"
          title="当前会话需要补充时长"
          description="购买时长包后会立即到账，角色记忆和偏好不会因为时长耗尽而丢失。"
          tone="warning"
          icon={<InfoIcon className="status-card__glyph" />}
          actions={
            <Link to="/ai/packs" className="button button--primary">
              购买时长包
            </Link>
          }
        />
      ) : null}

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
          placeholder={outOfMinutes ? '时长已耗尽，先去购买时长包' : '说点什么，发送会消耗 1 分钟'}
          disabled={outOfMinutes}
          aria-label="聊天输入"
        />
        <button
          type="submit"
          className="button button--primary chat-composer__send"
          disabled={outOfMinutes || !input.trim()}
        >
          发送
        </button>
      </form>

      <section className="detail-actions">
        <Link to="/ai/packs" className="button button--secondary button--block">
          {outOfMinutes ? '去购买时长' : '查看时长权益'}
        </Link>
        <Link to="/ai" className="button button--ghost button--block">
          切换角色
        </Link>
      </section>
    </div>
  )
}
