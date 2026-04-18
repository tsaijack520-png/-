import { useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState, StatusCard } from '../components/FeedbackBlocks'
import { InfoIcon } from '../components/Icons'
import { creatorStats, creatorStatusLabelMap } from '../data/mockData'
import { useMockSession } from '../hooks/useMockSession'
import { SubPageHeader } from '../components/SubPageHeader'

export function CreatorStudioPage() {
  const { creatorUploads, isCreator } = useMockSession()
  const isPreview = !isCreator
  const [pendingNotice, setPendingNotice] = useState<string>('')

  return (
    <div className="page page--detail">
      <SubPageHeader title="创作中心" />

      {isPreview ? (
        <section className="creator-preview-banner">
          <div>
            <div className="info-card__label">听众视角</div>
            <div className="info-card__value info-card__value--sm">切换为创作者后可管理内容</div>
          </div>
          <p className="info-card__text">在"账号与设置"中切换为创作者身份，即可开始发布内容与查看数据。</p>
          <Link to="/me/settings" className="button button--secondary">
            去切换身份
          </Link>
        </section>
      ) : null}

      <section className="creator-stats-grid">
        <article className="info-card">
          <div className="info-card__label">累计播放</div>
          <div className="info-card__value info-card__value--sm">{creatorStats.totalPlays.toLocaleString()}</div>
        </article>
        <article className="info-card">
          <div className="info-card__label">累计订单</div>
          <div className="info-card__value info-card__value--sm">{creatorStats.totalOrders.toLocaleString()}</div>
        </article>
        <article className="info-card">
          <div className="info-card__label">粉丝关注</div>
          <div className="info-card__value info-card__value--sm">{creatorStats.totalFollowers.toLocaleString()}</div>
        </article>
        <article className="info-card">
          <div className="info-card__label">本月收入</div>
          <div className="info-card__value info-card__value--sm">{creatorStats.monthlyRevenue}</div>
        </article>
      </section>

      {pendingNotice ? (
        <StatusCard
          eyebrow="提示"
          title="功能即将上线"
          description={pendingNotice}
          icon={<InfoIcon className="status-card__glyph" />}
          actions={
            <button type="button" className="button button--ghost" onClick={() => setPendingNotice('')}>
              我知道了
            </button>
          }
        />
      ) : null}

      <section className="page-section page-section--compact">
        <div className="section-header">
          <h2 className="section-header__title">内容管理</h2>
          <Link to="/creator/upload" className="section-header__action-link">
            去上传
          </Link>
        </div>
        {creatorUploads.length === 0 ? (
          <EmptyState
            title="还没有内容草稿"
            description="先上传一条草稿，后续再通过工作台查看审核状态与内容表现。"
            action={
              <Link to="/creator/upload" className="button button--secondary">
                去上传内容
              </Link>
            }
          />
        ) : (
          <div className="creator-upload-list">
            {creatorUploads.map((item) => (
              <article key={item.id} className="creator-upload-card">
                <div className="creator-upload-card__head">
                  <div>
                    <div className="creator-upload-card__title">{item.title}</div>
                    <div className="creator-upload-card__meta">
                      {item.role} · {item.scene} · {item.updatedAt}
                    </div>
                  </div>
                  <span className={`badge creator-status-badge creator-status-badge--${item.status}`}>
                    {creatorStatusLabelMap[item.status]}
                  </span>
                </div>
                <div className="creator-upload-card__stats">
                  <span>播放 {item.playCount}</span>
                  <span>订单 {item.orderCount}</span>
                </div>
                <div className="creator-upload-card__actions">
                  <button
                    type="button"
                    className="button button--secondary"
                    disabled={isPreview}
                    onClick={() => setPendingNotice('数据看板即将上线。')}
                  >
                    查看数据
                  </button>
                  <button
                    type="button"
                    className="button button--ghost"
                    disabled={isPreview}
                    onClick={() => setPendingNotice('内容编辑功能即将上线，可先在上传页提交新草稿。')}
                  >
                    编辑内容
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
