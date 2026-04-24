import { Link, useNavigate } from 'react-router-dom'

import { PosterCard } from '../components/ContentBlocks'
import { StatusCard } from '../components/FeedbackBlocks'
import { WalletIcon } from '../components/Icons'
import { loadAIIndex } from '../data/source'
import { useAppData } from '../hooks/useAppData'
import { TopBar } from '../components/TopBar'
import { useMockSession } from '../hooks/useMockSession'

export function AIPage() {
  const navigate = useNavigate()
  const { aiMinutes } = useMockSession()
  const { data } = useAppData(loadAIIndex)

  const roles = data?.roles ?? []
  const primaryRoleId = roles[0]?.id ?? 'lanlan'

  return (
    <div className="page page--ai">
      <TopBar />

      <section className="hero-banner hero-banner--ai">
        <div className="hero-banner__eyebrow">AI 陪伴</div>
        <h1 className="hero-banner__title">选择角色，继续当前会话</h1>
        <p className="hero-banner__subtitle">可从最近会话接续，也可切换新的陪伴角色。</p>
        <div className="hero-banner__actions">
          <button type="button" className="button button--primary" onClick={() => navigate(`/ai/chat/${primaryRoleId}`)}>
            继续会话
          </button>
          <Link to="/ai/packs" className="button button--secondary">
            购买时长
          </Link>
        </div>
      </section>

      <StatusCard
        eyebrow="可用时长"
        title={`${aiMinutes} 分钟`}
        description="每次对话按发送计时，时长不足可随时补充时长包。"
        icon={<WalletIcon className="status-card__glyph" />}
      />

      <section className="page-section page-section--compact">
        <div className="section-header">
          <h2 className="section-header__title">推荐角色</h2>
          <Link to="/ai/packs" className="section-header__action-link">
            时长权益
          </Link>
        </div>
        <div className="ai-role-list">
          {roles.map((role) => (
            <button key={role.id} type="button" className={`ai-role-card ai-role-card--${role.tone}`} onClick={() => navigate(`/ai/chat/${role.id}`)}>
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
          {roles.map((role) => (
            <PosterCard key={role.id} title={role.name} meta={role.scene} badge={role.traits[0]} tone={role.tone} to={`/ai/chat/${role.id}`} />
          ))}
        </div>
      </section>
    </div>
  )
}
