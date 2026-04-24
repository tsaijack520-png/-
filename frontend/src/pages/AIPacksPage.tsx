import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { CheckCircleIcon, WalletIcon } from '../components/Icons'
import { StatusCard } from '../components/FeedbackBlocks'
import { loadAIPacks } from '../data/source'
import { useAppData } from '../hooks/useAppData'
import { useMockSession } from '../hooks/useMockSession'
import { SubPageHeader } from '../components/SubPageHeader'

export function AIPacksPage() {
  const navigate = useNavigate()
  const { aiMinutes, isAuthenticated, purchaseAiPack } = useMockSession()
  const [lastPurchased, setLastPurchased] = useState<string>('')
  const { data } = useAppData(loadAIPacks)
  const packs = data ?? []

  function handlePurchase(packId: string) {
    const pack = packs.find((item) => item.id === packId)

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
        eyebrow="当前余量"
        title={`可用时长 ${aiMinutes} 分钟`}
        description="购买成功后时长立即到账，可回到对话页继续使用。"
        icon={<WalletIcon className="status-card__glyph" />}
      />

      {lastPurchased ? (
        <StatusCard
          eyebrow="购买成功"
          title="时长已到账"
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
        {packs.map((pack) => (
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
              立即购买
            </button>
          </article>
        ))}
      </section>

      <StatusCard
        eyebrow="说明"
        title="购买后立即生效"
        description="时长会累计到当前账号，可在 AI 页面与订单记录中查看。"
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
