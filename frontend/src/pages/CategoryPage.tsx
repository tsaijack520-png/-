import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  roleFilters,
  sceneFilters,
  sortFilters,
} from '../data/mockData'
import { loadCategoryContents } from '../data/source'
import { useAppData } from '../hooks/useAppData'
import { FilterChip, ListCard } from '../components/ContentBlocks'
import { EmptyState } from '../components/FeedbackBlocks'
import { SectionHeader } from '../components/SectionHeader'
import { TopBar } from '../components/TopBar'

export function CategoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const roleParam = searchParams.get('role')
  const sceneParam = searchParams.get('scene')
  const sortParam = searchParams.get('sort')

  const { data } = useAppData(loadCategoryContents)
  const contents = data ?? []

  const activeRole = roleFilters.includes(roleParam as (typeof roleFilters)[number])
    ? (roleParam as (typeof roleFilters)[number])
    : '女友音'
  const activeScene = sceneFilters.includes(sceneParam as (typeof sceneFilters)[number])
    ? (sceneParam as (typeof sceneFilters)[number])
    : '睡前陪伴'
  const activeSort = sortFilters.includes(sortParam as (typeof sortFilters)[number])
    ? (sortParam as (typeof sortFilters)[number])
    : '最热'

  const filteredContents = useMemo(() => {
    return contents.filter((item) => {
      const roleMatch = item.role === activeRole
      const sceneMatch = item.scene === activeScene
      const sortMatch = item.sortTags.includes(activeSort)
      return roleMatch && sceneMatch && sortMatch
    })
  }, [contents, activeRole, activeScene, activeSort])

  const hasMatches = filteredContents.length > 0

  function updateFilter(key: 'role' | 'scene' | 'sort', value: string) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set(key, value)
    setSearchParams(nextParams)
  }

  function resetFilters() {
    setSearchParams(new URLSearchParams())
  }

  return (
    <div className="page">
      <TopBar />

      <section className="page-section page-section--compact">
        <SectionHeader title="角色标签" moreTo="/category/filter/role" />
        <div className="chip-row">
          {roleFilters.map((label) => (
            <FilterChip
              key={label}
              label={label}
              active={label === activeRole}
              onClick={() => updateFilter('role', label)}
            />
          ))}
        </div>
      </section>

      <section className="page-section page-section--compact">
        <SectionHeader title="场景标签" moreTo="/category/filter/scene" />
        <div className="chip-row">
          {sceneFilters.map((label) => (
            <FilterChip
              key={label}
              label={label}
              active={label === activeScene}
              onClick={() => updateFilter('scene', label)}
            />
          ))}
        </div>
      </section>

      <section className="page-section page-section--compact">
        <SectionHeader title="排序筛选" moreTo="/category/filter/sort" />
        <div className="chip-row">
          {sortFilters.map((label) => (
            <FilterChip
              key={label}
              label={label}
              active={label === activeSort}
              onClick={() => updateFilter('sort', label)}
            />
          ))}
        </div>
      </section>

      <section className="page-section page-section--compact">
        <SectionHeader title="匹配内容" actionLabel="" />
        {hasMatches ? (
          <div className="list-stack">
            {filteredContents.map((item) => (
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
        ) : (
          <EmptyState
            title="当前筛选没有匹配内容"
            description="这个声线 × 场景 × 排序的组合暂时没有内容，可以换一个筛选或清空后重新浏览。"
            action={
              <button type="button" className="button button--secondary" onClick={resetFilters}>
                清空筛选
              </button>
            }
          />
        )}
      </section>
    </div>
  )
}
