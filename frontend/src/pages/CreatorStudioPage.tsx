import { Link } from 'react-router-dom'

import { SubPageHeader } from '../components/SubPageHeader'
import { creatorStats, creatorStatusLabelMap } from '../data/mockData'
import { useMockSession } from '../hooks/useMockSession'

export function CreatorStudioPage() {
  const { creatorUploads, isCreator } = useMockSession()
  const isPreview = !isCreator

  return (
    <div className="page page--detail">
      <SubPageHeader title="创作中心" />

      {isPreview ? (
        <section className="creator-preview-banner">
          <div>
            <div className="info-card__label">当前为预览模式</div>
            <div className="info-card__value info-card__value--sm">切换为创作者后即可正式管理内容</div>
          </div>
          <p className="info-card__text">你现在可以先查看工作台结构与上传链路，真正发布和管理内容时再去“账号与设置”切换为创作者身份。</p>
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

      <section className="page-section page-section--compact">
        <div className="section-header">
          <h2 className="section-header__title">内容管理</h2>
          <Link to="/creator/upload" className="section-header__action-link">
            去上传
          </Link>
        </div>
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
                <button type="button" className="button button--secondary" disabled={isPreview}>
                  查看数据
                </button>
                <button type="button" className="button button--ghost" disabled={isPreview}>
                  编辑内容
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
