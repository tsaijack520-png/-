import { Link } from 'react-router-dom'

import { MenuCard, PosterCard } from '../components/ContentBlocks'
import { useMockSession } from '../hooks/useMockSession'
import { SectionHeader } from '../components/SectionHeader'

export function ProfilePage() {
  const { user, isAuthenticated, isCreator, playlistItems, profileSummary } = useMockSession()
  const profileAssets = [
    {
      id: 'ai-time',
      label: 'AI 陪伴时长',
      value: `${profileSummary.aiMinutes} 分钟`,
      tone: 'accent' as const,
      to: '/ai',
    },
    {
      id: 'playlist',
      label: '我的片单',
      value: `${profileSummary.playlistCount} 条`,
      to: '/me/playlist',
    },
    {
      id: 'records',
      label: '收听 / 解锁记录',
      value: '查看全部',
      to: '/me/orders',
    },
    {
      id: 'settings',
      label: '账号与设置',
      value: '头像 / 手机 / 邮箱 / Apple',
      to: '/me/settings',
    },
  ]

  if (!isAuthenticated || !user) {
    return (
      <div className="page">
        <section className="profile-summary profile-summary--stacked">
          <div className="profile-summary__row">
            <div className="profile-summary__avatar" aria-hidden="true">
              耳
            </div>
            <div>
              <div className="profile-summary__name">登录后查看个人资产</div>
              <div className="profile-summary__meta">登录后可统一查看片单、订单、会员权益与 AI 记录。</div>
            </div>
          </div>

          <Link to="/auth" className="button button--primary button--block">
            登录 / 注册
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="page">
      <section className="profile-summary profile-summary--stacked">
        <div className="profile-summary__row">
          <div className="profile-summary__avatar" aria-hidden="true">
            {user.avatarUrl ? (
              <img className="profile-summary__avatar-image" src={user.avatarUrl} alt={`${user.nickname} 头像`} />
            ) : (
              user.avatarInitial
            )}
          </div>
          <div className="profile-summary__body">
            <div className="profile-summary__name-row">
              <div className="profile-summary__name">{user.nickname}</div>
              <span className={isCreator ? 'role-badge role-badge--creator' : 'role-badge'}>
                {isCreator ? '创作者' : '听众'}
              </span>
            </div>
            <div className="profile-summary__meta">
              片单 {profileSummary.playlistCount} · AI 体验时长 {profileSummary.aiMinutes} 分钟
            </div>
          </div>
        </div>
        {isCreator ? (
          <Link to="/creator/studio" className="button button--secondary">
            进入创作中心
          </Link>
        ) : null}
      </section>

      <section className="page-section">
        <SectionHeader title="我的片单" moreTo="/me/playlist" />
        <div className="poster-row">
          {playlistItems.slice(0, 3).map((item) => (
            <PosterCard
              key={item.id}
              title={item.title}
              meta={item.subtitle}
              badge={item.badge}
              badgeTone={item.badgeTone}
              tone={item.tone}
              to={item.to}
              coverImageUrl={item.coverImageUrl}
            />
          ))}
        </div>
      </section>

      <section className="page-section page-section--compact">
        <SectionHeader title="账户与资产" actionLabel="" />
        <div className="menu-stack">
          {profileAssets.map((item) => (
            <MenuCard key={item.id} label={item.label} value={item.value} tone={item.tone} to={item.to} />
          ))}
        </div>
      </section>
    </div>
  )
}
