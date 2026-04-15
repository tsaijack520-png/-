import { useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { FilterChip, ListCard } from '../components/ContentBlocks'
import { SectionHeader } from '../components/SectionHeader'
import { categoryContents, categoryFilterMeta } from '../data/mockData'
import { SubPageHeader } from '../components/SubPageHeader'

export function CategoryFilterPage() {
  const navigate = useNavigate()
  const { filterType = 'role' } = useParams()
  const [searchParams] = useSearchParams()

  const filter = useMemo(() => {
    return categoryFilterMeta[filterType as keyof typeof categoryFilterMeta] ?? categoryFilterMeta.role
  }, [filterType])

  const rawSelectedTag = searchParams.get(filter.id)
  const selectedTag = rawSelectedTag && filter.options.includes(rawSelectedTag)
    ? rawSelectedTag
    : filter.options[0]

  const previewContents = useMemo(() => {
    return categoryContents.filter((item) => {
      if (filter.id === 'role') {
        return item.role === selectedTag
      }

      if (filter.id === 'scene') {
        return item.scene === selectedTag
      }

      return item.sortTags.includes(selectedTag as (typeof item.sortTags)[number])
    })
  }, [filter.id, selectedTag])

  function handleSelectTag(option: string) {
    navigate(`/category/filter/${filter.id}?${filter.id}=${encodeURIComponent(option)}`, { replace: true })
  }

  function handleApply() {
    navigate(`/category?${filter.id}=${encodeURIComponent(selectedTag)}`)
  }

  return (
    <div className="page page--detail">
      <SubPageHeader title={filter.title} />

      <section className="info-card info-card--memory">
        <div className="info-card__label">筛选说明</div>
        <div className="info-card__value info-card__value--sm">已选 {selectedTag}</div>
        <p className="info-card__text">{filter.description}</p>
      </section>

      <section className="page-section page-section--compact">
        <SectionHeader title="可选标签" actionLabel="" />
        <div className="chip-row">
          {filter.options.map((option) => (
            <FilterChip
              key={option}
              label={option}
              active={selectedTag === option}
              onClick={() => handleSelectTag(option)}
            />
          ))}
        </div>
      </section>

      <section className="page-section page-section--compact">
        <SectionHeader title="关联内容" actionLabel="" />
        <div className="list-stack">
          {previewContents.map((item) => (
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

      <button type="button" className="button button--primary button--block" onClick={handleApply}>
        应用到分类页
      </button>
    </div>
  )
}
