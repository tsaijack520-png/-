import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { StatusCard } from '../components/FeedbackBlocks'
import { CheckCircleIcon, InfoIcon } from '../components/Icons'
import { SubPageHeader } from '../components/SubPageHeader'
import { roleFilters, sceneFilters } from '../data/mockData'
import { useMockSession } from '../hooks/useMockSession'

export function CreatorUploadPage() {
  const navigate = useNavigate()
  const { addCreatorUpload, isCreator } = useMockSession()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [role, setRole] = useState<(typeof roleFilters)[number]>(roleFilters[0])
  const [scene, setScene] = useState<(typeof sceneFilters)[number]>(sceneFilters[0])
  const [submitted, setSubmitted] = useState(false)
  const [fileNotice, setFileNotice] = useState<string>('')
  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [policyError, setPolicyError] = useState('')
  const isPreview = !isCreator

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isPreview) {
      navigate('/me/settings')
      return
    }

    if (!policyAccepted) {
      setPolicyError('请先确认你已阅读并承诺遵守社区准则。')
      return
    }

    setPolicyError('')
    addCreatorUpload({
      title: title.trim() || '未命名草稿',
      role,
      scene,
    })
    setSubmitted(true)
    window.setTimeout(() => navigate('/creator/studio'), 900)
  }

  return (
    <div className="page page--detail">
      <SubPageHeader title="上传内容" />

      {isPreview ? (
        <section className="creator-preview-banner">
          <div>
            <div className="info-card__label">听众视角</div>
            <div className="info-card__value info-card__value--sm">切换为创作者后可发布内容</div>
          </div>
          <p className="info-card__text">在「账号与设置」中切换为创作者身份，即可开始上传并提交草稿。</p>
          <Link to="/me/settings" className="button button--secondary">
            去切换身份
          </Link>
        </section>
      ) : null}

      {submitted ? (
        <StatusCard
          eyebrow="草稿已提交"
          title="可回到工作台继续完善"
          description="内容会进入审核流程，通过后会在首页和分类中展示。审核通常在 24 小时内完成。"
          tone="success"
          icon={<CheckCircleIcon className="status-card__glyph" />}
        />
      ) : (
        <StatusCard
          eyebrow="发布说明"
          title="所有内容须先经审核才能上架"
          description="耳边对色情、暴力、自残、伤害未成年人、歧视等内容采取零容忍政策。涉嫌违规的草稿会被驳回，多次违规账号将被封禁。"
          icon={<InfoIcon className="status-card__glyph" />}
          actions={
            <Link to="/support/terms" className="button button--ghost">
              查看社区准则
            </Link>
          }
        />
      )}

      <form className="auth-form creator-form" onSubmit={handleSubmit}>

        <label className="auth-field auth-field--line">
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="请输入内容标题" disabled={isPreview} />
        </label>

        <label className="auth-field">
          <span className="auth-field__label">内容简介</span>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="补充剧情、情绪走向或适合的收听场景" disabled={isPreview} />
        </label>

        <div className="creator-form__grid">
          <label className="auth-field">
            <span className="auth-field__label">角色标签</span>
            <select value={role} onChange={(event) => setRole(event.target.value as (typeof roleFilters)[number])} disabled={isPreview}>
              {roleFilters.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="auth-field">
            <span className="auth-field__label">场景标签</span>
            <select value={scene} onChange={(event) => setScene(event.target.value as (typeof sceneFilters)[number])} disabled={isPreview}>
              {sceneFilters.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="creator-upload-card creator-upload-card--placeholder">
          <div className="creator-upload-card__title">音频与封面</div>
          <div className="creator-upload-card__meta">
            {fileNotice || '上传音频文件与封面图后，可在工作台继续编辑并提交审核。'}
          </div>
          <div className="creator-upload-card__actions">
            <button
              type="button"
              className="button button--secondary"
              disabled={isPreview}
              onClick={() => setFileNotice('音频文件上传功能即将上线。')}
            >
              选择音频文件
            </button>
            <button
              type="button"
              className="button button--ghost"
              disabled={isPreview}
              onClick={() => setFileNotice('封面图上传功能即将上线，当前使用系统默认封面。')}
            >
              上传封面图
            </button>
          </div>
        </section>

        <label className={policyError ? 'creator-policy-check creator-policy-check--error' : 'creator-policy-check'}>
          <input
            type="checkbox"
            checked={policyAccepted}
            onChange={(event) => {
              setPolicyAccepted(event.target.checked)
              if (event.target.checked) {
                setPolicyError('')
              }
            }}
            disabled={isPreview}
          />
          <span>
            我已阅读 <Link to="/support/terms" className="text-link">《社区准则与用户协议》</Link>，承诺所传内容不含色情、暴力、自残、伤害未成年人、歧视、骚扰或其他违法违规信息，并对内容真实性负责。
          </span>
        </label>
        {policyError ? <div className="auth-field__error">{policyError}</div> : null}

        <button type="submit" className="button button--primary button--block">
          {isPreview ? '去切换为创作者' : '提交草稿'}
        </button>
      </form>
    </div>
  )
}
