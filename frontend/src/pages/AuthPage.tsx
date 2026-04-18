import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { defaultMockSession, mockUsers } from '../data/mockData'
import { useMockSession } from '../hooks/useMockSession'
import type { AuthMethod, MockUser, UserRole } from '../types/app'
import { AppleIcon, EarBrandMark, MailIcon, PhoneIcon } from '../components/Icons'

const secondaryMethods: { value: Exclude<AuthMethod, 'nickname'>; label: string; Icon: typeof PhoneIcon }[] = [
  { value: 'phone', label: '手机号登录', Icon: PhoneIcon },
  { value: 'email', label: '邮箱登录', Icon: MailIcon },
  { value: 'apple', label: 'Apple 登录', Icon: AppleIcon },
]

export function AuthPage() {
  const navigate = useNavigate()
  const { login } = useMockSession()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [method, setMethod] = useState<AuthMethod>('nickname')
  const [step, setStep] = useState<'form' | 'identity'>('form')
  const [nickname, setNickname] = useState(defaultMockSession.nickname)
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('13800138000')
  const [email, setEmail] = useState('hello@erbian.fm')
  const [pendingUser, setPendingUser] = useState<MockUser | null>(null)
  const [error, setError] = useState('')

  const pageTitle = useMemo(() => {
    if (step === 'identity') {
      return '选择你的身份'
    }

    if (mode === 'register') {
      return '创建账号'
    }

    if (method === 'phone') {
      return '手机号登录'
    }

    if (method === 'email') {
      return '邮箱登录'
    }

    if (method === 'apple') {
      return 'Apple 登录'
    }

    return '欢迎回来'
  }, [method, mode, step])

  const helperText = useMemo(() => {
    if (step === 'identity') {
      return '听众与创作者身份均可在设置页切换。'
    }

    if (method === 'phone') {
      return '输入手机号后继续完成登录。'
    }

    if (method === 'email') {
      return '使用邮箱与密码进入当前账号。'
    }

    if (method === 'apple') {
      return '使用 Apple 账号可快速完成登录。'
    }

    return mode === 'login'
      ? '输入昵称与密码即可继续。'
      : '先完成基础信息，再继续选择身份。'
  }, [method, mode, step])

  function buildUser(role: UserRole) {
    const baseUser = role === 'creator' ? mockUsers.creator : mockUsers.listener

    return {
      ...baseUser,
      nickname: nickname.trim() || baseUser.nickname,
      authMethod: method,
      phone: method === 'phone' ? phone : baseUser.phone,
      email: method === 'email' || method === 'apple' ? email || baseUser.email : baseUser.email,
    } satisfies MockUser
  }

  function validateNickname(value: string) {
    return /^[\p{Script=Han}A-Za-z0-9]{2,20}$/u.test(value)
  }

  function handleSubmit() {
    setError('')

    if (method === 'nickname' && !validateNickname(nickname.trim())) {
      setError('请输入 2~20 位昵称。')
      return
    }

    if ((method === 'nickname' || method === 'email') && password.trim().length < 4) {
      setError('请输入至少 4 位密码。')
      return
    }

    if (method === 'phone' && phone.trim().length < 11) {
      setError('请输入完整手机号。')
      return
    }

    if (mode === 'login' || method === 'apple') {
      const targetUser = method === 'email' ? mockUsers.creator : mockUsers.listener
      login({
        ...targetUser,
        nickname: nickname.trim() || targetUser.nickname,
        authMethod: method,
        phone: method === 'phone' ? phone : targetUser.phone,
        email: method === 'email' || method === 'apple' ? email || targetUser.email : targetUser.email,
      })
      navigate('/')
      return
    }

    setPendingUser(buildUser('listener'))
    setStep('identity')
  }

  function handleSelectRole(role: UserRole) {
    const nextUser = pendingUser
      ? { ...pendingUser, ...buildUser(role), role }
      : buildUser(role)

    login(nextUser)
    navigate('/')
  }

  return (
    <div className="auth-page">
      <div className="auth-page__brand">
        <EarBrandMark className="auth-page__logo" />
        <div>
          <div className="auth-page__name">耳边</div>
          <div className="auth-page__tagline">晚一点，再听一会儿</div>
        </div>
      </div>

      <section className="auth-card">
        <div className="auth-card__top">
          <div className="auth-tab-bar auth-tab-bar--inline">
            <button
              type="button"
              className={mode === 'login' ? 'auth-tab auth-tab--active' : 'auth-tab'}
              onClick={() => {
                setMode('login')
                setMethod('nickname')
                setError('')
              }}
            >
              登录
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'auth-tab auth-tab--active' : 'auth-tab'}
              onClick={() => {
                setMode('register')
                setMethod('nickname')
                setError('')
              }}
            >
              注册
            </button>
          </div>
          <div className="auth-card__copy">
            <h1 className="auth-card__title">{pageTitle}</h1>
            <p className="auth-card__subtitle">{helperText}</p>
          </div>
        </div>

        {step === 'form' ? (
          <>
            <div className="auth-form auth-form--primary">
              {method === 'nickname' ? (
                <>
                  <label className="auth-field auth-field--line">
                    <input
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                      placeholder="请输入昵称"
                    />
                  </label>
                  <label className="auth-field auth-field--line">
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="请输入密码"
                    />
                  </label>
                </>
              ) : null}

              {method === 'phone' ? (
                <label className="auth-field auth-field--line">
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="请输入手机号"
                  />
                </label>
              ) : null}

              {method === 'email' ? (
                <>
                  <label className="auth-field auth-field--line">
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="请输入邮箱"
                    />
                  </label>
                  <label className="auth-field auth-field--line">
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="请输入密码"
                    />
                  </label>
                </>
              ) : null}

              {error ? <div className="auth-error">{error}</div> : null}

              <button type="button" className="button button--primary button--block" onClick={handleSubmit}>
                {method === 'apple'
                  ? '使用 Apple 继续'
                  : mode === 'login'
                    ? '登录'
                    : '下一步'}
              </button>
            </div>

            <div className="auth-secondary-methods">
              <div className="auth-secondary-methods__label">其他登录方式</div>
              <div className="auth-secondary-methods__list">
                {secondaryMethods.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    className={method === value ? 'auth-method-icon auth-method-icon--active' : 'auth-method-icon'}
                    aria-label={label}
                    onClick={() => {
                      setMethod(value)
                      setError('')
                    }}
                  >
                    <Icon className="auth-method-icon__glyph" />
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="identity-grid">
            <button type="button" className="identity-card identity-card--listener" onClick={() => handleSelectRole('listener')}>
              <div className="identity-card__eyebrow">听众</div>
              <div className="identity-card__title">我想听故事</div>
              <p className="identity-card__text">收听内容、购买单集、开通会员与 AI 陪伴。</p>
            </button>
            <button type="button" className="identity-card identity-card--creator" onClick={() => handleSelectRole('creator')}>
              <div className="identity-card__eyebrow">创作者</div>
              <div className="identity-card__title">我是内容创作者</div>
              <p className="identity-card__text">进入创作中心，管理内容、查看数据与收益。</p>
            </button>
            <button type="button" className="button button--ghost button--block" onClick={() => setStep('form')}>
              返回上一步
            </button>
          </div>
        )}
      </section>

      <div className="auth-legal-links">
        <Link to="/support/privacy" className="section-header__action-link">
          隐私政策
        </Link>
        <Link to="/support/terms" className="section-header__action-link">
          用户协议
        </Link>
        <Link to="/support/help" className="section-header__action-link">
          帮助与反馈
        </Link>
      </div>
    </div>
  )
}
