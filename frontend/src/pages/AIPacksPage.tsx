import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { AppleIcon, CheckCircleIcon } from '../components/Icons'
import { StatusCard } from '../components/FeedbackBlocks'
import { aiPacks } from '../data/mockData'
import { useMockSession } from '../hooks/useMockSession'
import { SubPageHeader } from '../components/SubPageHeader'

export function AIPacksPage() {
  const navigate = useNavigate()
  const { aiMinutes, isAuthenticated, purchaseAiPack } = useMockSession()
  const [lastPurchased, setLastPurchased] = useState<string>('')

  function handlePurchase(packId: string) {
    const pack = aiPacks.find((item) => item.id === packId)

    if (!pack) {
      return
    }

    if (!isAuthenticated) {
      navigate('/auth')
      return
    }

    const result = purchaseAiPack(pack)
    if (result.ok) {
      setLastPurchased(`${pack.title} · 已入账 ${pack.minutes} 分钟${pack.bonus ? `（${pack.bonus}）` : ''}`)
    }
  }

  return (
    <div className="page page--detail page--ai-packs">
      <SubPageHeader title="AI 时长包" />

      <section className="hero-banner hero-banner--ai">
        <div className="hero-banner__eyebrow">AI 时长</div>
        <h1 className="hero-banner__title">补充时长，继续收听或陪伴</h1>
        <p className="hero-banner__subtitle">选择合适的时长包，当前角色会话可直接续用。</p>
      </section>

      <StatusCard
        eyebrow="当前策略"
        title={`可用时长 ${aiMinutes} 分钟`}
        description="这里采用 Apple 内购风格反馈：先承接转化意愿，再让用户理解时长到账与继续使用。"
        icon={<AppleIcon className="status-card__glyph" />}
      />

      {lastPurchased ? (
        <StatusCard
          eyebrow="购买成功"
          title="Apple 风格到账已完成"
          description={lastPurchased}
          tone="success"
          icon={<CheckCircleIcon className="status-card__glyph" />}
          actions={
            <Link to="/ai" className="button button--primary">
              返回角色继续聊
            </Link>
          }
        />
      ) : null}

      <section className="pack-list">
        {aiPacks.map((pack) => (
          <article key={pack.id} className={pack.recommended ? 'pack-card pack-card--recommended' : 'pack-card'}>
            <div className="pack-card__head">
              <div>
                <div className="pack-card__title">{pack.title}</div>
                <div className="pack-card__minutes">{pack.minutes} 分钟</div>
              </div>
              <div className="pack-card__price">{pack.price}</div>
            </div>
            <p className="pack-card__description">{pack.description}</p>
            {pack.bonus ? <div className="pack-card__bonus">{pack.bonus}</div> : null}
            <button type="button" className="button button--primary button--block" onClick={() => handlePurchase(pack.id)}>
              使用 Apple 风格购买
            </button>
          </article>
        ))}
      </section>

      <StatusCard
        eyebrow="到账结果"
        title="购买后立即生效"
        description="成功后会把时长直接累计到当前账号，并在 AI 页面与订单记录中同步展示。"
        tone="success"
        icon={<CheckCircleIcon className="status-card__glyph" />}
        actions={
          <>
            <Link to="/me/orders" className="button button--secondary">
              查看订单
            </Link>
            <Link to="/ai" className="button button--ghost">
              返回角色页
            </Link>
          </>
        }
      />
    </div>
  )
}
