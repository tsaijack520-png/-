import { useState } from 'react'

import { InfoIcon } from './Icons'

interface ContentRatingGateProps {
  acknowledged: boolean
  onAcknowledge: () => void
  onDecline: () => void
}

export function ContentRatingGate({ acknowledged, onAcknowledge, onDecline }: ContentRatingGateProps) {
  const [confirmed, setConfirmed] = useState(false)

  if (acknowledged) {
    return null
  }

  return (
    <div className="rating-gate" role="dialog" aria-modal="true" aria-labelledby="rating-gate-title">
      <div className="rating-gate__panel">
        <div className="rating-gate__head">
          <InfoIcon className="rating-gate__icon" />
          <div>
            <div className="rating-gate__eyebrow">内容分级 17+</div>
            <h2 id="rating-gate-title" className="rating-gate__title">进入前请确认你的年龄</h2>
          </div>
        </div>

        <p className="rating-gate__text">
          耳边的 AI 陪伴对话与部分声音内容面向 <strong>17 岁及以上</strong> 用户。AI 角色模拟成人之间的情感陪伴，不适合未成年人。
        </p>

        <ul className="rating-gate__list">
          <li>我们不允许 AI 生成色情、暴力、自残及伤害未成年人的内容；</li>
          <li>系统会过滤敏感词，被拦截的对话不会发送给 AI；</li>
          <li>每条 AI 回复都可一键举报，开发团队会在 24 小时内复核处理。</li>
        </ul>

        <label className="rating-gate__check">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
          />
          <span>我已年满 17 岁，并已阅读《用户协议》《隐私政策》</span>
        </label>

        <div className="rating-gate__actions">
          <button type="button" className="button button--ghost" onClick={onDecline}>
            未满 17 岁，返回
          </button>
          <button
            type="button"
            className="button button--primary"
            disabled={!confirmed}
            onClick={onAcknowledge}
          >
            进入对话
          </button>
        </div>
      </div>
    </div>
  )
}
