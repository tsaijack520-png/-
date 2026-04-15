import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ListCard } from '../components/ContentBlocks'
import { SubPageHeader } from '../components/SubPageHeader'
import { anchorProfiles, categoryContents, recommendedContents } from '../data/mockData'

const allContents = [...recommendedContents, ...categoryContents]

export function AnchorPage() {
  const { anchorId = '' } = useParams()

  const anchor = useMemo(() => {
    return anchorProfiles[anchorId] ?? anchorProfiles['anchor-xiaoduo']
  }, [anchorId])

  const anchorContents = useMemo(() => {
    return anchor.featuredContentIds
      .map((id) => allContents.find((item) => item.id === id))
      .filter((item): item is (typeof allContents)[number] => Boolean(item))
  }, [anchor])

  return (
    <div className="page page--detail">
      <SubPageHeader title="主播主页" />

      <section className={`detail-hero detail-hero--${anchor.tone}`}>
        <div className="detail-hero__cover" />
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
            />
          ))}
        </div>
      </section>
    </div>
  )
}
