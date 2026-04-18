import { Link } from 'react-router-dom'

import { MenuCard, PosterCard } from '../components/ContentBlocks'
import { StatusCard } from '../components/FeedbackBlocks'
import { WalletIcon } from '../components/Icons'
import { useMockSession } from '../hooks/useMockSession'
import { SectionHeader } from '../components/SectionHeader'

export function ProfilePage() {
  const { user, isAuthenticated, isCreator, playlistItems, profileSummary } = useMockSession()
  const profileAssets = [
    {
      id: 'vip',
      label: 'VIP 会员',
      value: user?.vipStatus.subscriptionActive ? '已开通' : '未开通',
      tone: 'gold' as const,
      to: '/me/vip',
    },
    {
      id: 'ai-time',
      label: 'AI 陪伴时长',
      value: `${profileSummary.aiMinutes} 分钟`,
      tone: 'accent' as const,
      to: '/ai/packs',
    },
    {
      id: 'orders',
      label: '订单记录',
      value: '查看全部',
      to: '/me/orders',
    },
    {
      id: 'settings',
      label: '账号与绑定',
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
              已购内容 {profileSummary.purchasedCount} · 片单 {profileSummary.playlistCount} · AI 时长 {profileSummary.aiMinutes} 分钟
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
        <SectionHeader title="权益与资产" actionLabel="" />
        <div className="menu-stack">
          {profileAssets.map((item) => (
            <MenuCard key={item.id} label={item.label} value={item.value} tone={item.tone} to={item.to} />
          ))}
        </div>
      </section>

      {isCreator ? null : (
        <StatusCard
          eyebrow="账户余额"
          title={`${user.vipStatus.creditBalance} 点`}
          description="可用于解锁单集或兑换 AI 陪伴时长。"
          icon={<WalletIcon className="status-card__glyph" />}
        />
      )}
    </div>
  )
}
