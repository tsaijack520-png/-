import { ListCard } from '../components/ContentBlocks'
import { SubPageHeader } from '../components/SubPageHeader'
import { profilePlaylistAllItems } from '../data/mockData'

export function ProfilePlaylistPage() {
  return (
    <div className="page page--detail">
      <SubPageHeader title="我的片单" />

      <section className="page-section page-section--compact">
        <div className="list-stack">
          {profilePlaylistAllItems.map((item) => (
            <ListCard
              key={item.id}
              title={item.title}
              meta={item.subtitle}
              badge={item.badge ?? '查看'}
              badgeTone={item.badgeTone}
              tone={item.tone}
              to={item.to}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
