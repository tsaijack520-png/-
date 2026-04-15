import { Link } from 'react-router-dom'

import { useMockSession } from '../hooks/useMockSession'
import { EarBrandMark } from './Icons'

export function TopBar() {
  const { isAuthenticated } = useMockSession()

  return (
    <header className="topbar">
      <div className="topbar__brand">
        <EarBrandMark className="topbar__logo" />
        <div className="topbar__wordmark">
          <div className="topbar__name">耳边</div>
          <div className="topbar__tagline">晚一点，再听一会儿</div>
        </div>
      </div>
      {isAuthenticated ? null : (
        <Link to="/auth" className="topbar__login-link">
          登录
        </Link>
      )}
    </header>
  )
}
