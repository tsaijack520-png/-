import { useCallback } from 'react'
import { useParams } from 'react-router-dom'

import { ListCard } from '../components/ContentBlocks'
import { SectionHeader } from '../components/SectionHeader'
import { SubPageHeader } from '../components/SubPageHeader'
import { loadHomeSection } from '../data/source'
import { useAppData } from '../hooks/useAppData'
import type { HomeSectionId } from '../types/app'

export function HomeSectionPage() {
  const { sectionId = 'asmr' } = useParams()
  const normalized: HomeSectionId =
    sectionId === 'asmr' || sectionId === 'recommended' || sectionId === 'series' ? sectionId : 'asmr'

  const loader = useCallback(() => loadHomeSection(normalized), [normalized])
  const { data } = useAppData(loader, [normalized])

  if (!data) {
    return (
      <div className="page page--detail">
        <SubPageHeader title="加载中" />
      </div>
    )
  }

  const { section, contents } = data

  return (
    <div className="page page--detail">
      <SubPageHeader title={section.title} />

      <section className="info-card info-card--memory">
        <div className="info-card__label">模块说明</div>
        <div className="info-card__value info-card__value--sm">{section.title}</div>
        <p className="info-card__text">{section.description}</p>
      </section>

      <section className="page-section page-section--compact">
        <SectionHeader title="完整列表" actionLabel="" />
        <div className="list-stack">
          {contents.map((item) => (
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
