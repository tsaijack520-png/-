import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { MenuCard } from '../components/ContentBlocks'
import { StatusCard } from '../components/FeedbackBlocks'
import { AppleIcon, CheckCircleIcon, InfoIcon } from '../components/Icons'
import { SubPageHeader } from '../components/SubPageHeader'
import { anchorProfiles } from '../data/mockData'
import { useMockSession } from '../hooks/useMockSession'

type EditingField = 'phone' | 'email' | 'apple' | null

export function ProfileSettingsPage() {
  const navigate = useNavigate()
  const { user, logout, switchRole, updateUser, blockedAnchorIds, unblockAnchor, reportLog } = useMockSession()

  const blockedAnchors = useMemo(
    () =>
      blockedAnchorIds.map((id) => ({
        id,
        name: anchorProfiles[id]?.name ?? id,
      })),
    [blockedAnchorIds],
  )

  const recentReports = reportLog.slice(0, 5)
  const [logoutReady, setLogoutReady] = useState(false)
  const [pendingNotice, setPendingNotice] = useState<string>('')
  const [notifyOn, setNotifyOn] = useState(true)
  const [quietOn, setQuietOn] = useState(false)
  const [editingField, setEditingField] = useState<EditingField>(null)
  const [phoneInput, setPhoneInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [appleInput, setAppleInput] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [saveFeedback, setSaveFeedback] = useState('')

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

  function openEditor(field: EditingField) {
    if (!user) {
      navigate('/auth')
      return
    }

    setFieldError('')
    setSaveFeedback('')
    setEditingField(field)
    if (field === 'phone') {
      setPhoneInput('')
    } else if (field === 'email') {
      setEmailInput('')
    } else if (field === 'apple') {
      setAppleInput('')
    }
  }

  function closeEditor() {
    setEditingField(null)
    setFieldError('')
  }

  function handlePhoneSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = phoneInput.trim()
    if (!/^1\d{10}$/.test(value)) {
      setFieldError('请输入 11 位有效手机号。')
      return
    }
    updateUser({ phone: value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') })
    setSaveFeedback('手机号已更新。')
    closeEditor()
  }

  function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = emailInput.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setFieldError('请输入有效邮箱地址。')
      return
    }
    updateUser({ email: value })
    setSaveFeedback('邮箱已更新。')
    closeEditor()
  }

  function handleAppleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = appleInput.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setFieldError('请输入有效的 Apple ID（邮箱格式）。')
      return
    }
    updateUser({ authMethod: 'apple', email: value })
    setSaveFeedback('Apple 账号已绑定。')
    closeEditor()
  }

  const appleBound = user?.authMethod === 'apple'

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
              onClick={() => flagPending('更换头像功能即将上线。')}
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
            <p className="identity-card__text">收听内容、收藏片单，体验 AI 陪伴对话。</p>
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
            onClick={() => openEditor(editingField === 'phone' ? null : 'phone')}
          >
            <span className="menu-card__label">手机号</span>
            <span className="menu-card__value">{user?.phone ?? '去绑定'}</span>
          </button>
          {editingField === 'phone' ? (
            <form className="inline-field-form" onSubmit={handlePhoneSubmit}>
              <label className="inline-field-form__label">请输入新手机号</label>
              <input
                className="inline-field-form__input"
                value={phoneInput}
                onChange={(event) => setPhoneInput(event.target.value)}
                placeholder="11 位手机号"
                maxLength={11}
                inputMode="numeric"
                autoFocus
              />
              {fieldError ? <div className="inline-field-form__error">{fieldError}</div> : null}
              <div className="inline-field-form__actions">
                <button type="button" className="button button--ghost" onClick={closeEditor}>
                  取消
                </button>
                <button type="submit" className="button button--primary">
                  保存
                </button>
              </div>
            </form>
          ) : null}

          <button
            type="button"
            className="menu-card"
            onClick={() => openEditor(editingField === 'email' ? null : 'email')}
          >
            <span className="menu-card__label">邮箱</span>
            <span className="menu-card__value">{user?.email ?? '去绑定'}</span>
          </button>
          {editingField === 'email' ? (
            <form className="inline-field-form" onSubmit={handleEmailSubmit}>
              <label className="inline-field-form__label">请输入新邮箱</label>
              <input
                className="inline-field-form__input"
                type="email"
                value={emailInput}
                onChange={(event) => setEmailInput(event.target.value)}
                placeholder="name@example.com"
                autoFocus
              />
              {fieldError ? <div className="inline-field-form__error">{fieldError}</div> : null}
              <div className="inline-field-form__actions">
                <button type="button" className="button button--ghost" onClick={closeEditor}>
                  取消
                </button>
                <button type="submit" className="button button--primary">
                  保存
                </button>
              </div>
            </form>
          ) : null}

          <button
            type="button"
            className="menu-card"
            onClick={() => {
              if (appleBound) {
                flagPending('当前账号已绑定 Apple ID，如需解绑请通过"退出登录"重新选择登录方式。')
                return
              }
              openEditor(editingField === 'apple' ? null : 'apple')
            }}
          >
            <span className="menu-card__label">Apple 账号</span>
            <span className="menu-card__value">{appleBound ? '已绑定' : '去绑定'}</span>
          </button>
          {editingField === 'apple' ? (
            <form className="inline-field-form" onSubmit={handleAppleSubmit}>
              <div className="inline-field-form__head">
                <AppleIcon className="inline-field-form__glyph" />
                <div>
                  <div className="inline-field-form__label">绑定 Apple 账号</div>
                  <div className="inline-field-form__hint">请输入你的 Apple ID，绑定后可使用 Apple 快速登录。</div>
                </div>
              </div>
              <input
                className="inline-field-form__input"
                type="email"
                value={appleInput}
                onChange={(event) => setAppleInput(event.target.value)}
                placeholder="Apple ID（邮箱）"
                autoFocus
              />
              {fieldError ? <div className="inline-field-form__error">{fieldError}</div> : null}
              <div className="inline-field-form__actions">
                <button type="button" className="button button--ghost" onClick={closeEditor}>
                  取消
                </button>
                <button type="submit" className="button button--primary">
                  确认绑定
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </section>

      {saveFeedback ? (
        <StatusCard
          eyebrow="已保存"
          title="账号信息已更新"
          description={saveFeedback}
          tone="success"
          icon={<CheckCircleIcon className="status-card__glyph" />}
          actions={
            <button type="button" className="button button--ghost" onClick={() => setSaveFeedback('')}>
              我知道了
            </button>
          }
        />
      ) : null}

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
          <h2 className="section-header__title">已拉黑创作者</h2>
        </div>
        {blockedAnchors.length === 0 ? (
          <p className="info-card__text settings-empty-line">暂无拉黑记录。在主播主页可对违规创作者进行拉黑，拉黑后其内容不会再出现在你的浏览动线中。</p>
        ) : (
          <div className="menu-stack">
            {blockedAnchors.map((anchor) => (
              <div key={anchor.id} className="menu-card menu-card--row">
                <div>
                  <div className="menu-card__label">{anchor.name}</div>
                  <div className="menu-card__value">已屏蔽其全部内容</div>
                </div>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => unblockAnchor(anchor.id)}
                >
                  解除拉黑
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="page-section page-section--compact">
        <div className="section-header">
          <h2 className="section-header__title">我的举报记录</h2>
        </div>
        {recentReports.length === 0 ? (
          <p className="info-card__text settings-empty-line">还没有提交过举报。在 AI 对话气泡、内容详情页和主播主页都能找到「举报」入口，开发团队承诺在 24 小时内核查处理。</p>
        ) : (
          <div className="menu-stack">
            {recentReports.map((report) => (
              <article key={report.id} className="report-row">
                <div>
                  <div className="report-row__title">{report.targetTitle}</div>
                  <div className="report-row__meta">
                    {report.surface === 'ai' ? 'AI 回复' : report.surface === 'content' ? '内容' : report.surface === 'anchor' ? '创作者' : '评论'}
                    {' · '}
                    {report.reason}
                    {' · '}
                    {report.submittedAt}
                  </div>
                </div>
                <span className="report-row__status">{report.status}</span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="page-section page-section--compact">
        <div className="section-header">
          <h2 className="section-header__title">帮助与法务</h2>
        </div>
        <div className="menu-stack">
          <MenuCard label="隐私政策" value="查看说明" to="/support/privacy" />
          <MenuCard label="用户协议与社区准则" value="查看说明" to="/support/terms" />
          <MenuCard label="帮助与反馈" value="常见问题" to="/support/help" />
          <MenuCard label="关于耳边" value="产品介绍" to="/support/about" />
        </div>
      </section>

      {pendingNotice ? (
        <StatusCard
          eyebrow="提示"
          title="功能即将上线"
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
          title="再点一次即可退出当前账号"
          description="退出后会回到首页，登录记录不会影响当前设备上的收听与片单。"
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
