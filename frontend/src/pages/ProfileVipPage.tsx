import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AppleIcon, CheckCircleIcon, WalletIcon } from '../components/Icons'
import { StatusCard } from '../components/FeedbackBlocks'
import { SubPageHeader } from '../components/SubPageHeader'
import { useMockSession } from '../hooks/useMockSession'
import { vipCreditPacks, vipSubscriptionPlans } from '../data/mockData'
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
      return '登录后即可查看会员状态、点数余额与 Apple 风格的购买结果。'
    }

    if (subscriptionActive) {
      return `当前会员有效期至 ${expiresAt ?? '待同步'}，账户内剩余 ${creditBalance} 点。`
    }

    return `当前未开通会员，账户内剩余 ${creditBalance} 点，可先体验轻量转化路径。`
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

      <StatusCard
        eyebrow="本期交易策略"
        title="先验证转化，不接真实支付"
        description="当前会员与点数购买采用 Apple 内购风格演示，重点是让用户理解权益价值与到账反馈，不强化复杂支付心智。"
        tone="warning"
        icon={<AppleIcon className="status-card__glyph" />}
      />

      <section className="page-section page-section--compact">
        <div className="section-header">
          <h2 className="section-header__title">订阅套餐</h2>
        </div>
        <div className="pack-list">
          {vipSubscriptionPlans.map((plan) => (
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
                {subscriptionActive ? '继续续费' : '使用 Apple 风格开通'}
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
          {vipCreditPacks.map((plan) => (
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
                使用 Apple 风格充值
              </button>
            </article>
          ))}
        </div>
      </section>

      {purchaseFeedback ? (
        <StatusCard
          eyebrow="购买成功"
          title="Apple 风格到账已完成"
          description={purchaseFeedback}
          tone="success"
          icon={<CheckCircleIcon className="status-card__glyph" />}
          actions={
            <Link to="/me/orders" className="button button--secondary">
              查看订单
            </Link>
          }
        />
      ) : (
        <StatusCard
          eyebrow="到账表现"
          title="购买成功后立即同步权益"
          description="会员状态、点数余额与订单记录都会立即刷新，便于继续浏览内容详情或 AI 陪伴页面。"
          tone="success"
          icon={<CheckCircleIcon className="status-card__glyph" />}
        />
      )}
    </div>
  )
}
