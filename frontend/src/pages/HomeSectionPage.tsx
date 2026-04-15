import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { ListCard } from '../components/ContentBlocks'
import { SectionHeader } from '../components/SectionHeader'
import {
  categoryContents,
  homeSectionContentIds,
  homeSectionMeta,
  recommendedContents,
} from '../data/mockData'
import { SubPageHeader } from '../components/SubPageHeader'

const allContents = [...recommendedContents, ...categoryContents]

export function HomeSectionPage() {
  const { sectionId = 'asmr' } = useParams()

  const section = useMemo(() => {
    return homeSectionMeta[sectionId as keyof typeof homeSectionMeta] ?? homeSectionMeta.asmr
  }, [sectionId])

  const contents = useMemo(() => {
    const ids = homeSectionContentIds[section.id]

    return ids
      .map((id) => allContents.find((item) => item.id === id))
      .filter((item): item is (typeof allContents)[number] => Boolean(item))
  }, [section.id])

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
            />
          ))}
        </div>
      </section>
    </div>
  )
}
