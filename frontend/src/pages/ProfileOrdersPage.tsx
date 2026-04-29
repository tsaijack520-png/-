import { SubPageHeader } from '../components/SubPageHeader'
import { EmptyState } from '../components/FeedbackBlocks'
import { useMockSession } from '../hooks/useMockSession'

const orderTypeLabelMap = {
  content: '收听记录',
  subscription: '试用记录',
  credit: '试用记录',
  ai: '试用记录',
} as const

export function ProfileOrdersPage() {
  const { isAuthenticated, orders } = useMockSession()
  const visibleOrders = orders.filter((order) => order.type === 'content')

  return (
    <div className="page page--detail">
      <SubPageHeader title="收听记录" />

      <section className="page-section page-section--compact">
        {!isAuthenticated ? (
          <EmptyState title="登录后查看记录" description="登录后可查看你的收听轨迹与解锁过的单集。" />
        ) : visibleOrders.length === 0 ? (
          <EmptyState title="暂时还没有记录" description="完成单集解锁或加入片单后，这里会自动生成记录。" />
        ) : (
          <div className="order-list">
            {visibleOrders.map((order) => (
              <article key={order.id} className="order-card">
                <div>
                  <div className="order-card__title">{order.title}</div>
                  <div className="order-card__meta">
                    {orderTypeLabelMap[order.type]} · {order.createdAt}
                  </div>
                  {order.detail ? <div className="order-card__detail">{order.detail}</div> : null}
                </div>
                <div className="order-card__side">
                  <div className="order-card__status">{order.status}</div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
