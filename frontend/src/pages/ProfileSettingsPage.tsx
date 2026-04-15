import { useNavigate } from 'react-router-dom'

import { SubPageHeader } from '../components/SubPageHeader'
import { useMockSession } from '../hooks/useMockSession'

export function ProfileSettingsPage() {
  const navigate = useNavigate()
  const { user, logout, switchRole } = useMockSession()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="page page--detail">
      <SubPageHeader title="账号与设置" />

      <section className="profile-account-card">
        <div className="profile-account-card__row">
          <div className="profile-account-card__avatar-wrap">
            {user?.avatarUrl ? (
              <img className="profile-account-card__avatar-image" src={user.avatarUrl} alt={`${user.nickname} 头像`} />
            ) : (
              <div className="profile-summary__avatar" aria-hidden="true">
                {user?.avatarInitial ?? '耳'}
              </div>
            )}
            <button type="button" className="button button--secondary profile-account-card__avatar-action">
              更换头像
            </button>
          </div>
          <div className="profile-account-card__body">
            <div className="profile-account-card__name">{user?.nickname ?? '未登录用户'}</div>
            <div className="profile-account-card__meta">{user?.role === 'creator' ? '创作者账号' : '听众账号'}</div>
          </div>
        </div>
      </section>

      <section className="page-section page-section--compact">
        <div className="section-header">
          <h2 className="section-header__title">身份切换</h2>
        </div>
        <div className="identity-grid">
          <button
            type="button"
            className={user?.role === 'listener' ? 'identity-card identity-card--listener identity-card--active' : 'identity-card identity-card--listener'}
            onClick={() => switchRole('listener')}
          >
            <div className="identity-card__eyebrow">听众</div>
            <div className="identity-card__title">我想听故事</div>
            <p className="identity-card__text">收听内容、购买单集、开通会员与 AI 陪伴。</p>
          </button>
          <button
            type="button"
            className={user?.role === 'creator' ? 'identity-card identity-card--creator identity-card--active' : 'identity-card identity-card--creator'}
            onClick={() => switchRole('creator')}
          >
            <div className="identity-card__eyebrow">创作者</div>
            <div className="identity-card__title">我是内容创作者</div>
            <p className="identity-card__text">进入创作中心，管理内容、查看数据与收益。</p>
          </button>
        </div>
      </section>

      <section className="page-section page-section--compact">
        <div className="section-header">
          <h2 className="section-header__title">账号信息</h2>
        </div>
        <div className="menu-stack">
          <button type="button" className="menu-card">
            <span className="menu-card__label">手机号</span>
            <span className="menu-card__value">{user?.phone ?? '去绑定'}</span>
          </button>
          <button type="button" className="menu-card">
            <span className="menu-card__label">邮箱</span>
            <span className="menu-card__value">{user?.email ?? '去绑定'}</span>
          </button>
          <button type="button" className="menu-card">
            <span className="menu-card__label">Apple 账号</span>
            <span className="menu-card__value">{user?.authMethod === 'apple' ? '已绑定' : '未绑定'}</span>
          </button>
        </div>
      </section>

      <section className="settings-list">
        <div className="toggle-row">
          <div>
            <div className="toggle-row__title">消息通知</div>
            <div className="toggle-row__meta">新内容更新、订单结果与 AI 角色提醒</div>
          </div>
          <button type="button" className="toggle-switch toggle-switch--active">
            已开启
          </button>
        </div>
        <div className="toggle-row">
          <div>
            <div className="toggle-row__title">睡前安静模式</div>
            <div className="toggle-row__meta">23:00 后减少强提醒，仅保留陪伴类通知</div>
          </div>
          <button type="button" className="toggle-switch">
            已关闭
          </button>
        </div>
      </section>

      <button type="button" className="button button--ghost button--block" onClick={handleLogout}>
        退出登录
      </button>
    </div>
  )
}
