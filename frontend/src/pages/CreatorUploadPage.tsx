import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

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
    navigate('/creator/studio')
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
          <div className="creator-upload-card__meta">上传音频文件与封面图后，将以草稿状态回到工作台继续编辑与提交审核。</div>
          <div className="creator-upload-card__actions">
            <button type="button" className="button button--secondary" disabled={isPreview}>
              选择音频文件
            </button>
            <button type="button" className="button button--ghost" disabled={isPreview}>
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
