import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Share } from '@capacitor/share'

import { SeriesCard } from '../components/ContentBlocks'
import { CheckCircleIcon, InfoIcon } from '../components/Icons'
import { StatusCard } from '../components/FeedbackBlocks'
import { SectionHeader } from '../components/SectionHeader'
import { SubPageHeader } from '../components/SubPageHeader'
import { UGCReportSheet } from '../components/UGCReportSheet'
import { loadContentDetail } from '../data/source'
import { useAppData } from '../hooks/useAppData'
import { useMockSession } from '../hooks/useMockSession'
import { isNativePlatform } from '../utils/nativeBootstrap'

export function ContentDetailPage() {
  const navigate = useNavigate()
  const { contentId = '' } = useParams()
  const { isAuthenticated, addPlaylistItem, hasUnlockedContent, submitReport } = useMockSession()
  const [playlistMessage, setPlaylistMessage] = useState('')
  const [reportOpen, setReportOpen] = useState(false)
  const [reportFeedback, setReportFeedback] = useState('')
  const [shareError, setShareError] = useState('')

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
  const playerActionLabel = unlocked ? '继续收听' : needsVip ? '试听片段' : '开始试听'

  function handleAddPlaylist() {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }
    const result = addPlaylistItem(detail)
    setPlaylistMessage(result === 'added' ? '已加入片单，可在「我的」里继续找到。' : '这条内容已经在你的片单里了。')
  }

  async function handleShare() {
    setShareError('')
    const text = `${detail.title} · ${detail.creator}\n${detail.description.slice(0, 60)}`
    try {
      if (isNativePlatform()) {
        await Share.share({
          title: detail.title,
          text,
          dialogTitle: '分享给朋友',
        })
      } else if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title: detail.title, text })
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        setShareError('已复制到剪贴板。')
      } else {
        setShareError('当前环境不支持分享，请手动复制内容。')
      }
    } catch (err) {
      const name = (err as { name?: string })?.name
      if (name !== 'AbortError' && name !== 'NotAllowedError') {
        setShareError('分享暂不可用，请稍后再试。')
      }
    }
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
          主播：{detail.creator} · {detail.duration}
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

      {needsVip ? (
        <StatusCard
          eyebrow="完整版"
          title="完整版即将随会员开放"
          description="首版可免费试听本条内容的开头部分。完整版会在会员体系上线后开放，届时通过 Apple 内购统一处理。"
          icon={<InfoIcon className="status-card__glyph" />}
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

      {reportFeedback ? (
        <StatusCard
          eyebrow="举报已提交"
          title="我们会在 24 小时内核查"
          description={reportFeedback}
          tone="success"
          icon={<CheckCircleIcon className="status-card__glyph" />}
          actions={
            <button type="button" className="button button--ghost" onClick={() => setReportFeedback('')}>
              我知道了
            </button>
          }
        />
      ) : null}

      <section className="detail-actions">
        <Link to={`/player/${detail.id}`} className="button button--primary button--block">
          {playerActionLabel}
        </Link>
        <button type="button" className="button button--secondary button--block" onClick={handleAddPlaylist}>
          加入片单
        </button>
        <button type="button" className="button button--secondary button--block" onClick={handleShare}>
          分享给朋友
        </button>
        <button type="button" className="button button--ghost button--block" onClick={() => setReportOpen(true)}>
          举报内容
        </button>
        {shareError ? <div className="auth-field__error">{shareError}</div> : null}
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
        <div className="info-card__label">收听说明</div>
        <p className="info-card__text">
          首版所有公开内容均可免费收听，无需购买。如需举报本条内容存在违规问题，可点击上方「举报内容」按钮，我们会在 24 小时内复核处理。
        </p>
      </section>

      <UGCReportSheet
        open={reportOpen}
        targetType="content"
        targetId={detail.id}
        targetTitle={detail.title}
        onClose={() => setReportOpen(false)}
        onSubmit={({ targetType, targetId, reason, note }) => {
          submitReport({ surface: targetType, targetId, targetTitle: detail.title, reason, note })
          setReportOpen(false)
          setReportFeedback(`举报理由：${reason}${note ? ` · 已记录补充说明` : ''}`)
        }}
      />
    </div>
  )
}
