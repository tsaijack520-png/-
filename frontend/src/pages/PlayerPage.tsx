import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { SubPageHeader } from '../components/SubPageHeader'
import { playerStates } from '../data/mockData'

export function PlayerPage() {
  const { contentId = '' } = useParams()
  const [isPlaying, setIsPlaying] = useState(true)

  const player = useMemo(() => {
    return playerStates[contentId] ?? playerStates.c1
  }, [contentId])

  return (
    <div className="page page--detail">
      <SubPageHeader title="正在播放" />

      <section className={`detail-hero detail-hero--${player.tone}`}>
        <div className="detail-hero__cover detail-hero__cover--large" />
        <h1 className="detail-hero__title">{player.title}</h1>
        <div className="detail-hero__meta">{player.meta}</div>
      </section>

      <section className="player-panel">
        <div className="player-panel__track">
          <div
            className="player-panel__fill"
            style={{ width: `${player.progressPercent}%` }}
          />
        </div>
        <div className="player-panel__time-row">
          <span>{player.currentTimeLabel}</span>
          <span>{player.durationLabel}</span>
        </div>
        <div className="player-panel__actions">
          <button type="button" className="mini-button">
            上一集
          </button>
          <button
            type="button"
            className="mini-button mini-button--primary"
            onClick={() => setIsPlaying((value) => !value)}
          >
            {isPlaying ? '暂停' : '继续'}
          </button>
          <button type="button" className="mini-button">
            下一集
          </button>
        </div>
      </section>

      <section className="info-card">
        <div className="info-card__label">播放信息</div>
        <div className="info-card__value info-card__value--sm">继续收听进度已保存</div>
        <p className="info-card__text">
          退出后会在首页和“我的”里展示最近收听，回访时可直接继续播放。
        </p>
      </section>

      <section className="detail-actions">
        <Link to={`/content/${player.contentId}`} className="button button--secondary button--block">
          返回内容详情
        </Link>
        <button type="button" className="button button--ghost button--block">
          加入片单
        </button>
      </section>
    </div>
  )
}
