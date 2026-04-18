import { Link } from 'react-router-dom'

import { EmptyState } from '../components/FeedbackBlocks'
import { EarBrandMark } from '../components/Icons'
import { SubPageHeader } from '../components/SubPageHeader'

export function NotFoundPage() {
  return (
    <div className="page page--detail">
      <SubPageHeader title="页面找不到了" />

      <section className="info-card info-card--memory static-page-hero">
        <div className="static-page-hero__brand">
          <EarBrandMark className="static-page-hero__logo" />
          <div>
            <div className="info-card__label">404</div>
            <div className="info-card__value info-card__value--sm">这条路走不通了</div>
          </div>
        </div>
        <p className="info-card__text">
          你访问的链接可能已经下架、拼写错误，或者还在上线准备中。先回去首页或帮助页找找其它入口。
        </p>
      </section>

      <EmptyState
        title="别担心，内容都还在"
        description="从首页、分类或 AI 陪伴入口进去，就能找到你想听的那一段。"
        action={
          <div className="static-page-footer__actions">
            <Link to="/" className="button button--primary">
              回到首页
            </Link>
            <Link to="/support/help" className="button button--secondary">
              查看帮助
            </Link>
          </div>
        }
      />
    </div>
  )
}
