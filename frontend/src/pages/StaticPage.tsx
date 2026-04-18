import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'

import { AppleIcon, EarBrandMark } from '../components/Icons'
import { SubPageHeader } from '../components/SubPageHeader'

const pageContent = {
  privacy: {
    title: '隐私政策',
    eyebrow: '正式环境上线前必备',
    summary: '耳边当前以体验与引流为主，仅保留最少必要信息用于账号识别、订单展示与体验记录。',
    sections: [
      {
        heading: '我们会记录什么',
        body: '仅记录账号基础信息、体验记录、已购状态与设备侧本地缓存，用于保证试听、片单和会员体验连续。',
      },
      {
        heading: '为什么记录',
        body: '用于登录后继续收听、展示订单结果、保留创作者草稿与减少重复操作。',
      },
      {
        heading: '当前阶段说明',
        body: '本版本仍是上线前体验稿，支付与提现能力尚未正式开通，相关数据仅作流程演示。',
      },
    ],
  },
  terms: {
    title: '用户协议',
    eyebrow: '正式环境上线前必备',
    summary: '耳边提供声音陪伴与内容发现服务，当前版本以内容体验、转化引导和创作者入驻展示为主。',
    sections: [
      {
        heading: '服务说明',
        body: '你可以浏览公开内容、体验试听、收藏片单、查看会员与 AI 时长方案，并在后续开放时完成正式购买。',
      },
      {
        heading: '账号与内容',
        body: '请勿冒用他人身份发布内容，也不要将平台内素材用于未授权传播。创作者内容仍需经过审核后再展示。',
      },
      {
        heading: '交易说明',
        body: '当前版本展示的是 Apple 内购风格体验流程，不构成真实扣费承诺，正式支付能力以实际上线版本为准。',
      },
    ],
  },
  help: {
    title: '帮助与反馈',
    eyebrow: '体验问题统一入口',
    summary: '如果你在试听、登录、片单或会员展示中遇到问题，可以先通过这里找到对应说明。',
    sections: [
      {
        heading: '常见问题',
        body: '登录后仍未看到会员权益、片单未同步、AI 时长未更新时，优先检查是否仍在当前设备与同一账号下体验。',
      },
      {
        heading: '反馈通道',
        body: '当前建议通过产品运营或内测群统一收集问题，正式环境可补充客服邮箱、工单或站内反馈。',
      },
      {
        heading: '本期限制',
        body: '提现与正式结算暂未开放，创作者侧当前仅展示收益预估与内容管理结构。',
      },
    ],
  },
  about: {
    title: '关于耳边',
    eyebrow: '产品定位说明',
    summary: '耳边当前定位是声音陪伴方向的引流产品，重点是让用户快速进入内容氛围、建立偏好与后续转化意愿。',
    sections: [
      {
        heading: '产品目标',
        body: '先用首页、分类、AI 陪伴和主播内容建立第一印象，再通过轻量权益与会员方案承接后续转化。',
      },
      {
        heading: '为什么先做轻交易',
        body: '本阶段优先验证内容吸引力、回访与留资效率，因此支付与提现只保留必要展示，不做重交易心智。',
      },
      {
        heading: '联系我们',
        body: '正式环境可在这里补充品牌介绍、商务合作、创作者入驻与客服联系方式。',
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

      <section className="info-card static-page-footer">
        <div className="static-page-footer__head">
          <AppleIcon className="static-page-footer__icon" />
          <div>
            <div className="info-card__label">当前阶段</div>
            <div className="info-card__value info-card__value--sm">以体验闭环与转化引导为主</div>
          </div>
        </div>
        <p className="info-card__text">支付采用 Apple 内购风格演示路径，提现与正式结算入口暂时隐藏，避免形成不可用死路。</p>
        <div className="static-page-footer__actions">
          <Link to="/me/settings" className="button button--secondary">
            返回设置
          </Link>
          <Link to="/" className="button button--ghost">
            回到首页
          </Link>
        </div>
      </section>
    </div>
  )
}
