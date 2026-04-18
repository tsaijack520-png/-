import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { MenuCard } from '../components/ContentBlocks'
import { StatusCard } from '../components/FeedbackBlocks'
import { CheckCircleIcon, InfoIcon } from '../components/Icons'
import { SubPageHeader } from '../components/SubPageHeader'
import { useMockSession } from '../hooks/useMockSession'

export function ProfileSettingsPage() {
  const navigate = useNavigate()
  const { user, logout, switchRole } = useMockSession()
  const [logoutReady, setLogoutReady] = useState(false)
  const [pendingNotice, setPendingNotice] = useState<string>('')
  const [notifyOn, setNotifyOn] = useState(true)
  const [quietOn, setQuietOn] = useState(false)

  function handleLogout() {
    if (!logoutReady) {
      setLogoutReady(true)
      return
    }

    logout()
    navigate('/')
  }

  function flagPending(notice: string) {
    setPendingNotice(notice)
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
            <button
              type="button"
              className="button button--secondary profile-account-card__avatar-action"
              onClick={() => flagPending('当前版本头像随 Apple 登录账号同步展示，更换头像入口会在正式上线时打开。')}
            >
              更换头像
            </button>
          </div>
          <div className="profile-account-card__body">
            <div className="profile-account-card__name">{user?.nickname ?? '未登录用户'}</div>
            <div className="profile-account-card__meta">{user?.role === 'creator' ? '创作者账号' : '听众账号'}</div>
          </div>
        </div>
      </section>

      <StatusCard
        eyebrow="本期策略"
        title="创作者收益先展示，不开放提现"
        description="由于提现与正式结算暂时做不了，本期只保留收益感知，不暴露提现按钮、提现记录或绑定收款账户入口。"
        icon={<InfoIcon className="status-card__glyph" />}
      />

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
          <button
            type="button"
            className="menu-card"
            onClick={() => flagPending('手机号绑定走正式短信验证流程，上线后可在此入口直接修改或换绑。')}
          >
            <span className="menu-card__label">手机号</span>
            <span className="menu-card__value">{user?.phone ?? '去绑定'}</span>
          </button>
          <button
            type="button"
            className="menu-card"
            onClick={() => flagPending('邮箱绑定走正式邮件验证流程，上线后可在此入口直接修改或换绑。')}
          >
            <span className="menu-card__label">邮箱</span>
            <span className="menu-card__value">{user?.email ?? '去绑定'}</span>
          </button>
          <button
            type="button"
            className="menu-card"
            onClick={() => flagPending('Apple 账号同步在登录时生效，这里展示当前绑定状态，暂不开放解绑。')}
          >
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
          <button
            type="button"
            className={notifyOn ? 'toggle-switch toggle-switch--active' : 'toggle-switch'}
            onClick={() => setNotifyOn((value) => !value)}
          >
            {notifyOn ? '已开启' : '已关闭'}
          </button>
        </div>
        <div className="toggle-row">
          <div>
            <div className="toggle-row__title">睡前安静模式</div>
            <div className="toggle-row__meta">23:00 后减少强提醒，仅保留陪伴类通知</div>
          </div>
          <button
            type="button"
            className={quietOn ? 'toggle-switch toggle-switch--active' : 'toggle-switch'}
            onClick={() => setQuietOn((value) => !value)}
          >
            {quietOn ? '已开启' : '已关闭'}
          </button>
        </div>
      </section>

      <section className="page-section page-section--compact">
        <div className="section-header">
          <h2 className="section-header__title">帮助与法务</h2>
        </div>
        <div className="menu-stack">
          <MenuCard label="隐私政策" value="查看说明" to="/support/privacy" />
          <MenuCard label="用户协议" value="查看说明" to="/support/terms" />
          <MenuCard label="帮助与反馈" value="常见问题" to="/support/help" />
          <MenuCard label="关于耳边" value="产品定位" to="/support/about" />
        </div>
      </section>

      {pendingNotice ? (
        <StatusCard
          eyebrow="上线后开放"
          title="这个入口当前演示阶段暂不开放"
          description={pendingNotice}
          tone="default"
          icon={<InfoIcon className="status-card__glyph" />}
          actions={
            <button type="button" className="button button--ghost" onClick={() => setPendingNotice('')}>
              我知道了
            </button>
          }
        />
      ) : null}

      {logoutReady ? (
        <StatusCard
          eyebrow="退出确认"
          title="再点一次就会退出当前账号"
          description="退出后会回到首页，但当前设备内的体验记录仍会保留，方便你稍后继续检查流程。"
          tone="warning"
          icon={<CheckCircleIcon className="status-card__glyph" />}
        />
      ) : null}

      <button type="button" className="button button--ghost button--block" onClick={handleLogout}>
        {logoutReady ? '确认退出登录' : '退出登录'}
      </button>
    </div>
  )
}
