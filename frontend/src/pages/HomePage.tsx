import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  FeatureTile,
  PosterCard,
  SeriesCard,
} from '../components/ContentBlocks'
import { SectionHeader } from '../components/SectionHeader'
import { TopBar } from '../components/TopBar'
import { loadHomeData } from '../data/source'
import { useAppData } from '../hooks/useAppData'

export function HomePage() {
  const { data } = useAppData(loadHomeData)
  const [activeBannerIndex, setActiveBannerIndex] = useState(0)

  const banners = data?.banners ?? []
  const bannerCount = banners.length

  useEffect(() => {
    if (bannerCount <= 1) return
    const timer = window.setInterval(() => {
      setActiveBannerIndex((current) => (current + 1) % bannerCount)
    }, 3600)
    return () => window.clearInterval(timer)
  }, [bannerCount])

  useEffect(() => {
    if (activeBannerIndex >= bannerCount && bannerCount > 0) {
      setActiveBannerIndex(0)
    }
  }, [activeBannerIndex, bannerCount])

  if (!data || bannerCount === 0) {
    return (
      <div className="page page--home">
        <TopBar />
        <section className="page-section">
          <div className="info-card info-card--memory">
            <div className="info-card__label">正在加载</div>
            <p className="info-card__text">首页内容正在加载中。</p>
          </div>
        </section>
      </div>
    )
  }

  const activeBanner = banners[Math.min(activeBannerIndex, bannerCount - 1)]
  const { featureTiles, recommended, featuredSeries } = data

  return (
    <div className="page page--home">
      <TopBar />

      <section className={`hero-banner hero-banner--carousel hero-banner--${activeBanner.tone}`}>
        <div className="hero-banner__brand-badge">运营推荐</div>
        <div className="hero-banner__eyebrow">{activeBanner.eyebrow}</div>
        <h1 className="hero-banner__title">{activeBanner.title}</h1>
        <p className="hero-banner__subtitle">{activeBanner.subtitle}</p>
        <div className="hero-banner__meta">{activeBanner.meta}</div>
        <div className="hero-banner__actions">
          <Link to={activeBanner.primaryAction.to} className="button button--primary">
            {activeBanner.primaryAction.label}
          </Link>
          {activeBanner.secondaryAction ? (
            <Link to={activeBanner.secondaryAction.to} className="button button--secondary">
              {activeBanner.secondaryAction.label}
            </Link>
          ) : null}
        </div>
        <Link to={activeBanner.to} className="hero-banner__tap-target" aria-label={`打开 ${activeBanner.title}`} />
        <div className="hero-banner__pagination" aria-label="首页运营 banner 分页">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              className={
                index === activeBannerIndex
                  ? 'hero-banner__dot hero-banner__dot--active'
                  : 'hero-banner__dot'
              }
              aria-label={`切换到第 ${index + 1} 张 banner`}
              onClick={() => setActiveBannerIndex(index)}
            />
          ))}
        </div>
      </section>

      <section className="page-section">
        <SectionHeader title="ASMR 专区" moreTo="/home/section/asmr" />
        <div className="feature-grid">
          {featureTiles.map((tile) => (
            <FeatureTile
              key={tile.id}
              title={tile.title}
              subtitle={tile.subtitle}
              tone={tile.tone}
              iconKey={tile.iconKey}
              to={tile.to}
            />
          ))}
        </div>
      </section>

      <section className="page-section">
        <SectionHeader title="今日推荐" moreTo="/home/section/recommended" />
        <div className="poster-row">
          {recommended.map((item) => (
            <PosterCard
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

      <section className="page-section page-section--compact">
        <SectionHeader title="连载专区" moreTo="/home/section/series" />
        <div className="series-list">
          {featuredSeries.map((item) => (
            <SeriesCard
              key={item.id}
              title={item.title}
              meta={item.meta}
              tone={item.tone}
              to={item.to}
              coverImageUrl={item.coverImageUrl}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
