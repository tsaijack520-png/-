import { NavLink } from 'react-router-dom'

import { GridIcon, HomeIcon, SparkleIcon, UserIcon } from './Icons'

const items = [
  { to: '/', label: '首页', icon: HomeIcon, end: true },
  { to: '/category', label: '分类', icon: GridIcon },
  { to: '/ai', label: 'AI陪伴', icon: SparkleIcon },
  { to: '/me', label: '我的', icon: UserIcon },
]

export function BottomTabBar() {
  return (
    <nav className="bottom-tab-bar" aria-label="主导航">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            isActive ? 'bottom-tab bottom-tab--active' : 'bottom-tab'
          }
        >
          <Icon className="bottom-tab__icon" />
          <span className="bottom-tab__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
