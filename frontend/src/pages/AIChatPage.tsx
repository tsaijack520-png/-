import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { StatusCard } from '../components/FeedbackBlocks'
import { InfoIcon, WalletIcon } from '../components/Icons'
import { SubPageHeader } from '../components/SubPageHeader'
import { aiChatSessions, aiRoleCards } from '../data/mockData'
import { useMockSession } from '../hooks/useMockSession'
import type { AIMessageItem } from '../types/app'

const aiReplyPool: Record<string, string[]> = {
  lanlan: [
    '嗯，我听到了。你先深呼吸一下，不用急着说完。',
    '今天是真的辛苦了，把耳机戴好，我陪你慢慢把今天放下。',
    '没事的，我们不赶时间。想停一会儿就停一会儿。',
    '我给你一段安静的呼吸节奏，吸气 4 秒，吐气 6 秒，跟我一起。',
  ],
  chenxi: [
    '收到，先把今晚收个口，明天我会用最轻的方式把你叫起来。',
    '我帮你把明天最重要的三件事记下，到时候我挨个提醒你。',
    '先别焦虑，我们现在只需要做一件事：把睡觉这件事排第一。',
    '醒来的第一句话我已经想好啦——"今天也只做你撑得住的事"。',
  ],
  jiuce: [
    '你来晚了。不过没关系，现在到我这里，其他的事先放一边。',
    '今晚不许再想那些让你烦的事，听见没？',
    '来，先叫我一声，我再继续陪你把今晚过完。',
    '我看你又忍了很久。没事，现在你只用负责听我说。',
  ],
}

function createMessage(speaker: AIMessageItem['speaker'], text: string): AIMessageItem {
  return {
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    speaker,
    text,
  }
}

export function AIChatPage() {
  const navigate = useNavigate()
  const { aiMinutes, consumeAiMinutes, isAuthenticated } = useMockSession()
  const { roleId = 'lanlan' } = useParams()

  const session = useMemo(() => {
    return aiChatSessions[roleId] ?? aiChatSessions.lanlan
  }, [roleId])

  const role = useMemo(() => {
    return aiRoleCards.find((item) => item.id === session.roleId) ?? aiRoleCards[0]
  }, [session.roleId])

  const replyPool = useMemo(() => {
    return aiReplyPool[session.roleId] ?? aiReplyPool.lanlan
  }, [session.roleId])

  const [messages, setMessages] = useState<AIMessageItem[]>(session.messages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [, setReplyIndex] = useState(0)
  const [syncedRoleId, setSyncedRoleId] = useState(session.roleId)
  const threadEndRef = useRef<HTMLDivElement | null>(null)
  const replyTimerRef = useRef<number | null>(null)

  if (syncedRoleId !== session.roleId) {
    setSyncedRoleId(session.roleId)
    setMessages(session.messages)
    setInput('')
    setIsTyping(false)
    setReplyIndex(0)
  }

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, isTyping])

  useEffect(() => {
    return () => {
      if (replyTimerRef.current !== null) {
        window.clearTimeout(replyTimerRef.current)
      }
    }
  }, [])

  const outOfMinutes = aiMinutes <= 0
  const lowMinutesWarning = aiMinutes > 0 && aiMinutes <= 3

  const scheduleReply = useCallback(() => {
    if (replyTimerRef.current !== null) {
      window.clearTimeout(replyTimerRef.current)
    }

    setIsTyping(true)
    replyTimerRef.current = window.setTimeout(() => {
      setReplyIndex((prevIndex) => {
        const replyText = replyPool[prevIndex % replyPool.length]
        setMessages((prev) => [...prev, createMessage('ai', replyText)])
        return prevIndex + 1
      })
      setIsTyping(false)
      replyTimerRef.current = null
    }, 900)
  }, [replyPool])

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

      setMessages((prev) => [...prev, createMessage('user', text)])
      setInput('')
      consumeAiMinutes(1)
      scheduleReply()
    },
    [consumeAiMinutes, isAuthenticated, navigate, outOfMinutes, scheduleReply],
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
        eyebrow="当前会话时长"
        title={`${aiMinutes} 分钟可用`}
        description={
          outOfMinutes
            ? 'AI 时长已经用完，购买一份时长包就能继续当前会话，之前的记忆依旧保留。'
            : lowMinutesWarning
              ? '剩余时长不多了，再聊几轮就要消耗完，可以顺手看看时长包避免被打断。'
              : 'AI 会话当前优先服务陪伴体验与后续转化，每次发送会消耗 1 分钟演示用时长。'
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
