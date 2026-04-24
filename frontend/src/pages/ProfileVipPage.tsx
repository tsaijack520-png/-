import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { CheckCircleIcon, WalletIcon } from '../components/Icons'
import { StatusCard } from '../components/FeedbackBlocks'
import { SubPageHeader } from '../components/SubPageHeader'
import { loadVipPlans } from '../data/source'
import { useAppData } from '../hooks/useAppData'
import { useMockSession } from '../hooks/useMockSession'
import type { VipPlan } from '../types/app'

export function ProfileVipPage() {
  const navigate = useNavigate()
  const {
    isAuthenticated,
    purchaseCreditPack,
    purchaseVipPlan,
    user,
  } = useMockSession()
  const [purchaseFeedback, setPurchaseFeedback] = useState<string>('')
  const { data } = useAppData(loadVipPlans)

  const subscriptions = data?.subscriptions ?? []
  const credits = data?.credits ?? []

  function handlePurchaseVip(plan: VipPlan) {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }

    const result = purchaseVipPlan(plan)
    if (result.ok) {
      setPurchaseFeedback(`${plan.title} · ${plan.price} 已到账${plan.bonus ? `，${plan.bonus}` : ''}`)
    }
  }

  function handlePurchaseCredit(plan: VipPlan) {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }

    const result = purchaseCreditPack(plan)
    if (result.ok) {
      setPurchaseFeedback(`${plan.title} · ${plan.price} 已到账，${plan.bonus ?? ''}`)
    }
  }

  const activeUser = user
  const subscriptionActive = activeUser?.vipStatus.subscriptionActive ?? false
  const creditBalance = activeUser?.vipStatus.creditBalance ?? 0
  const expiresAt = activeUser?.vipStatus.expiresAt

  const statusDescription = useMemo(() => {
    if (!isAuthenticated) {
      return '登录后可查看会员状态、点数余额与订阅权益。'
    }

    if (subscriptionActive) {
      return `会员有效期至 ${expiresAt ?? '待同步'}，账户内剩余 ${creditBalance} 点。`
    }

    return `当前未开通会员，账户内剩余 ${creditBalance} 点。`
  }, [creditBalance, expiresAt, isAuthenticated, subscriptionActive])

  return (
    <div className="page page--detail">
      <SubPageHeader title="VIP 会员" />

      <StatusCard
        eyebrow="会员状态"
        title={subscriptionActive ? '已开通订阅会员' : '未开通订阅会员'}
        description={statusDescription}
        icon={<WalletIcon className="status-card__glyph" />}
      />

      <section className="page-section page-section--compact">
        <div className="section-header">
          <h2 className="section-header__title">订阅套餐</h2>
        </div>
        <div className="pack-list">
          {subscriptions.map((plan) => (
            <article key={plan.id} className={plan.recommended ? 'pack-card pack-card--recommended' : 'pack-card'}>
              <div className="pack-card__head">
                <div>
                  <div className="pack-card__title">{plan.title}</div>
                  <div className="pack-card__minutes">{plan.recommended ? '推荐开通' : '标准订阅'}</div>
                </div>
                <div className="pack-card__price">{plan.price}</div>
              </div>
              <p className="pack-card__description">{plan.desc}</p>
              {plan.bonus ? <div className="pack-card__bonus">{plan.bonus}</div> : null}
              <button type="button" className="button button--primary button--block" onClick={() => handlePurchaseVip(plan)}>
                {subscriptionActive ? '续费' : '立即开通'}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section page-section--compact">
        <div className="section-header">
          <h2 className="section-header__title">点数充值</h2>
        </div>
        <div className="pack-list">
          {credits.map((plan) => (
            <article key={plan.id} className={plan.recommended ? 'pack-card pack-card--recommended' : 'pack-card'}>
              <div className="pack-card__head">
                <div>
                  <div className="pack-card__title">{plan.title}</div>
                  <div className="pack-card__minutes">{plan.bonus}</div>
                </div>
                <div className="pack-card__price">{plan.price}</div>
              </div>
              <p className="pack-card__description">{plan.desc}</p>
              <button type="button" className="button button--secondary button--block" onClick={() => handlePurchaseCredit(plan)}>
                立即充值
              </button>
            </article>
          ))}
        </div>
      </section>

      {purchaseFeedback ? (
        <StatusCard
          eyebrow="购买成功"
          title="权益已到账"
          description={purchaseFeedback}
          tone="success"
          icon={<CheckCircleIcon className="status-card__glyph" />}
          actions={
            <Link to="/me/orders" className="button button--secondary">
              查看订单
            </Link>
          }
        />
      ) : null}
    </div>
  )
}
