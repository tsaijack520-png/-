import { useState } from 'react'

import { InfoIcon } from './Icons'

export type UGCReportTargetType = 'content' | 'anchor' | 'comment'

export type UGCReportReason =
  | 'sexual'
  | 'violence'
  | 'minor'
  | 'hate'
  | 'spam'
  | 'copyright'
  | 'other'

interface UGCReportSheetProps {
  open: boolean
  targetType: UGCReportTargetType
  targetId: string
  targetTitle: string
  onClose: () => void
  onSubmit: (payload: {
    targetType: UGCReportTargetType
    targetId: string
    reason: UGCReportReason
    note: string
  }) => void
}

const REASONS: Array<{ value: UGCReportReason; label: string }> = [
  { value: 'sexual', label: '色情或低俗内容' },
  { value: 'violence', label: '暴力 / 危险行为' },
  { value: 'minor', label: '涉及未成年人的不当内容' },
  { value: 'hate', label: '歧视 / 仇恨 / 骚扰' },
  { value: 'spam', label: '垃圾信息 / 营销骚扰' },
  { value: 'copyright', label: '版权或盗用问题' },
  { value: 'other', label: '其他违反社区准则' },
]

const TARGET_LABEL: Record<UGCReportTargetType, string> = {
  content: '这条内容',
  anchor: '这位创作者',
  comment: '这条评论',
}

export function UGCReportSheet({
  open,
  targetType,
  targetId,
  targetTitle,
  onClose,
  onSubmit,
}: UGCReportSheetProps) {
  const [reason, setReason] = useState<UGCReportReason>('other')
  const [note, setNote] = useState('')

  if (!open) {
    return null
  }

  return (
    <div className="action-sheet" role="dialog" aria-modal="true" aria-labelledby="ugc-report-title">
      <div className="action-sheet__backdrop" onClick={onClose} />
      <div className="action-sheet__panel">
        <div className="action-sheet__head">
          <InfoIcon className="action-sheet__icon" />
          <div>
            <div className="action-sheet__eyebrow">举报{TARGET_LABEL[targetType]}</div>
            <h3 id="ugc-report-title" className="action-sheet__title">{targetTitle}</h3>
          </div>
        </div>

        <div className="action-sheet__group">
          <div className="action-sheet__label">问题类型</div>
          <div className="action-sheet__options">
            {REASONS.map((item) => (
              <label
                key={item.value}
                className={reason === item.value ? 'action-sheet__option action-sheet__option--active' : 'action-sheet__option'}
              >
                <input
                  type="radio"
                  name="ugc-report-reason"
                  value={item.value}
                  checked={reason === item.value}
                  onChange={() => setReason(item.value)}
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <label className="action-sheet__group">
          <span className="action-sheet__label">补充说明（可选）</span>
          <textarea
            className="action-sheet__textarea"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="补充时间点、上下文，便于我们快速核查"
            maxLength={300}
            rows={3}
          />
        </label>

        <p className="action-sheet__hint">
          根据社区准则，我们会在 24 小时内核查并处理；如果证实违规，相关内容会被下架，违规账号会被封禁。
        </p>

        <div className="action-sheet__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={() => {
              onSubmit({ targetType, targetId, reason, note: note.trim() })
              setReason('other')
              setNote('')
            }}
          >
            提交举报
          </button>
        </div>
      </div>
    </div>
  )
}
