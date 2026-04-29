import { useState } from 'react'

import { InfoIcon } from './Icons'

export type AIReportReason =
  | 'sexual'
  | 'violence'
  | 'minor'
  | 'hate'
  | 'misinformation'
  | 'other'

interface AIReportSheetProps {
  open: boolean
  targetText: string
  onClose: () => void
  onSubmit: (reason: AIReportReason, note: string) => void
}

const REASONS: Array<{ value: AIReportReason; label: string }> = [
  { value: 'sexual', label: '色情或性暗示内容' },
  { value: 'violence', label: '暴力 / 自残 / 危险行为' },
  { value: 'minor', label: '涉及未成年人的不当内容' },
  { value: 'hate', label: '歧视 / 仇恨 / 骚扰' },
  { value: 'misinformation', label: '虚假信息或误导' },
  { value: 'other', label: '其他不适当内容' },
]

export function AIReportSheet({ open, targetText, onClose, onSubmit }: AIReportSheetProps) {
  const [reason, setReason] = useState<AIReportReason>('other')
  const [note, setNote] = useState('')

  if (!open) {
    return null
  }

  const previewText = targetText.length > 80 ? `${targetText.slice(0, 80)}…` : targetText

  return (
    <div className="action-sheet" role="dialog" aria-modal="true" aria-labelledby="ai-report-title">
      <div className="action-sheet__backdrop" onClick={onClose} />
      <div className="action-sheet__panel">
        <div className="action-sheet__head">
          <InfoIcon className="action-sheet__icon" />
          <div>
            <div className="action-sheet__eyebrow">举报 AI 回复</div>
            <h3 id="ai-report-title" className="action-sheet__title">告诉我们这条回复哪里不对</h3>
          </div>
        </div>

        {previewText ? (
          <blockquote className="action-sheet__quote">"{previewText}"</blockquote>
        ) : null}

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
                  name="ai-report-reason"
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
            placeholder="说明具体问题，方便我们更快处理"
            maxLength={300}
            rows={3}
          />
        </label>

        <p className="action-sheet__hint">
          提交后我们会在 24 小时内核查并处理；情节严重的回复会立即拉黑相关角色策略。
        </p>

        <div className="action-sheet__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={() => {
              onSubmit(reason, note.trim())
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
