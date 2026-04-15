import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import { SectionHeader } from '../components/SectionHeader'
import { SeriesCard } from '../components/ContentBlocks'
import { SubPageHeader } from '../components/SubPageHeader'
import { contentDetails, playerStates } from '../data/mockData'

export function ContentDetailPage() {
  const { contentId = '' } = useParams()

  const detail = useMemo(() => {
    return contentDetails[contentId] ?? contentDetails.c1
  }, [contentId])

  const playerState = playerStates[detail.id] ?? playerStates.c1

  return (
    <div className="page page--detail">
      <SubPageHeader title="内容详情" />

      <section className={`detail-hero detail-hero--${detail.tone}`}>
        <div className="detail-hero__cover" />
        <div className="detail-hero__eyebrow">{detail.eyebrow}</div>
        <h1 className="detail-hero__title">{detail.title}</h1>
        <div className="detail-hero__meta">
          主播：{detail.creator} · {detail.duration} · {detail.status}
        </div>
        <div className="detail-tags">
          {detail.tags.map((tag) => (
            <span key={tag} className="detail-tag">
              {tag}
            </span>
          ))}
        </div>
        <p className="detail-hero__description">{detail.description}</p>
      </section>

      <section className="detail-actions">
        <Link to={`/player/${detail.id}`} className="button button--primary button--block">
          试听前 30 秒
        </Link>
        <button type="button" className="button button--secondary button--block">
          {detail.unlockLabel}
        </button>
        <button type="button" className="button button--ghost button--block">
          加入片单
        </button>
      </section>

      <section className="page-section page-section--compact">
        <SectionHeader title="所属系列" />
        <SeriesCard
          title={detail.seriesTitle}
          meta={detail.seriesMeta}
          tone={detail.tone}
        />
      </section>

      <section className="info-card info-card--memory">
        <div className="info-card__label">继续追更</div>
        <p className="info-card__text">
          试听、单集解锁或从系列入口直接追更。
        </p>
        <Link to={`/player/${playerState.contentId}`} className="button button--secondary">
          继续播放
        </Link>
      </section>
    </div>
  )
}
