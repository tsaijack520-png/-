import { Outlet } from 'react-router-dom'

import { BottomTabBar } from './BottomTabBar'

export function AppShell() {
  return (
    <div className="app-shell">
      <div className="app-shell__frame">
        <main className="app-shell__content">
          <Outlet />
        </main>
        <BottomTabBar />
      </div>
    </div>
  )
}
