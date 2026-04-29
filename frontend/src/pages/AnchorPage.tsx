import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ListCard } from '../components/ContentBlocks'
import { StatusCard } from '../components/FeedbackBlocks'
import { CheckCircleIcon, InfoIcon } from '../components/Icons'
import { SubPageHeader } from '../components/SubPageHeader'
import { UGCReportSheet } from '../components/UGCReportSheet'
import { loadAnchor } from '../data/source'
import { useAppData } from '../hooks/useAppData'
import { useMockSession } from '../hooks/useMockSession'

export function AnchorPage() {
  const { anchorId = '' } = useParams()
  const { isAnchorBlocked, blockAnchor, unblockAnchor, submitReport } = useMockSession()
  const [reportOpen, setReportOpen] = useState(false)
  const [reportFeedback, setReportFeedback] = useState('')
  const [blockFeedback, setBlockFeedback] = useState('')

  const loader = useCallback(() => loadAnchor(anchorId), [anchorId])
  const { data } = useAppData(loader, [anchorId])

  if (!data) {
    return (
      <div className="page page--detail">
        <SubPageHeader title="主播主页" />
      </div>
    )
  }

  const { profile: anchor, contents: anchorContents } = data
  const blocked = isAnchorBlocked(anchor.id)

  function handleToggleBlock() {
    if (blocked) {
      unblockAnchor(anchor.id)
      setBlockFeedback(`已解除对「${anchor.name}」的拉黑，会重新出现在你的浏览动线中。`)
    } else {
      blockAnchor(anchor.id)
      setBlockFeedback(`已拉黑「${anchor.name}」，本人内容将不再出现在你的浏览动线中。可在「账号与设置」里管理拉黑列表。`)
    }
  }

  return (
    <div className="page page--detail">
      <SubPageHeader title="主播主页" />

      <section className={`detail-hero detail-hero--${anchor.tone}`}>
        <div
          className="detail-hero__cover"
          style={
            anchor.coverImageUrl
              ? {
                  backgroundImage: `url(${anchor.coverImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        />
        <div className="detail-hero__eyebrow">{anchor.followerLabel} · {anchor.scheduleLabel}</div>
        <h1 className="detail-hero__title">{anchor.name}</h1>
        <div className="detail-hero__meta">{anchor.tagline}</div>
        <div className="detail-tags">
          {anchor.tags.map((tag) => (
            <span key={tag} className="detail-tag">
              {tag}
            </span>
          ))}
        </div>
        <p className="detail-hero__description">{anchor.intro}</p>
      </section>

      <section className="detail-actions">
        <button
          type="button"
          className={blocked ? 'button button--secondary button--block' : 'button button--ghost button--block'}
          onClick={handleToggleBlock}
        >
          {blocked ? '已拉黑 · 点此解除' : '拉黑该创作者'}
        </button>
        <button type="button" className="button button--ghost button--block" onClick={() => setReportOpen(true)}>
          举报创作者
        </button>
      </section>

      {blockFeedback ? (
        <StatusCard
          eyebrow="操作完成"
          title={blocked ? '已加入你的拉黑名单' : '已解除拉黑'}
          description={blockFeedback}
          tone={blocked ? 'warning' : 'success'}
          icon={<CheckCircleIcon className="status-card__glyph" />}
          actions={
            <button type="button" className="button button--ghost" onClick={() => setBlockFeedback('')}>
              我知道了
            </button>
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

      <section className="info-card info-card--memory">
        <div className="info-card__label">本周动态</div>
        <div className="info-card__value info-card__value--sm">{anchor.updateNote}</div>
        <p className="info-card__text">如果你认为该创作者发布了违反社区准则的内容，可使用上方的「举报」或「拉黑」按钮，开发团队会在 24 小时内复核。</p>
      </section>

      {blocked ? (
        <StatusCard
          eyebrow="拉黑生效"
          title="本主播内容已被你屏蔽"
          description="解除拉黑后才能继续展示其代表内容。"
          tone="warning"
          icon={<InfoIcon className="status-card__glyph" />}
        />
      ) : (
        <section className="page-section page-section--compact">
          <div className="section-header">
            <h2 className="section-header__title">代表内容</h2>
            <Link to="/home/section/recommended" className="section-header__action-link">
              看更多推荐
            </Link>
          </div>
          <div className="list-stack">
            {anchorContents.map((item) => (
              <ListCard
                key={item.id}
                title={item.title}
                meta={item.meta}
                badge={item.badge}
                badgeTone={item.badgeTone}
                tone={item.tone}
                to={`/content/${item.id}`}
                coverImageUrl={item.coverImageUrl}
              />
            ))}
          </div>
        </section>
      )}

      <UGCReportSheet
        open={reportOpen}
        targetType="anchor"
        targetId={anchor.id}
        targetTitle={anchor.name}
        onClose={() => setReportOpen(false)}
        onSubmit={({ targetType, targetId, reason, note }) => {
          submitReport({ surface: targetType, targetId, targetTitle: anchor.name, reason, note })
          setReportOpen(false)
          setReportFeedback(`举报理由：${reason}${note ? ' · 已记录补充说明' : ''}`)
        }}
      />
    </div>
  )
}
