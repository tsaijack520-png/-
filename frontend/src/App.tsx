import { HashRouter, Route, Routes } from 'react-router-dom'

import { AppShell } from './components/AppShell'
import { AIChatPage } from './pages/AIChatPage'
import { AIPacksPage } from './pages/AIPacksPage'
import { AIPage } from './pages/AIPage'
import { AnchorPage } from './pages/AnchorPage'
import { AuthPage } from './pages/AuthPage'
import { CategoryFilterPage } from './pages/CategoryFilterPage'
import { CategoryPage } from './pages/CategoryPage'
import { ContentDetailPage } from './pages/ContentDetailPage'
import { CreatorStudioPage } from './pages/CreatorStudioPage'
import { CreatorUploadPage } from './pages/CreatorUploadPage'
import { HomePage } from './pages/HomePage'
import { HomeSectionPage } from './pages/HomeSectionPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PlayerPage } from './pages/PlayerPage'
import { ProfileOrdersPage } from './pages/ProfileOrdersPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProfilePlaylistPage } from './pages/ProfilePlaylistPage'
import { ProfileSettingsPage } from './pages/ProfileSettingsPage'
import { ProfileVipPage } from './pages/ProfileVipPage'
import { StaticPage } from './pages/StaticPage'
import './App.css'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/category" element={<CategoryPage />} />
          <Route path="/category/filter/:filterType" element={<CategoryFilterPage />} />
          <Route path="/home/section/:sectionId" element={<HomeSectionPage />} />
          <Route path="/anchor/:anchorId" element={<AnchorPage />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="/ai/chat/:roleId" element={<AIChatPage />} />
          <Route path="/ai/packs" element={<AIPacksPage />} />
          <Route path="/me" element={<ProfilePage />} />
          <Route path="/me/playlist" element={<ProfilePlaylistPage />} />
          <Route path="/me/vip" element={<ProfileVipPage />} />
          <Route path="/me/orders" element={<ProfileOrdersPage />} />
          <Route path="/me/settings" element={<ProfileSettingsPage />} />
          <Route path="/support/:pageId" element={<StaticPage />} />
          <Route path="/creator/studio" element={<CreatorStudioPage />} />
          <Route path="/creator/upload" element={<CreatorUploadPage />} />
          <Route path="/content/:contentId" element={<ContentDetailPage />} />
          <Route path="/player/:contentId" element={<PlayerPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
