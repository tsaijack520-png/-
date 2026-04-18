import type { ReactNode } from 'react'

interface StatusCardProps {
  eyebrow: string
  title: string
  description: string
  tone?: 'default' | 'success' | 'warning'
  icon?: ReactNode
  actions?: ReactNode
}

export function StatusCard({
  eyebrow,
  title,
  description,
  tone = 'default',
  icon,
  actions,
}: StatusCardProps) {
  return (
    <section className={`status-card status-card--${tone}`}>
      <div className="status-card__head">
        {icon ? <div className="status-card__icon">{icon}</div> : null}
        <div>
          <div className="status-card__eyebrow">{eyebrow}</div>
          <div className="status-card__title">{title}</div>
        </div>
      </div>
      <p className="status-card__description">{description}</p>
      {actions ? <div className="status-card__actions">{actions}</div> : null}
    </section>
  )
}

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section className="empty-state">
      <div className="empty-state__title">{title}</div>
      <p className="empty-state__description">{description}</p>
      {action ? <div className="empty-state__actions">{action}</div> : null}
    </section>
  )
}
