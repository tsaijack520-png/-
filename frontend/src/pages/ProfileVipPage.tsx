import { Link } from 'react-router-dom'

import { StatusCard } from '../components/FeedbackBlocks'
import { InfoIcon } from '../components/Icons'
import { SubPageHeader } from '../components/SubPageHeader'

export function ProfileVipPage() {
  return (
    <div className="page page--detail">
      <SubPageHeader title="会员中心" />

      <StatusCard
        eyebrow="敬请期待"
        title="会员体系即将开放"
        description="耳边正在打磨会员的权益体验和长期运营。在新版本上线前，所有内容都可以免费收听，AI 陪伴的体验时长由系统赠送。我们会在开放前提前在站内通知。"
        icon={<InfoIcon className="status-card__glyph" />}
        actions={
          <>
            <Link to="/" className="button button--primary">
              回到首页继续收听
            </Link>
            <Link to="/support/about" className="button button--secondary">
              了解耳边
            </Link>
          </>
        }
      />

      <section className="info-card info-card--memory">
        <div className="info-card__label">当前版本说明</div>
        <p className="info-card__text">
          首版的目标是让你先体验完整的内容陪伴和 AI 对话流程。我们暂未上线任何付费功能、订阅、点数购买与提现入口。如果你已经在使用其它声音陪伴产品，欢迎在「帮助与反馈」里告诉我们你最看重什么权益。
        </p>
      </section>
    </div>
  )
}
