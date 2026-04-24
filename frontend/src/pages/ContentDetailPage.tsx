import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { SeriesCard } from '../components/ContentBlocks'
import { CheckCircleIcon, AppleIcon, LockIcon } from '../components/Icons'
import { StatusCard } from '../components/FeedbackBlocks'
import { SectionHeader } from '../components/SectionHeader'
import { SubPageHeader } from '../components/SubPageHeader'
import { loadContentDetail } from '../data/source'
import { useAppData } from '../hooks/useAppData'
import { useMockSession } from '../hooks/useMockSession'

export function ContentDetailPage() {
  const navigate = useNavigate()
  const { contentId = '' } = useParams()
  const { isAuthenticated, addPlaylistItem, hasUnlockedContent, unlockContent, user } = useMockSession()
  const [playlistMessage, setPlaylistMessage] = useState('')
  const [paymentState, setPaymentState] = useState<'idle' | 'pending' | 'success' | 'exists'>('idle')

  const loader = useCallback(() => loadContentDetail(contentId), [contentId])
  const { data } = useAppData(loader, [contentId])

  if (!data) {
    return (
      <div className="page page--detail">
        <SubPageHeader title="内容详情" />
      </div>
    )
  }

  const { detail } = data
  const unlocked = hasUnlockedContent(detail.id)
  const needsVip = detail.unlockLabel.includes('VIP')
  const actionLabel = unlocked ? '已解锁，可直接收听' : detail.unlockLabel

  function handleAddPlaylist() {
    const result = addPlaylistItem(detail)
    setPlaylistMessage(result === 'added' ? '已加入片单，可在"我的"里继续找到。' : '这条内容已经在你的片单里了。')
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
        <div
          className="detail-hero__cover"
          style={
            detail.coverImageUrl
              ? {
                  backgroundImage: `url(${detail.coverImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        />
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
          eyebrow="支付中"
          title="正在确认购买结果"
          description="请稍候，支付完成后权益会立即生效。"
          icon={<AppleIcon className="status-card__glyph" />}
        />
      ) : null}

      {paymentState === 'success' ? (
        <StatusCard
          eyebrow="解锁成功"
          title="可以开始收听了"
          description={`《${detail.title}》已加入你的已购内容，可在片单和订单记录中查看。`}
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
          description={user?.vipStatus.subscriptionActive ? '你当前已开通会员，可直接收听。' : '你之前已经解锁过这条内容，可直接进入播放。'}
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
          eyebrow="片单"
          title="已更新你的片单"
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

      {detail.seriesTitle ? (
        <section className="page-section page-section--compact">
          <SectionHeader title="所属系列" moreTo="/home/section/series" />
          <SeriesCard
            title={detail.seriesTitle}
            meta={detail.seriesMeta}
            tone={detail.tone}
            to="/home/section/series"
            coverImageUrl={detail.coverImageUrl}
          />
        </section>
      ) : null}

      <section className="info-card info-card--memory">
        <div className="info-card__label">继续追更</div>
        <p className="info-card__text">试听、单集解锁或从系列入口直接追更。</p>
        <Link to={`/player/${detail.id}`} className="button button--secondary">
          继续播放
        </Link>
      </section>
    </div>
  )
}
