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
  const isPreview = !isCreator

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isPreview) {
      navigate('/me/settings')
      return
    }

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
            <div className="info-card__label">当前为预览模式</div>
            <div className="info-card__value info-card__value--sm">切换为创作者后才可正式发布内容</div>
          </div>
          <p className="info-card__text">上传页已经做好，你现在可以先体验流程和信息结构；真正提交草稿时，先去“账号与设置”切换为创作者身份。</p>
          <Link to="/me/settings" className="button button--secondary">
            去切换身份
          </Link>
        </section>
      ) : null}

      {submitted ? (
        <StatusCard
          eyebrow="草稿已提交"
          title="已回到引流阶段的最小创作者闭环"
          description="这一步先证明创作者能顺利上传并看到结果，收益提现等更重的结算能力继续后置。"
          tone="success"
          icon={<CheckCircleIcon className="status-card__glyph" />}
        />
      ) : (
        <StatusCard
          eyebrow="本期目标"
          title="先把上传和审核预期讲清楚"
          description="当前先承接内容发布意愿，让创作者看见草稿、审核和收益表现，不开放提现与结算。"
          icon={<InfoIcon className="status-card__glyph" />}
        />
      )}

      <form className="auth-form creator-form" onSubmit={handleSubmit}>
        <section className="creator-upload-intro">
          <div>
            <div className="info-card__label">发布流程</div>
            <div className="info-card__value info-card__value--sm">先提交草稿，再回工作台继续完善</div>
          </div>
          <p className="info-card__text">当前已包含标题、简介、角色、场景与文件占位，后续可继续补封面、定价与上架信息。</p>
        </section>

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
            {fileNotice || '上传音频文件与封面图后，将以草稿状态回到工作台继续编辑与提交审核。'}
          </div>
          <div className="creator-upload-card__actions">
            <button
              type="button"
              className="button button--secondary"
              disabled={isPreview}
              onClick={() => setFileNotice('演示阶段仅保存文本草稿，音频文件入口会在正式上线时开放。')}
            >
              选择音频文件
            </button>
            <button
              type="button"
              className="button button--ghost"
              disabled={isPreview}
              onClick={() => setFileNotice('封面图上传会与审核流程串联，目前以系统默认封面代替。')}
            >
              上传封面图
            </button>
          </div>
        </section>

        <button type="submit" className="button button--primary button--block">
          {isPreview ? '去切换为创作者' : '提交为草稿'}
        </button>
      </form>
    </div>
  )
}
