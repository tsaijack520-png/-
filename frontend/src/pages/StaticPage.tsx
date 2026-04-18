import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { EarBrandMark } from '../components/Icons'
import { SubPageHeader } from '../components/SubPageHeader'

const pageContent = {
  privacy: {
    title: '隐私政策',
    eyebrow: '个人信息保护',
    summary: '耳边重视并严格保护用户的个人信息。本政策说明我们收集哪些信息、如何使用，以及你对这些信息所拥有的权利。',
    sections: [
      {
        heading: '我们收集的信息',
        body: '账号基础信息（昵称、头像、登录方式）、收听与购买记录、设备本地的偏好设置。我们不会收集与服务无关的隐私信息。',
      },
      {
        heading: '信息的使用方式',
        body: '用于保持登录状态、同步片单与会员权益、展示收听历史与订单记录、改善内容推荐。未经你同意，我们不会将信息提供给第三方。',
      },
      {
        heading: '你的权利',
        body: '你可以在"账号与设置"中修改账号信息，也可以申请注销账号；注销后我们会在合理期限内删除你的个人数据。',
      },
    ],
  },
  terms: {
    title: '用户协议',
    eyebrow: '服务使用条款',
    summary: '欢迎使用耳边。请在使用本应用前阅读本协议，使用即表示你同意以下条款。',
    sections: [
      {
        heading: '服务内容',
        body: '耳边提供声音陪伴、内容发现与 AI 陪伴服务。你可以浏览公开内容、试听、收藏片单，并选择开通会员或解锁单集。',
      },
      {
        heading: '账号与内容',
        body: '请妥善保管账号信息。在发布与互动时，请遵守法律法规与社区准则，不得冒用他人身份或传播未授权内容。',
      },
      {
        heading: '付费说明',
        body: '会员订阅、点数与 AI 时长包均在订单记录中同步展示。订阅类服务可在系统设置中管理自动续费。',
      },
    ],
  },
  help: {
    title: '帮助与反馈',
    eyebrow: '常见问题与支持',
    summary: '遇到问题可以先在这里查看说明，也欢迎通过反馈入口联系我们。',
    sections: [
      {
        heading: '常见问题',
        body: '无法登录时请检查网络连接；权益未同步时可尝试退出重新登录；AI 时长、片单与订单均以当前登录账号为准。',
      },
      {
        heading: '联系我们',
        body: '如需进一步协助，可通过应用内反馈入口留言，或发送邮件至 support@erbian.fm，我们会在工作日尽快回复。',
      },
      {
        heading: '内容版权',
        body: '如认为本平台内容侵犯了你的合法权益，可通过反馈入口提交版权投诉，并附上相应证明材料。',
      },
    ],
  },
  about: {
    title: '关于耳边',
    eyebrow: '产品介绍',
    summary: '耳边是一款声音陪伴应用，为用户提供睡前、通勤与情绪调节等场景下的陪伴内容与 AI 对话。',
    sections: [
      {
        heading: '产品特色',
        body: '精选女友音、男友音、学妹音等多种声线内容，覆盖睡前陪伴、早安叫醒、角色扮演、情景剧等场景。',
      },
      {
        heading: 'AI 陪伴',
        body: '支持与不同角色进行实时语音陪伴对话，角色会记住你的偏好与会话内容，带来连续的陪伴体验。',
      },
      {
        heading: '商务合作',
        body: '若有商务合作、创作者入驻或品牌联合意向，可发送邮件至 hello@erbian.fm 联系我们。',
      },
    ],
  },
} as const

export function StaticPage() {
  const { pageId = 'help' } = useParams()

  const content = useMemo(() => {
    return pageContent[pageId as keyof typeof pageContent] ?? pageContent.help
  }, [pageId])

  return (
    <div className="page page--detail">
      <SubPageHeader title={content.title} />

      <section className="info-card info-card--memory static-page-hero">
        <div className="static-page-hero__brand">
          <EarBrandMark className="static-page-hero__logo" />
          <div>
            <div className="info-card__label">{content.eyebrow}</div>
            <div className="info-card__value info-card__value--sm">{content.title}</div>
          </div>
        </div>
        <p className="info-card__text">{content.summary}</p>
      </section>

      <section className="page-section page-section--compact">
        {content.sections.map((section) => (
          <article key={section.heading} className="info-card static-info-card">
            <div className="static-info-card__title">{section.heading}</div>
            <p className="info-card__text">{section.body}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
