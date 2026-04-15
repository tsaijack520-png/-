import { Link } from 'react-router-dom'

interface SectionHeaderProps {
  title: string
  actionLabel?: string
  moreTo?: string
  onActionClick?: () => void
}

export function SectionHeader({
  title,
  actionLabel = '更多',
  moreTo,
  onActionClick,
}: SectionHeaderProps) {
  return (
    <div className="section-header">
      <h2 className="section-header__title">{title}</h2>
      {actionLabel ? (
        moreTo ? (
          <Link to={moreTo} className="section-header__action-link">
            {actionLabel}
          </Link>
        ) : (
          <button type="button" className="section-header__action" onClick={onActionClick}>
            {actionLabel}
          </button>
        )
      ) : null}
    </div>
  )
}
