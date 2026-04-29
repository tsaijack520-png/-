import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Haptics, ImpactStyle } from '@capacitor/haptics'

import { StatusCard } from '../components/FeedbackBlocks'
import { CheckCircleIcon, InfoIcon, LockIcon } from '../components/Icons'
import { SubPageHeader } from '../components/SubPageHeader'
import { loadContentDetail } from '../data/source'
import { useAppData } from '../hooks/useAppData'
import { useMockSession } from '../hooks/useMockSession'

const PREVIEW_SECONDS = 30

function parseDuration(label: string) {
  const parts = label.split(':').map((value) => Number(value))
  if (parts.length === 2 && parts.every((value) => Number.isFinite(value))) {
    const [minutes, seconds] = parts
    return minutes * 60 + seconds
  }
  return 0
}

function formatDuration(seconds: number) {
  const clamped = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(clamped / 60)
  const secs = clamped % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function PlayerPage() {
  const navigate = useNavigate()
  const { addPlaylistItem, hasUnlockedContent } = useMockSession()
  const { contentId = '' } = useParams()

  const loader = useCallback(() => loadContentDetail(contentId), [contentId])
  const { data } = useAppData(loader, [contentId])

  if (!data) {
    return (
      <div className="page page--detail">
        <SubPageHeader title="正在播放" />
      </div>
    )
  }

  return <PlayerView bundle={data} contentId={contentId} navigate={navigate} addPlaylistItem={addPlaylistItem} hasUnlockedContent={hasUnlockedContent} />
}

interface PlayerViewProps {
  bundle: NonNullable<Awaited<ReturnType<typeof loadContentDetail>>>
  contentId: string
  navigate: ReturnType<typeof useNavigate>
  addPlaylistItem: ReturnType<typeof useMockSession>['addPlaylistItem']
  hasUnlockedContent: ReturnType<typeof useMockSession>['hasUnlockedContent']
}

function PlayerView({ bundle, navigate, addPlaylistItem, hasUnlockedContent }: PlayerViewProps) {
  const { detail, playerState: player, episodeIds: episodes } = bundle

  const currentIndex = episodes.indexOf(player.contentId)
  const prevEpisodeId = currentIndex > 0 ? episodes[currentIndex - 1] : null
  const nextEpisodeId = currentIndex >= 0 && currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null

  const totalSeconds = useMemo(() => parseDuration(player.durationLabel), [player.durationLabel])
  const initialSeconds = useMemo(() => {
    const parsed = parseDuration(player.currentTimeLabel)
    if (parsed > 0) {
      return parsed
    }
    return Math.round((player.progressPercent / 100) * totalSeconds)
  }, [player.currentTimeLabel, player.progressPercent, totalSeconds])

  const unlocked = hasUnlockedContent(player.contentId)
  const previewLimit = useMemo(() => {
    if (unlocked) {
      return totalSeconds
    }
    return Math.min(PREVIEW_SECONDS, totalSeconds)
  }, [totalSeconds, unlocked])

  const [isPlaying, setIsPlaying] = useState(true)
  const [currentSeconds, setCurrentSeconds] = useState(() => Math.min(initialSeconds, previewLimit))
  const [message, setMessage] = useState('')
  const [syncedContentId, setSyncedContentId] = useState(player.contentId)
  const tickRef = useRef<number | null>(null)

  if (syncedContentId !== player.contentId) {
    setSyncedContentId(player.contentId)
    setCurrentSeconds(Math.min(initialSeconds, previewLimit))
    setIsPlaying(true)
    setMessage('')
  }

  useEffect(() => {
    if (!isPlaying) {
      return
    }

    tickRef.current = window.setInterval(() => {
      setCurrentSeconds((prev) => {
        const next = prev + 1
        if (next >= previewLimit) {
          setIsPlaying(false)
          return previewLimit
        }
        return next
      })
    }, 1000)

    return () => {
      if (tickRef.current !== null) {
        window.clearInterval(tickRef.current)
        tickRef.current = null
      }
    }
  }, [isPlaying, previewLimit])

  const reachedEnd = currentSeconds >= previewLimit
  const previewCapped = !unlocked && reachedEnd
  const finished = unlocked && reachedEnd

  const handleAddPlaylist = useCallback(() => {
    const result = addPlaylistItem(detail)
    setMessage(result === 'added' ? '已从播放器加入片单。' : '这条内容已经在你的片单里。')
  }, [addPlaylistItem, detail])

  const handleToggle = useCallback(() => {
    void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
    if (reachedEnd) {
      setCurrentSeconds(0)
      setIsPlaying(true)
      return
    }
    setIsPlaying((value) => !value)
  }, [reachedEnd])

  const handlePrev = useCallback(() => {
    if (!prevEpisodeId) {
      return
    }
    navigate(`/player/${prevEpisodeId}`)
  }, [navigate, prevEpisodeId])

  const handleNext = useCallback(() => {
    if (!nextEpisodeId) {
      return
    }
    navigate(`/player/${nextEpisodeId}`)
  }, [navigate, nextEpisodeId])

  const progressPercent = previewLimit > 0 ? Math.min(100, (currentSeconds / previewLimit) * 100) : 0

  const coverStyle = player.coverImageUrl
    ? {
        backgroundImage: `url(${player.coverImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined

  const episodeLabel =
    episodes.length > 1 && currentIndex >= 0 ? `第 ${currentIndex + 1} 集 / 共 ${episodes.length} 集` : null

  return (
    <div className="page page--detail">
      <SubPageHeader title="正在播放" />

      <section className={`detail-hero detail-hero--${player.tone}`}>
        <div className="detail-hero__cover detail-hero__cover--large" style={coverStyle} />
        <h1 className="detail-hero__title">{player.title}</h1>
        <div className="detail-hero__meta">{player.meta}</div>
        {episodeLabel ? <div className="detail-hero__eyebrow">{episodeLabel}</div> : null}
      </section>

      {!unlocked ? (
        <StatusCard
          eyebrow="试听模式"
          title={`前 ${Math.min(PREVIEW_SECONDS, totalSeconds)} 秒免费试听`}
          description="完整版会在会员体系上线后开放，届时通过 Apple 内购统一处理。"
          tone="warning"
          icon={<InfoIcon className="status-card__glyph" />}
          actions={
            <Link to={`/content/${player.contentId}`} className="button button--secondary">
              返回内容详情
            </Link>
          }
        />
      ) : null}

      {message ? (
        <StatusCard
          eyebrow="片单"
          title="已更新你的片单"
          description={message}
          tone="success"
          icon={<CheckCircleIcon className="status-card__glyph" />}
        />
      ) : null}

      {previewCapped ? (
        <StatusCard
          eyebrow="试听已结束"
          title="继续收听需要解锁"
          description="试听的前 30 秒已播放完，解锁后可继续听完整集。"
          tone="warning"
          icon={<LockIcon className="status-card__glyph" />}
          actions={
            <Link to={`/content/${player.contentId}`} className="button button--primary">
              去解锁
            </Link>
          }
        />
      ) : null}

      {finished ? (
        <StatusCard
          eyebrow="本集已听完"
          title={nextEpisodeId ? '可以接着听下一集' : '可以从头再听或返回挑选其它内容'}
          description="收听进度已自动保存，可从首页或我的片单继续进入。"
          tone="success"
          icon={<CheckCircleIcon className="status-card__glyph" />}
          actions={
            nextEpisodeId ? (
              <button type="button" className="button button--primary" onClick={handleNext}>
                播放下一集
              </button>
            ) : undefined
          }
        />
      ) : null}

      <section className="player-panel">
        <div className="player-panel__track">
          <div className="player-panel__fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="player-panel__time-row">
          <span>{formatDuration(currentSeconds)}</span>
          <span>{unlocked ? player.durationLabel : `试听 ${formatDuration(previewLimit)}`}</span>
        </div>
        <div className="player-panel__actions">
          <button
            type="button"
            className="mini-button"
            disabled={!prevEpisodeId}
            onClick={handlePrev}
            title={prevEpisodeId ? '播放上一集' : '已经是第一集'}
          >
            上一集
          </button>
          <button type="button" className="mini-button mini-button--primary" onClick={handleToggle}>
            {reachedEnd ? '从头听' : isPlaying ? '暂停' : '继续'}
          </button>
          <button
            type="button"
            className="mini-button"
            disabled={!nextEpisodeId}
            onClick={handleNext}
            title={nextEpisodeId ? '播放下一集' : '已经是最新一集'}
          >
            下一集
          </button>
        </div>
      </section>

      <section className="info-card">
        <div className="info-card__label">播放信息</div>
        <div className="info-card__value info-card__value--sm">收听进度已保存</div>
        <p className="info-card__text">退出后可在首页和"我的"里找到最近收听，直接续播。</p>
      </section>

      <section className="detail-actions">
        <Link to={`/content/${player.contentId}`} className="button button--secondary button--block">
          返回内容详情
        </Link>
        <button type="button" className="button button--ghost button--block" onClick={handleAddPlaylist}>
          加入片单
        </button>
      </section>
    </div>
  )
}
