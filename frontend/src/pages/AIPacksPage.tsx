import { Link } from 'react-router-dom'

import { aiPacks } from '../data/mockData'
import { SubPageHeader } from '../components/SubPageHeader'

export function AIPacksPage() {
  return (
    <div className="page page--detail page--ai-packs">
      <SubPageHeader title="AI 时长包" />

      <section className="hero-banner hero-banner--ai">
        <div className="hero-banner__eyebrow">AI 时长</div>
        <h1 className="hero-banner__title">补充时长，继续收听或陪伴</h1>
        <p className="hero-banner__subtitle">
          选择合适的时长包，当前角色会话可直接续用。
        </p>
      </section>

      <section className="pack-list">
        {aiPacks.map((pack) => (
          <article
            key={pack.id}
            className={pack.recommended ? 'pack-card pack-card--recommended' : 'pack-card'}
          >
            <div className="pack-card__head">
              <div>
                <div className="pack-card__title">{pack.title}</div>
                <div className="pack-card__minutes">{pack.minutes} 分钟</div>
              </div>
              <div className="pack-card__price">{pack.price}</div>
            </div>
            <p className="pack-card__description">{pack.description}</p>
            {pack.bonus ? <div className="pack-card__bonus">{pack.bonus}</div> : null}
            <button type="button" className="button button--primary button--block">
              立即购买
            </button>
          </article>
        ))}
      </section>

      <section className="info-card info-card--memory">
        <div className="info-card__label">使用说明</div>
        <p className="info-card__text">
          时长优先用于当前角色会话，购买后立即生效。
        </p>
      </section>

      <Link to="/ai" className="button button--ghost button--block">
        返回角色页
      </Link>
    </div>
  )
}
