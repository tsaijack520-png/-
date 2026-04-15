import { useMemo } from 'react'

import { SubPageHeader } from '../components/SubPageHeader'
import { mockUsers, vipCreditPacks, vipSubscriptionPlans } from '../data/mockData'
import { useMockSession } from '../hooks/useMockSession'

export function ProfileVipPage() {
  const { user } = useMockSession()

  const activeUser = user ?? mockUsers.listener
  const activeVipStatus = activeUser.vipStatus
  const subscriptionActive = activeVipStatus.subscriptionActive

  const displayStatus = useMemo(() => {
    if (subscriptionActive) {
      return {
        expiresAt: activeVipStatus.expiresAt ?? '2026-08-18',
        creditBalance: activeVipStatus.creditBalance,
      }
    }

    return {
      expiresAt: undefined,
      creditBalance: activeVipStatus.creditBalance,
    }
  }, [activeVipStatus.creditBalance, activeVipStatus.expiresAt, subscriptionActive])

  return (
    <div className="page page--detail">
      <SubPageHeader title="VIP 会员" />

      <section className="info-card info-card--memory">
        <div className="info-card__label">当前会员状态</div>
        <div className="info-card__value info-card__value--sm">{subscriptionActive ? '已开通订阅会员' : '未开通订阅会员'}</div>
        <p className="info-card__text">
          {subscriptionActive
            ? `当前到期时间 ${displayStatus.expiresAt}，剩余点数 ${displayStatus.creditBalance} 点。`
            : `当前可用点数 ${displayStatus.creditBalance} 点，可直接充值或先开通订阅。`}
        </p>
      </section>

      {subscriptionActive ? (
        <section className="page-section page-section--compact">
          <div className="section-header">
            <h2 className="section-header__title">续费与充值</h2>
          </div>
          <div className="pack-list">
            {vipSubscriptionPlans.map((plan) => (
              <article key={plan.id} className={plan.recommended ? 'pack-card pack-card--recommended' : 'pack-card'}>
                <div className="pack-card__head">
                  <div>
                    <div className="pack-card__title">{plan.title}</div>
                    <div className="pack-card__minutes">到期后自动续上</div>
                  </div>
                  <div className="pack-card__price">{plan.price}</div>
                </div>
                <p className="pack-card__description">{plan.desc}</p>
                {plan.bonus ? <div className="pack-card__bonus">{plan.bonus}</div> : null}
                <button type="button" className="button button--primary button--block">
                  继续续费
                </button>
              </article>
            ))}
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
                <button type="button" className="button button--secondary button--block">
                  充值点数
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <>
          <section className="page-section page-section--compact">
            <div className="section-header">
              <h2 className="section-header__title">订阅权益</h2>
            </div>
            <ul className="vip-rights-list">
              <li>会员内容可直接收听</li>
              <li>连载专区优先解锁更新</li>
              <li>AI 时长与点数购买享更优价格</li>
            </ul>
          </section>

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
                  <button type="button" className="button button--primary button--block">
                    开通此套餐
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
                  <button type="button" className="button button--secondary button--block">
                    充值点数
                  </button>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
