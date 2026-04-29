import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { EarBrandMark } from '../components/Icons'
import { SubPageHeader } from '../components/SubPageHeader'

const pageContent = {
  privacy: {
    title: '隐私政策',
    eyebrow: '个人信息保护',
    summary: '耳边重视并严格保护用户的个人信息。本政策说明我们收集哪些信息、如何使用，以及你对这些信息所拥有的权利。耳边的 AI 对话功能面向 17 岁及以上用户，未满 17 岁请立即停止使用。',
    sections: [
      {
        heading: '我们收集的信息',
        body: '账号基础信息（昵称、头像、登录方式）、收听记录、片单偏好、AI 对话内容、举报与拉黑动作记录、设备本地的偏好设置。我们不会收集与服务无关的隐私信息，也不会在你未授权的情况下访问通讯录、相册或地理位置。',
      },
      {
        heading: '信息的使用方式',
        body: '用于保持登录状态、同步片单与权益、展示收听历史、改善内容推荐、维护社区秩序（举报核查与违规处置）。AI 对话内容会用于实时生成回复以及在违规举报时供人工复核，未经你同意，我们不会将信息提供给与服务无关的第三方。',
      },
      {
        heading: '内容安全与未成年保护',
        body: '我们对色情、暴力、自残、伤害未成年人等内容采取零容忍策略，并在 AI 对话与 UGC 内容上配备敏感词过滤、举报、拉黑、24 小时人工复核机制。如果你发现任何不适合未成年人的内容或针对未成年的不当行为，请立即通过应用内举报入口反馈。',
      },
      {
        heading: '你的权利',
        body: '你可以在「账号与设置」中修改账号信息、解除拉黑、查看举报状态，也可以申请注销账号；注销后我们会在合理期限内删除你的个人数据。如需导出或删除特定数据，可发送邮件至 support@erbian.fm。',
      },
    ],
  },
  terms: {
    title: '用户协议与社区准则',
    eyebrow: '服务使用条款',
    summary: '欢迎使用耳边。请在使用本应用前阅读本协议，使用即表示你同意以下条款。本协议同时是耳边平台的社区准则。',
    sections: [
      {
        heading: '服务内容',
        body: '耳边提供声音陪伴、内容发现与 AI 陪伴对话服务。你可以浏览公开内容、试听片段、收藏片单，并参与基于 AI 的角色对话。AI 对话面向 17 岁及以上用户，AI 回复均由模型即时生成，可能与事实不符，仅供陪伴与情绪疏解参考，不构成专业建议。',
      },
      {
        heading: '账号与登录',
        body: '请使用真实有效的方式注册账号，并妥善保管登录凭证。账号下的所有活动由你本人负责，不得冒用他人身份。如发现账号被盗用，请第一时间通过「帮助与反馈」联系我们。',
      },
      {
        heading: '社区准则 · 禁止内容（零容忍）',
        body: '在耳边发布、上传、聊天或评论时，严禁传播以下内容：色情或性暗示、性诱导内容；暴力、血腥、自残或教唆危险行为；任何涉及未成年人的不当内容；歧视、仇恨、骚扰、人身攻击；毒品、武器、赌博、欺诈等违法违规信息；侵犯他人著作权、肖像权或隐私的内容。一经发现，相关内容会被立即下架，账号将被警告或永久封禁。',
      },
      {
        heading: '举报与处置承诺',
        body: '在 AI 对话气泡、内容详情页、主播主页等位置都设有「举报」入口。我们承诺在你提交举报后的 24 小时内完成核查与处置：核实违规的内容会在 24 小时内移除，相关账号会被警告、限制或封禁。多次违规或情节严重者将被永久封禁，并保留追究法律责任的权利。',
      },
      {
        heading: '拉黑与个人屏蔽',
        body: '你可以在主播主页对任何创作者执行「拉黑」，被拉黑创作者的内容将不会再出现在你的浏览动线中。拉黑列表可在「账号与设置」页随时管理与解除。该机制不依赖审核团队，由你自行掌握屏蔽偏好。',
      },
      {
        heading: '用户上传内容（UGC）授权',
        body: '当你作为创作者上传音频、文字或图片时，须确认所传内容由你本人原创或已获得合法授权，且不违反本社区准则。提交即视为授予耳边在平台范围内展示、传输、缓存以及为推荐而进行必要技术处理的非排他、可撤回的许可。',
      },
      {
        heading: '付费说明',
        body: '当前版本不上线任何付费功能。未来若推出会员、时长包等付费权益，将在 iOS 端通过 Apple 内购（IAP）统一处理，不会接入支付宝、微信或其他外部支付通道；自动续费可在 App Store 系统设置中管理。',
      },
      {
        heading: '协议更新',
        body: '本协议可能根据法律法规与平台调整进行更新。重大变更会通过应用内公告或邮件通知。继续使用本服务即表示你接受更新后的条款。',
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
