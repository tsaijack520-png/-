import { useNavigate } from 'react-router-dom'

import { ChevronLeftIcon } from './Icons'

interface SubPageHeaderProps {
  title?: string
}

export function SubPageHeader({ title }: SubPageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="subpage-header">
      <button
        type="button"
        className="subpage-header__back"
        aria-label="返回"
        onClick={() => navigate(-1)}
      >
        <ChevronLeftIcon className="subpage-header__back-icon" />
      </button>
      {title ? (
        <div className="subpage-header__title">{title}</div>
      ) : (
        <div className="subpage-header__title-placeholder" aria-hidden="true" />
      )}
      <div className="subpage-header__side-placeholder" aria-hidden="true" />
    </header>
  )
}
