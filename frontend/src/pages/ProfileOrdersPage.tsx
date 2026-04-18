import { SubPageHeader } from '../components/SubPageHeader'
import { EmptyState, StatusCard } from '../components/FeedbackBlocks'
import { CheckCircleIcon } from '../components/Icons'
import { useMockSession } from '../hooks/useMockSession'

const orderTypeLabelMap = {
  subscription: '会员订阅',
  credit: '点数充值',
  content: '单集解锁',
  ai: 'AI 时长',
} as const

export function ProfileOrdersPage() {
  const { isAuthenticated, orders } = useMockSession()

  return (
    <div className="page page--detail">
      <SubPageHeader title="订单记录" />

      <StatusCard
        eyebrow="订单说明"
        title="统一展示轻量转化结果"
        description="耳边当前是引流产品，所以这里只强调订单到账、权益同步与后续回访，不延展复杂售后和重交易流程。"
        icon={<CheckCircleIcon className="status-card__glyph" />}
      />

      <section className="page-section page-section--compact">
        {!isAuthenticated ? (
          <EmptyState title="登录后查看订单" description="登录后可查看单集解锁、AI 时长与会员体验记录。" />
        ) : orders.length === 0 ? (
          <EmptyState title="暂时还没有订单" description="当你完成单集解锁、会员体验或 AI 时长购买后，这里会自动生成记录。" />
        ) : (
          <div className="order-list">
            {orders.map((order) => (
              <article key={order.id} className="order-card">
                <div>
                  <div className="order-card__title">{order.title}</div>
                  <div className="order-card__meta">
                    {orderTypeLabelMap[order.type]} · {order.createdAt}
                  </div>
                  {order.detail ? <div className="order-card__detail">{order.detail}</div> : null}
                </div>
                <div className="order-card__side">
                  <div className="order-card__amount">{order.amount}</div>
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
