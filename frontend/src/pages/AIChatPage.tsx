import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { SubPageHeader } from '../components/SubPageHeader'
import { aiChatSessions, aiRoleCards } from '../data/mockData'

export function AIChatPage() {
  const navigate = useNavigate()
  const { roleId = 'lanlan' } = useParams()

  const session = useMemo(() => {
    return aiChatSessions[roleId] ?? aiChatSessions.lanlan
  }, [roleId])

  const role = useMemo(() => {
    return aiRoleCards.find((item) => item.id === session.roleId) ?? aiRoleCards[0]
  }, [session.roleId])

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

      <section className="ai-session-strip">
        <div>
          <div className="info-card__label">剩余时长</div>
          <div className="info-card__value info-card__value--sm">{session.remainingMinutes} 分钟</div>
        </div>
        <button type="button" className="button button--secondary" onClick={() => navigate('/ai/packs')}>
          购买时长
        </button>
      </section>

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
          <button type="button" className="section-header__action">
            语音中
          </button>
        </div>
        <div className="chat-thread">
          {session.messages.map((message) => (
            <div
              key={message.id}
              className={
                message.speaker === 'ai' ? 'chat-bubble chat-bubble--ai' : 'chat-bubble chat-bubble--user'
              }
            >
              {message.text}
            </div>
          ))}
        </div>
      </section>

      <section className="page-section page-section--compact">
        <div className="section-header">
          <h2 className="section-header__title">推荐开场</h2>
        </div>
        <div className="starter-prompt-list">
          {session.starterPrompts.map((prompt) => (
            <button key={prompt} type="button" className="starter-prompt">
              {prompt}
            </button>
          ))}
        </div>
      </section>

      <section className="detail-actions">
        <Link to="/ai/packs" className="button button--primary button--block">
          时长不足，去购买
        </Link>
        <Link to="/ai" className="button button--ghost button--block">
          切换角色
        </Link>
      </section>
    </div>
  )
}
