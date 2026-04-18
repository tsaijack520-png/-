import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { StatusCard } from '../components/FeedbackBlocks'
import { CheckCircleIcon, InfoIcon, LockIcon } from '../components/Icons'
import { SubPageHeader } from '../components/SubPageHeader'
import { playerStates } from '../data/mockData'
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
  const { addPlaylistItem, hasUnlockedContent } = useMockSession()
  const { contentId = '' } = useParams()

  const player = useMemo(() => {
    return playerStates[contentId] ?? playerStates.c1
  }, [contentId])

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
    const result = addPlaylistItem({
      id: player.contentId,
      title: player.title,
      eyebrow: player.meta,
      creator: player.meta.split(' · ')[0] ?? '耳边',
      duration: player.durationLabel,
      status: '继续播放',
      description: '已从播放器加入片单，便于下次回访继续进入。',
      tags: ['播放器加入'],
      unlockLabel: '单集解锁',
      seriesId: player.contentId,
      seriesTitle: player.title,
      seriesMeta: player.meta,
      tone: player.tone,
    })

    setMessage(result === 'added' ? '已从播放器加入片单。' : '这条内容已经在你的片单里。')
  }, [addPlaylistItem, player])

  const handleToggle = useCallback(() => {
    if (reachedEnd) {
      setCurrentSeconds(0)
      setIsPlaying(true)
      return
    }
    setIsPlaying((value) => !value)
  }, [reachedEnd])

  const progressPercent = previewLimit > 0 ? Math.min(100, (currentSeconds / previewLimit) * 100) : 0

  return (
    <div className="page page--detail">
      <SubPageHeader title="正在播放" />

      <section className={`detail-hero detail-hero--${player.tone}`}>
        <div className="detail-hero__cover detail-hero__cover--large" />
        <h1 className="detail-hero__title">{player.title}</h1>
        <div className="detail-hero__meta">{player.meta}</div>
      </section>

      {!unlocked ? (
        <StatusCard
          eyebrow="试听模式"
          title={`前 ${Math.min(PREVIEW_SECONDS, totalSeconds)} 秒免费试听`}
          description="正式会员或单集解锁后即可听完整集；当前环境下试听结束会自动停在 30 秒。"
          tone="warning"
          icon={<InfoIcon className="status-card__glyph" />}
          actions={
            <Link to={`/content/${player.contentId}`} className="button button--secondary">
              解锁完整版
            </Link>
          }
        />
      ) : null}

      {message ? (
        <StatusCard
          eyebrow="片单反馈"
          title="已处理你的回访入口"
          description={message}
          tone="success"
          icon={<CheckCircleIcon className="status-card__glyph" />}
        />
      ) : null}

      {previewCapped ? (
        <StatusCard
          eyebrow="试听已结束"
          title="继续收听需要解锁"
          description="试听的前 30 秒已经播放完毕，解锁后可以继续从这里开始听整集。"
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
          title="可以选择回到开头或看看下一集"
          description="收听记录已经保存，之后可以从首页“最近收听”或我的片单继续进入。"
          tone="success"
          icon={<CheckCircleIcon className="status-card__glyph" />}
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
            disabled
            title="当前演示仅保留当前集，切集入口将在后续版本打开"
          >
            上一集
          </button>
          <button type="button" className="mini-button mini-button--primary" onClick={handleToggle}>
            {reachedEnd ? '从头听' : isPlaying ? '暂停' : '继续'}
          </button>
          <button
            type="button"
            className="mini-button"
            disabled
            title="当前演示仅保留当前集，切集入口将在后续版本打开"
          >
            下一集
          </button>
        </div>
      </section>

      <section className="info-card">
        <div className="info-card__label">播放信息</div>
        <div className="info-card__value info-card__value--sm">继续收听进度已保存</div>
        <p className="info-card__text">退出后会在首页和“我的”里展示最近收听，回访时可直接继续播放。</p>
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
