// 按 collection 封装的 Directus 列表/详情拉取
//
// 每个函数均已做好字段选择 + 关联展开 + 默认筛选（is_active / published）
// 调用方只需关心业务；网络失败由上层 catch 回退到 mock

import { directusGet, directusList } from './client'
import type {
  DirectusAIPack,
  DirectusAIRole,
  DirectusAnchor,
  DirectusBanner,
  DirectusContent,
  DirectusFeatureTile,
  DirectusHomeSection,
  DirectusSeries,
  DirectusVipPlan,
} from './mappers'

const CONTENT_FIELDS = [
  'id',
  'title',
  'eyebrow',
  'description',
  'creator.id',
  'creator.name',
  'series.id',
  'series.title',
  'series.meta',
  'series_episode_number',
  'duration_seconds',
  'cover',
  'audio',
  'role',
  'scene',
  'sort_tags',
  'badge',
  'badge_tone',
  'tone',
  'price_credits',
  'unlock_label',
  'is_vip_only',
  'status',
  'published_at',
]

export async function fetchPublishedContents(): Promise<DirectusContent[]> {
  return directusList<DirectusContent>('contents', {
    fields: CONTENT_FIELDS,
    filter: { status: { _eq: 'published' } },
    sort: ['-published_at'],
    limit: 200,
  })
}

export async function fetchContentById(id: string): Promise<DirectusContent> {
  return directusGet<DirectusContent>('contents', id, { fields: CONTENT_FIELDS })
}

export async function fetchSeries(): Promise<DirectusSeries[]> {
  return directusList<DirectusSeries>('series', {
    fields: ['id', 'title', 'meta', 'tone', 'cover', 'sort_order', 'is_active'],
    filter: { is_active: { _eq: true } },
    sort: ['sort_order'],
  })
}

export async function fetchAnchors(): Promise<DirectusAnchor[]> {
  return directusList<DirectusAnchor>('anchors', {
    fields: ['id', 'name', 'tagline', 'intro', 'update_note', 'follower_label', 'schedule_label', 'tags', 'tone', 'cover', 'is_active'],
    filter: { is_active: { _eq: true } },
  })
}

export async function fetchAnchorById(id: string): Promise<DirectusAnchor> {
  return directusGet<DirectusAnchor>('anchors', id, {
    fields: ['id', 'name', 'tagline', 'intro', 'update_note', 'follower_label', 'schedule_label', 'tags', 'tone', 'cover'],
  })
}

export async function fetchContentsByAnchor(anchorId: string): Promise<DirectusContent[]> {
  return directusList<DirectusContent>('contents', {
    fields: CONTENT_FIELDS,
    filter: { creator: { _eq: anchorId }, status: { _eq: 'published' } },
    sort: ['-published_at'],
    limit: 60,
  })
}

export async function fetchBanners(): Promise<DirectusBanner[]> {
  return directusList<DirectusBanner>('banners', {
    fields: [
      'id',
      'eyebrow',
      'title',
      'subtitle',
      'meta',
      'tone',
      'target_type',
      'target_content',
      'target_anchor',
      'target_url',
      'primary_action_label',
      'secondary_action_label',
      'secondary_action_to',
      'sort_order',
      'is_active',
    ],
    filter: { is_active: { _eq: true } },
    sort: ['sort_order'],
  })
}

export async function fetchFeatureTiles(): Promise<DirectusFeatureTile[]> {
  return directusList<DirectusFeatureTile>('feature_tiles', {
    fields: ['id', 'title', 'subtitle', 'icon_key', 'tone', 'to', 'sort_order', 'is_active'],
    filter: { is_active: { _eq: true } },
    sort: ['sort_order'],
  })
}

export async function fetchRecommendedContentIds(): Promise<string[]> {
  const rows = await directusList<{ id: string; content: string | null; sort_order: number | null }>(
    'recommended_contents',
    {
      fields: ['id', 'content', 'sort_order', 'is_active'],
      filter: { is_active: { _eq: true } },
      sort: ['sort_order'],
    },
  )
  return rows.map((row) => row.content).filter((id): id is string => Boolean(id))
}

export async function fetchHomeSections(): Promise<DirectusHomeSection[]> {
  return directusList<DirectusHomeSection>('home_sections', {
    fields: ['id', 'section_key', 'title', 'subtitle', 'description', 'content_ids'],
  })
}

export async function fetchVipPlans(): Promise<DirectusVipPlan[]> {
  return directusList<DirectusVipPlan>('vip_plans', {
    fields: ['id', 'type', 'title', 'price', 'desc', 'bonus', 'recommended', 'sort_order', 'is_active'],
    filter: { is_active: { _eq: true } },
    sort: ['sort_order'],
  })
}

export async function fetchAIPacks(): Promise<DirectusAIPack[]> {
  return directusList<DirectusAIPack>('ai_packs', {
    fields: ['id', 'title', 'price', 'minutes', 'description', 'bonus', 'recommended', 'sort_order', 'is_active'],
    filter: { is_active: { _eq: true } },
    sort: ['sort_order'],
  })
}

export async function fetchAIRoles(): Promise<DirectusAIRole[]> {
  return directusList<DirectusAIRole>('ai_roles', {
    fields: [
      'id',
      'role_key',
      'name',
      'subtitle',
      'relationship',
      'intro',
      'scene',
      'traits',
      'tone',
      'memory_template',
      'starter_prompts',
      'is_active',
    ],
    filter: { is_active: { _eq: true } },
  })
}
