import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ListCard } from '../components/ContentBlocks'
import { SubPageHeader } from '../components/SubPageHeader'
import { loadAnchor } from '../data/source'
import { useAppData } from '../hooks/useAppData'

export function AnchorPage() {
  const { anchorId = '' } = useParams()

  const loader = useCallback(() => loadAnchor(anchorId), [anchorId])
  const { data } = useAppData(loader, [anchorId])

  if (!data) {
    return (
      <div className="page page--detail">
        <SubPageHeader title="主播主页" />
      </div>
    )
  }

  const { profile: anchor, contents: anchorContents } = data

  return (
    <div className="page page--detail">
      <SubPageHeader title="主播主页" />

      <section className={`detail-hero detail-hero--${anchor.tone}`}>
        <div
          className="detail-hero__cover"
          style={
            anchor.coverImageUrl
              ? {
                  backgroundImage: `url(${anchor.coverImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        />
        <div className="detail-hero__eyebrow">{anchor.followerLabel} · {anchor.scheduleLabel}</div>
        <h1 className="detail-hero__title">{anchor.name}</h1>
        <div className="detail-hero__meta">{anchor.tagline}</div>
        <div className="detail-tags">
          {anchor.tags.map((tag) => (
            <span key={tag} className="detail-tag">
              {tag}
            </span>
          ))}
        </div>
        <p className="detail-hero__description">{anchor.intro}</p>
      </section>

      <section className="info-card info-card--memory">
        <div className="info-card__label">本周动态</div>
        <div className="info-card__value info-card__value--sm">{anchor.updateNote}</div>
        <p className="info-card__text">可先从代表内容进入，再按系列继续浏览该主播的更新。</p>
      </section>

      <section className="page-section page-section--compact">
        <div className="section-header">
          <h2 className="section-header__title">代表内容</h2>
          <Link to="/home/section/recommended" className="section-header__action-link">
            看更多推荐
          </Link>
        </div>
        <div className="list-stack">
          {anchorContents.map((item) => (
            <ListCard
              key={item.id}
              title={item.title}
              meta={item.meta}
              badge={item.badge}
              badgeTone={item.badgeTone}
              tone={item.tone}
              to={`/content/${item.id}`}
              coverImageUrl={item.coverImageUrl}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
