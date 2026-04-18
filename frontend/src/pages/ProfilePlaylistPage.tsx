import { Link } from 'react-router-dom'

import { EmptyState } from '../components/FeedbackBlocks'
import { SubPageHeader } from '../components/SubPageHeader'
import { useMockSession } from '../hooks/useMockSession'

export function ProfilePlaylistPage() {
  const { playlistItems } = useMockSession()

  return (
    <div className="page page--detail">
      <SubPageHeader title="我的片单" />

      <section className="page-section page-section--compact">
        {playlistItems.length === 0 ? (
          <EmptyState
            title="你的片单还是空的"
            description="先去详情页把喜欢的内容加入片单，后续从这里直接继续收听。"
            action={
              <Link to="/" className="button button--secondary">
                去首页看看
              </Link>
            }
          />
        ) : (
          <div className="list-stack">
            {playlistItems.map((item) => (
              <Link key={item.id} to={item.to ?? '/'} className="list-card-link">
                <article className={`list-card tone-card tone-card--${item.tone}`}>
                  <div
                    className="list-card__cover"
                    style={
                      item.coverImageUrl
                        ? {
                            backgroundImage: `url(${item.coverImageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : undefined
                    }
                  />
                  <div className="list-card__body">
                    <div className="list-card__title">{item.title}</div>
                    <div className="list-card__meta">{item.subtitle}</div>
                  </div>
                  <div className="list-card__side">
                    <span className={`badge ${item.badgeTone === 'vip' ? 'badge--vip' : ''}`}>{item.badge ?? '查看'}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
