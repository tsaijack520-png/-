import { Link } from 'react-router-dom'

import { StatusCard } from '../components/FeedbackBlocks'
import { InfoIcon } from '../components/Icons'
import { SubPageHeader } from '../components/SubPageHeader'
import { useMockSession } from '../hooks/useMockSession'

export function AIPacksPage() {
  const { aiMinutes } = useMockSession()

  return (
    <div className="page page--detail page--ai-packs">
      <SubPageHeader title="AI 时长" />

      <StatusCard
        eyebrow="敬请期待"
        title="时长包功能尚未开放"
        description={`首版我们为每位用户预留了 ${aiMinutes} 分钟体验时长，足够熟悉 AI 陪伴的节奏。时长包与权益购买会在后续版本统一上线，届时会通过 Apple 内购完成，不会接入任何外部支付。`}
        icon={<InfoIcon className="status-card__glyph" />}
        actions={
          <>
            <Link to="/ai" className="button button--primary">
              回到 AI 角色
            </Link>
            <Link to="/support/help" className="button button--secondary">
              帮助与反馈
            </Link>
          </>
        }
      />

      <section className="info-card info-card--memory">
        <div className="info-card__label">为什么暂不开放</div>
        <p className="info-card__text">
          我们想先把对话质量、角色记忆和内容安全打磨到更稳定的状态，再为大家提供长期可持续的时长方案。期间如果你的体验时长用完，可以在「帮助与反馈」里联系我们补充。
        </p>
      </section>
    </div>
  )
}
