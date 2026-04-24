// Directus row → 前端 app 类型
//
// 字段命名从 snake_case 转 camelCase，文件 UUID 转成 /assets/:id 公开 URL

import type {
  AIPackItem,
  AIRoleItem,
  AnchorProfile,
  BannerAction,
  BannerItem,
  ContentDetailData,
  ContentItem,
  FeatureIconKey,
  FeatureTileItem,
  HomeSectionId,
  PlayerStateData,
  SeriesItem,
  SortTag,
  SurfaceTone,
  VipPlan,
} from '../types/app'
import { assetUrl } from './client'

const TONES: SurfaceTone[] = ['violet', 'rose', 'blue', 'gold', 'emerald']

function toTone(value: unknown): SurfaceTone {
  return TONES.includes(value as SurfaceTone) ? (value as SurfaceTone) : 'violet'
}

function toSortTags(value: unknown): SortTag[] {
  if (!Array.isArray(value)) return []
  const allowed: SortTag[] = ['最热', '最新', '连载中', '会员可听']
  return value.filter((v): v is SortTag => allowed.includes(v as SortTag))
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((v) => String(v))
}

function formatDuration(totalSeconds: number | null | undefined): string {
  if (!totalSeconds || totalSeconds <= 0) return '0 分钟'
  const minutes = Math.round(totalSeconds / 60)
  return `${minutes} 分钟`
}

function formatDurationLabel(totalSeconds: number | null | undefined): string {
  if (!totalSeconds || totalSeconds <= 0) return '00:00'
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// ---------- contents ----------

export interface DirectusContent {
  id: string
  title: string
  eyebrow?: string | null
  description?: string | null
  creator?: { id: string; name?: string | null } | string | null
  series?: { id: string; title?: string | null; meta?: string | null } | string | null
  series_episode_number?: number | null
  duration_seconds?: number | null
  cover?: string | null
  audio?: string | null
  role?: string | null
  scene?: string | null
  sort_tags?: unknown
  badge?: string | null
  badge_tone?: 'default' | 'vip' | null
  tone?: string | null
  price_credits?: number | null
  unlock_label?: string | null
  is_vip_only?: boolean | null
  status?: string | null
  published_at?: string | null
}

export function mapContentItem(row: DirectusContent): ContentItem {
  const creatorName = typeof row.creator === 'object' && row.creator ? row.creator.name ?? '' : ''
  const duration = formatDuration(row.duration_seconds)
  const metaParts = [creatorName, duration, row.role, row.scene].filter(Boolean)

  return {
    id: row.id,
    title: row.title,
    meta: metaParts.join(' · '),
    badge: row.badge ?? '',
    badgeTone: row.badge_tone ?? 'default',
    role: row.role ?? '',
    scene: row.scene ?? '',
    sortTags: toSortTags(row.sort_tags),
    tone: toTone(row.tone),
    coverImageUrl: assetUrl(row.cover),
  }
}

export function mapContentDetail(row: DirectusContent): ContentDetailData {
  const creatorName = typeof row.creator === 'object' && row.creator ? row.creator.name ?? '' : ''
  const duration = formatDuration(row.duration_seconds)
  const series = typeof row.series === 'object' && row.series ? row.series : null

  return {
    id: row.id,
    title: row.title,
    eyebrow: row.eyebrow ?? '',
    creator: creatorName,
    duration,
    status: row.is_vip_only ? '会员可听' : row.badge ?? '',
    description: row.description ?? '',
    tags: [row.role, row.scene].filter(Boolean) as string[],
    unlockLabel: row.unlock_label ?? (row.is_vip_only ? '开通 VIP 立即收听' : '单集解锁'),
    seriesId: series?.id ?? '',
    seriesTitle: series?.title ?? '',
    seriesMeta: series?.meta ?? '',
    tone: toTone(row.tone),
    coverImageUrl: assetUrl(row.cover),
    audioUrl: assetUrl(row.audio),
  }
}

export function mapPlayerState(row: DirectusContent): PlayerStateData {
  const creatorName = typeof row.creator === 'object' && row.creator ? row.creator.name ?? '' : ''
  const metaParts = [creatorName, row.role, row.scene].filter(Boolean)

  return {
    contentId: row.id,
    title: row.title,
    meta: metaParts.join(' · '),
    currentTimeLabel: '00:00',
    durationLabel: formatDurationLabel(row.duration_seconds),
    progressPercent: 0,
    tone: toTone(row.tone),
    coverImageUrl: assetUrl(row.cover),
    audioUrl: assetUrl(row.audio),
  }
}

// ---------- series ----------

export interface DirectusSeries {
  id: string
  title: string
  meta?: string | null
  tone?: string | null
  cover?: string | null
  sort_order?: number | null
  is_active?: boolean | null
}

export function mapSeriesItem(row: DirectusSeries): SeriesItem {
  return {
    id: row.id,
    title: row.title,
    meta: row.meta ?? '',
    tone: toTone(row.tone),
    to: `/home/section/series`,
    coverImageUrl: assetUrl(row.cover),
  }
}

// ---------- anchors ----------

export interface DirectusAnchor {
  id: string
  name: string
  tagline?: string | null
  intro?: string | null
  update_note?: string | null
  follower_label?: string | null
  schedule_label?: string | null
  tags?: unknown
  tone?: string | null
  cover?: string | null
  is_active?: boolean | null
}

export function mapAnchorProfile(row: DirectusAnchor, featuredContentIds: string[] = []): AnchorProfile {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline ?? '',
    intro: row.intro ?? '',
    updateNote: row.update_note ?? '',
    followerLabel: row.follower_label ?? '',
    scheduleLabel: row.schedule_label ?? '',
    tags: toStringArray(row.tags),
    tone: toTone(row.tone),
    featuredContentIds,
    coverImageUrl: assetUrl(row.cover),
  }
}

// ---------- banners ----------

export interface DirectusBanner {
  id: string
  eyebrow?: string | null
  title: string
  subtitle?: string | null
  meta?: string | null
  tone?: string | null
  target_type?: 'content' | 'anchor' | 'url' | null
  target_content?: string | null
  target_anchor?: string | null
  target_url?: string | null
  primary_action_label?: string | null
  secondary_action_label?: string | null
  secondary_action_to?: string | null
  sort_order?: number | null
  is_active?: boolean | null
}

function resolveBannerTarget(row: DirectusBanner): { targetType: 'content' | 'anchor'; targetId: string; to: string } {
  if (row.target_type === 'anchor' && row.target_anchor) {
    return { targetType: 'anchor', targetId: row.target_anchor, to: `/anchor/${row.target_anchor}` }
  }
  if (row.target_type === 'url' && row.target_url) {
    return { targetType: 'content', targetId: row.target_url, to: row.target_url }
  }
  const id = row.target_content ?? ''
  return { targetType: 'content', targetId: id, to: id ? `/content/${id}` : '/' }
}

export function mapBanner(row: DirectusBanner): BannerItem {
  const target = resolveBannerTarget(row)
  const primary: BannerAction = {
    label: row.primary_action_label ?? '立即收听',
    to: target.to,
  }
  const secondary: BannerAction | undefined =
    row.secondary_action_label && row.secondary_action_to
      ? { label: row.secondary_action_label, to: row.secondary_action_to }
      : undefined

  return {
    id: row.id,
    eyebrow: row.eyebrow ?? '',
    title: row.title,
    subtitle: row.subtitle ?? '',
    meta: row.meta ?? '',
    tone: toTone(row.tone),
    targetType: target.targetType,
    targetId: target.targetId,
    to: target.to,
    primaryAction: primary,
    secondaryAction: secondary,
  }
}

// ---------- feature tiles ----------

export interface DirectusFeatureTile {
  id: string
  title: string
  subtitle?: string | null
  icon_key?: FeatureIconKey | null
  tone?: string | null
  to?: string | null
  sort_order?: number | null
  is_active?: boolean | null
}

export function mapFeatureTile(row: DirectusFeatureTile): FeatureTileItem {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? '',
    tone: toTone(row.tone),
    iconKey: (row.icon_key ?? 'sleep') as FeatureIconKey,
    to: row.to ?? undefined,
  }
}

// ---------- home sections ----------

export interface DirectusHomeSection {
  id: string
  section_key: HomeSectionId
  title: string
  subtitle?: string | null
  description?: string | null
  content_ids?: unknown
}

export function mapHomeSectionContentIds(rows: DirectusHomeSection[]): Record<HomeSectionId, string[]> {
  const result: Record<HomeSectionId, string[]> = { asmr: [], recommended: [], series: [] }
  for (const row of rows) {
    if (row.section_key in result) {
      result[row.section_key] = toStringArray(row.content_ids)
    }
  }
  return result
}

// ---------- vip plans & ai packs ----------

export interface DirectusVipPlan {
  id: string
  type: 'subscription' | 'credit'
  title: string
  price?: string | null
  desc?: string | null
  bonus?: string | null
  recommended?: boolean | null
  sort_order?: number | null
  is_active?: boolean | null
}

export function mapVipPlan(row: DirectusVipPlan): VipPlan {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    price: row.price ?? '',
    desc: row.desc ?? '',
    bonus: row.bonus ?? undefined,
    recommended: row.recommended ?? false,
  }
}

export interface DirectusAIPack {
  id: string
  title: string
  price?: string | null
  minutes: number
  description?: string | null
  bonus?: string | null
  recommended?: boolean | null
  sort_order?: number | null
  is_active?: boolean | null
}

export function mapAIPack(row: DirectusAIPack): AIPackItem {
  return {
    id: row.id,
    title: row.title,
    price: row.price ?? '',
    minutes: row.minutes,
    description: row.description ?? '',
    bonus: row.bonus ?? undefined,
    recommended: row.recommended ?? false,
  }
}

// ---------- ai roles ----------

export interface DirectusAIRole {
  id: string
  role_key: string
  name: string
  subtitle?: string | null
  relationship?: string | null
  intro?: string | null
  scene?: string | null
  traits?: unknown
  tone?: string | null
  memory_template?: string | null
  starter_prompts?: unknown
  is_active?: boolean | null
}

export function mapAIRole(row: DirectusAIRole): AIRoleItem {
  return {
    id: row.role_key,
    name: row.name,
    subtitle: row.subtitle ?? '',
    relationship: row.relationship ?? '',
    intro: row.intro ?? '',
    scene: row.scene ?? '',
    traits: toStringArray(row.traits),
    tone: toTone(row.tone),
  }
}

export function readAIRoleStarters(row: DirectusAIRole): string[] {
  return toStringArray(row.starter_prompts)
}

export function readAIRoleMemory(row: DirectusAIRole): string {
  return row.memory_template ?? ''
}
