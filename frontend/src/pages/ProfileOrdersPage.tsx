import { SubPageHeader } from '../components/SubPageHeader'
import { mockOrders } from '../data/mockData'

export function ProfileOrdersPage() {
  return (
    <div className="page page--detail">
      <SubPageHeader title="订单记录" />

      <section className="page-section page-section--compact">
        <div className="order-list">
          {mockOrders.map((order) => (
            <article key={order.id} className="order-card">
              <div>
                <div className="order-card__title">{order.title}</div>
                <div className="order-card__meta">
                  {order.type} · {order.createdAt}
                </div>
              </div>
              <div className="order-card__side">
                <div className="order-card__amount">{order.amount}</div>
                <div className="order-card__status">{order.status}</div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
