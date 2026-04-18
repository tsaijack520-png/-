import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { SeriesCard } from '../components/ContentBlocks'
import { CheckCircleIcon, AppleIcon, LockIcon } from '../components/Icons'
import { StatusCard } from '../components/FeedbackBlocks'
import { SectionHeader } from '../components/SectionHeader'
import { SubPageHeader } from '../components/SubPageHeader'
import { contentDetails, playerStates } from '../data/mockData'
import { useMockSession } from '../hooks/useMockSession'

export function ContentDetailPage() {
  const navigate = useNavigate()
  const { contentId = '' } = useParams()
  const { isAuthenticated, addPlaylistItem, hasUnlockedContent, unlockContent, user } = useMockSession()
  const [playlistMessage, setPlaylistMessage] = useState('')
  const [paymentState, setPaymentState] = useState<'idle' | 'pending' | 'success' | 'exists'>('idle')

  const detail = useMemo(() => {
    return contentDetails[contentId] ?? contentDetails.c1
  }, [contentId])

  const playerState = playerStates[detail.id] ?? playerStates.c1
  const unlocked = hasUnlockedContent(detail.id)
  const needsVip = detail.unlockLabel.includes('VIP')
  const actionLabel = unlocked ? '已解锁，可直接收听' : detail.unlockLabel

  function handleAddPlaylist() {
    const result = addPlaylistItem(detail)
    setPlaylistMessage(result === 'added' ? '已加入片单，回访时可继续找到这条内容。' : '这条内容已经在你的片单里了。')
  }

  function handleUnlock() {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }

    if (needsVip) {
      navigate('/me/vip')
      return
    }

    setPaymentState('pending')
    window.setTimeout(() => {
      const result = unlockContent(detail)
      if (result.ok) {
        setPaymentState('success')
        return
      }

      setPaymentState(result.reason === 'already-unlocked' ? 'exists' : 'idle')
      if (result.reason === 'auth') {
        navigate('/auth')
      }
    }, 700)
  }

  return (
    <div className="page page--detail">
      <SubPageHeader title="内容详情" />

      <section className={`detail-hero detail-hero--${detail.tone}`}>
        <div className="detail-hero__cover" />
        <div className="detail-hero__eyebrow">{detail.eyebrow}</div>
        <h1 className="detail-hero__title">{detail.title}</h1>
        <div className="detail-hero__meta">
          主播：{detail.creator} · {detail.duration} · {detail.status}
        </div>
        <div className="detail-tags">
          {detail.tags.map((tag) => (
            <span key={tag} className="detail-tag">
              {tag}
            </span>
          ))}
        </div>
        <p className="detail-hero__description">{detail.description}</p>
      </section>

      {paymentState === 'pending' ? (
        <StatusCard
          eyebrow="Apple 内购风格演示"
          title="正在确认购买结果"
          description="当前版本先验证引流与转化体验，不接真实支付；这里展示的是正式上线前的支付反馈节奏。"
          tone="warning"
          icon={<AppleIcon className="status-card__glyph" />}
        />
      ) : null}

      {paymentState === 'success' ? (
        <StatusCard
          eyebrow="已完成解锁"
          title="内容权益已到账"
          description={`已为你保留《${detail.title}》的收听权限，后续可从首页、片单或订单记录继续进入。`}
          tone="success"
          icon={<CheckCircleIcon className="status-card__glyph" />}
          actions={
            <>
              <Link to={`/player/${detail.id}`} className="button button--primary">
                立即收听
              </Link>
              <Link to="/me/orders" className="button button--secondary">
                查看订单
              </Link>
            </>
          }
        />
      ) : null}

      {paymentState === 'exists' ? (
        <StatusCard
          eyebrow="无需重复购买"
          title="这条内容已在你的权益内"
          description={user?.vipStatus.subscriptionActive ? '你当前已开通会员，可直接继续收听。' : '你之前已经解锁过这条内容，直接进入播放即可。'}
          icon={<LockIcon className="status-card__glyph" />}
          actions={
            <Link to={`/player/${detail.id}`} className="button button--secondary">
              继续播放
            </Link>
          }
        />
      ) : null}

      {playlistMessage ? (
        <StatusCard
          eyebrow="片单状态"
          title="已处理你的片单操作"
          description={playlistMessage}
          icon={<CheckCircleIcon className="status-card__glyph" />}
          actions={
            <Link to="/me/playlist" className="button button--secondary">
              查看片单
            </Link>
          }
        />
      ) : null}

      <section className="detail-actions">
        <Link to={`/player/${detail.id}`} className="button button--primary button--block">
          {unlocked ? '继续收听' : '试听前 30 秒'}
        </Link>
        <button type="button" className="button button--secondary button--block" onClick={handleUnlock}>
          {actionLabel}
        </button>
        <button type="button" className="button button--ghost button--block" onClick={handleAddPlaylist}>
          加入片单
        </button>
      </section>

      <section className="info-card detail-info-card">
        <div className="info-card__label">当前交易策略</div>
        <div className="info-card__value info-card__value--sm">先做轻量转化，不做重支付心智</div>
        <p className="info-card__text">耳边现阶段是引流产品，付费路径以 Apple 内购风格演示为主，重点验证点击意愿、权益理解与后续回访。</p>
      </section>

      <section className="page-section page-section--compact">
        <SectionHeader title="所属系列" moreTo="/home/section/series" />
        <SeriesCard
          title={detail.seriesTitle}
          meta={detail.seriesMeta}
          tone={detail.tone}
          to="/home/section/series"
        />
      </section>

      <section className="info-card info-card--memory">
        <div className="info-card__label">继续追更</div>
        <p className="info-card__text">试听、单集解锁或从系列入口直接追更。</p>
        <Link to={`/player/${playerState.contentId}`} className="button button--secondary">
          继续播放
        </Link>
      </section>
    </div>
  )
}
