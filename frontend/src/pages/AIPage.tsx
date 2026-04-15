import { Link, useNavigate } from 'react-router-dom'

import { PosterCard } from '../components/ContentBlocks'
import { aiHighlights, aiRoleCards } from '../data/mockData'
import { TopBar } from '../components/TopBar'

export function AIPage() {
  const navigate = useNavigate()

  return (
    <div className="page page--ai">
      <TopBar />

      <section className="hero-banner hero-banner--ai">
        <div className="hero-banner__eyebrow">AI 陪伴</div>
        <h1 className="hero-banner__title">选择角色，继续当前会话</h1>
        <p className="hero-banner__subtitle">
          可从最近会话接续，也可切换新的陪伴角色。
        </p>
        <div className="hero-banner__actions">
          <button
            type="button"
            className="button button--primary"
            onClick={() => navigate('/ai/chat/lanlan')}
          >
            继续会话
          </button>
          <Link to="/ai/packs" className="button button--secondary">
            购买时长
          </Link>
        </div>
      </section>

      <section className="ai-overview-card">
        <div>
          <div className="info-card__label">当前可用时长</div>
          <div className="info-card__value">{aiHighlights.remainingMinutes} 分钟</div>
        </div>
        <div className="ai-overview-card__divider" />
        <div className="ai-overview-card__memory">
          <div className="info-card__label">最近记忆</div>
          <p className="info-card__text">{aiHighlights.memory}</p>
        </div>
      </section>

      <section className="page-section page-section--compact">
        <div className="section-header">
          <h2 className="section-header__title">推荐角色</h2>
          <Link to="/ai/packs" className="section-header__action-link">
            时长权益
          </Link>
        </div>
        <div className="ai-role-list">
          {aiRoleCards.map((role) => (
            <button
              key={role.id}
              type="button"
              className={`ai-role-card ai-role-card--${role.tone}`}
              onClick={() => navigate(`/ai/chat/${role.id}`)}
            >
              <div className="ai-role-card__head">
                <div className="ai-role-card__avatar" aria-hidden="true">
                  {role.name.slice(0, 1)}
                </div>
                <div className="ai-role-card__meta">
                  <div className="ai-role-card__name">{role.name}</div>
                  <div className="ai-role-card__subtitle">{role.subtitle}</div>
                </div>
              </div>
              <div className="ai-role-card__relationship">{role.relationship}</div>
              <p className="ai-role-card__intro">{role.intro}</p>
              <div className="ai-role-card__footer">
                <span className="badge">{role.scene}</span>
                <span className="ai-role-card__cta">进入对话</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="page-section page-section--compact">
        <h2 className="section-header__title">你可能会继续听</h2>
        <div className="poster-row">
          {aiRoleCards.map((role) => (
            <PosterCard
              key={role.id}
              title={role.name}
              meta={role.scene}
              badge={role.traits[0]}
              tone={role.tone}
              to={`/ai/chat/${role.id}`}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
