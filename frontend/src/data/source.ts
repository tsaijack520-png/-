// 统一数据源
//
// 所有页面通过这里的 loadXxx() 拉数据；内部按 VITE_API_BASE_URL 是否配置，
// 自动走 Directus 真 API 或 mock 数据。API 失败时透明回退到 mock。

import { isApiEnabled } from '../api/client'
import {
  fetchAIPacks,
  fetchAIRoles,
  fetchAnchorById,
  fetchBanners,
  fetchContentById,
  fetchContentsByAnchor,
  fetchFeatureTiles,
  fetchHomeSections,
  fetchPublishedContents,
  fetchRecommendedContentIds,
  fetchSeries,
  fetchVipPlans,
} from '../api/resources'
import {
  mapAIPack,
  mapAIRole,
  mapAnchorProfile,
  mapBanner,
  mapContentDetail,
  mapContentItem,
  mapFeatureTile,
  mapHomeSectionContentIds,
  mapPlayerState,
  mapSeriesItem,
  mapVipPlan,
  readAIRoleMemory,
  readAIRoleStarters,
} from '../api/mappers'
import * as mock from './mockData'
import type {
  AIChatSessionData,
  AIPackItem,
  AIRoleItem,
  AnchorProfile,
  BannerItem,
  ContentDetailData,
  ContentItem,
  FeatureTileItem,
  HomeSectionId,
  HomeSectionMeta,
  PlayerStateData,
  SeriesItem,
  VipPlan,
} from '../types/app'

export interface HomeData {
  banners: BannerItem[]
  featureTiles: FeatureTileItem[]
  recommended: ContentItem[]
  featuredSeries: SeriesItem[]
}

export interface HomeSectionData {
  section: HomeSectionMeta
  contents: ContentItem[]
}

export interface AnchorPageData {
  profile: AnchorProfile
  contents: ContentItem[]
}

export interface ContentDetailBundle {
  detail: ContentDetailData
  playerState: PlayerStateData
  episodeIds: string[]
}

export interface AIIndexData {
  roles: AIRoleItem[]
  remainingMinutes: number
}

export interface AIChatData {
  role: AIRoleItem
  session: AIChatSessionData
}

async function safeCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    console.warn('[data] API failed, using mock:', err)
    return fallback
  }
}

// ---------- 首页 ----------

export async function loadHomeData(): Promise<HomeData> {
  const fallback: HomeData = {
    banners: mock.homeBanners,
    featureTiles: mock.featureTiles,
    recommended: mock.recommendedContents,
    featuredSeries: mock.featuredSeries,
  }

  if (!isApiEnabled()) return fallback

  return safeCall(async () => {
    const [bannerRows, featureRows, recommendedIds, contentRows, seriesRows] = await Promise.all([
      fetchBanners(),
      fetchFeatureTiles(),
      fetchRecommendedContentIds(),
      fetchPublishedContents(),
      fetchSeries(),
    ])

    const contentById = new Map(contentRows.map((row) => [row.id, row]))
    const recommended = recommendedIds
      .map((id) => contentById.get(id))
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .map(mapContentItem)

    return {
      banners: bannerRows.map(mapBanner),
      featureTiles: featureRows.map(mapFeatureTile),
      recommended: recommended.length ? recommended : contentRows.slice(0, 6).map(mapContentItem),
      featuredSeries: seriesRows.map(mapSeriesItem),
    }
  }, fallback)
}

// ---------- 首页模块聚合 ----------

export async function loadHomeSection(sectionId: HomeSectionId): Promise<HomeSectionData> {
  const section = mock.homeSectionMeta[sectionId] ?? mock.homeSectionMeta.asmr

  if (!isApiEnabled()) {
    const ids = mock.homeSectionContentIds[section.id]
    const pool = [...mock.recommendedContents, ...mock.categoryContents]
    const contents = ids.map((id) => pool.find((item) => item.id === id)).filter((item): item is ContentItem => Boolean(item))
    return { section, contents }
  }

  return safeCall(async () => {
    const [sectionsRows, contentRows] = await Promise.all([fetchHomeSections(), fetchPublishedContents()])
    const idsMap = mapHomeSectionContentIds(sectionsRows)
    const ids = idsMap[sectionId]?.length ? idsMap[sectionId] : contentRows.slice(0, 8).map((r) => r.id)
    const contentById = new Map(contentRows.map((row) => [row.id, row]))
    const contents = ids
      .map((id) => contentById.get(id))
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .map(mapContentItem)

    const meta = sectionsRows.find((row) => row.section_key === sectionId)
    return {
      section: meta
        ? {
            id: sectionId,
            title: meta.title,
            subtitle: meta.subtitle ?? section.subtitle,
            description: meta.description ?? section.description,
          }
        : section,
      contents,
    }
  }, {
    section,
    contents: mock.homeSectionContentIds[sectionId]
      .map((id) => [...mock.recommendedContents, ...mock.categoryContents].find((item) => item.id === id))
      .filter((item): item is ContentItem => Boolean(item)),
  })
}

// ---------- 分类页（所有已发布内容）----------

export async function loadCategoryContents(): Promise<ContentItem[]> {
  if (!isApiEnabled()) return mock.categoryContents

  return safeCall(async () => {
    const rows = await fetchPublishedContents()
    return rows.map(mapContentItem)
  }, mock.categoryContents)
}

// ---------- 内容详情 / 播放 ----------

function mockDetailBundle(contentId: string): ContentDetailBundle {
  const detail = mock.contentDetails[contentId] ?? mock.contentDetails.c1
  const playerState = mock.playerStates[detail.id] ?? mock.playerStates.c1
  const episodeIds = mock.getSeriesEpisodeIds(detail.seriesId)
  return { detail, playerState, episodeIds }
}

export async function loadContentDetail(contentId: string): Promise<ContentDetailBundle> {
  if (!isApiEnabled()) return mockDetailBundle(contentId)

  return safeCall(async () => {
    const row = await fetchContentById(contentId)
    const detail = mapContentDetail(row)
    const playerState = mapPlayerState(row)

    let episodeIds: string[] = []
    if (detail.seriesId) {
      const siblings = await fetchPublishedContents()
      episodeIds = siblings
        .filter((item) => {
          const series = typeof item.series === 'object' && item.series ? item.series.id : item.series
          return series === detail.seriesId
        })
        .sort((a, b) => (a.series_episode_number ?? 0) - (b.series_episode_number ?? 0))
        .map((item) => item.id)
    }

    return { detail, playerState, episodeIds }
  }, mockDetailBundle(contentId))
}

// ---------- 主播 ----------

function mockAnchorPage(anchorId: string): AnchorPageData {
  const profile = mock.anchorProfiles[anchorId] ?? mock.anchorProfiles['anchor-xiaoduo']
  const pool = [...mock.recommendedContents, ...mock.categoryContents]
  const contents = profile.featuredContentIds
    .map((id) => pool.find((item) => item.id === id))
    .filter((item): item is ContentItem => Boolean(item))
  return { profile, contents }
}

export async function loadAnchor(anchorId: string): Promise<AnchorPageData> {
  if (!isApiEnabled()) return mockAnchorPage(anchorId)

  return safeCall(async () => {
    const [anchorRow, contentRows] = await Promise.all([fetchAnchorById(anchorId), fetchContentsByAnchor(anchorId)])
    const contents = contentRows.map(mapContentItem)
    const profile = mapAnchorProfile(anchorRow, contents.map((c) => c.id))
    return { profile, contents }
  }, mockAnchorPage(anchorId))
}

// ---------- VIP / 点数 ----------

export async function loadVipPlans(): Promise<{ subscriptions: VipPlan[]; credits: VipPlan[] }> {
  const fallback = { subscriptions: mock.vipSubscriptionPlans, credits: mock.vipCreditPacks }
  if (!isApiEnabled()) return fallback

  return safeCall(async () => {
    const rows = await fetchVipPlans()
    const plans = rows.map(mapVipPlan)
    return {
      subscriptions: plans.filter((p) => p.type === 'subscription'),
      credits: plans.filter((p) => p.type === 'credit'),
    }
  }, fallback)
}

// ---------- AI ----------

export async function loadAIIndex(): Promise<AIIndexData> {
  const fallback: AIIndexData = { roles: mock.aiRoleCards, remainingMinutes: mock.aiHighlights.remainingMinutes }
  if (!isApiEnabled()) return fallback

  return safeCall(async () => {
    const rows = await fetchAIRoles()
    return { roles: rows.map(mapAIRole), remainingMinutes: fallback.remainingMinutes }
  }, fallback)
}

export async function loadAIPacks(): Promise<AIPackItem[]> {
  if (!isApiEnabled()) return mock.aiPacks

  return safeCall(async () => {
    const rows = await fetchAIPacks()
    return rows.map(mapAIPack)
  }, mock.aiPacks)
}

export async function loadAIChat(roleKey: string): Promise<AIChatData> {
  const fallback: AIChatData = {
    role: mock.aiRoleCards.find((r) => r.id === roleKey) ?? mock.aiRoleCards[0],
    session: mock.aiChatSessions[roleKey] ?? mock.aiChatSessions.lanlan,
  }

  if (!isApiEnabled()) return fallback

  return safeCall(async () => {
    const rows = await fetchAIRoles()
    const row = rows.find((item) => item.role_key === roleKey) ?? rows[0]
    if (!row) return fallback

    const role = mapAIRole(row)
    const starters = readAIRoleStarters(row)
    const memory = readAIRoleMemory(row)
    const fallbackSession = mock.aiChatSessions[roleKey] ?? mock.aiChatSessions.lanlan

    const session: AIChatSessionData = {
      roleId: role.id,
      roleName: role.name,
      roleSubtitle: role.subtitle,
      remainingMinutes: fallbackSession.remainingMinutes,
      memory: memory || fallbackSession.memory,
      sessionStatus: fallbackSession.sessionStatus,
      preferences: fallbackSession.preferences,
      starterPrompts: starters.length ? starters : fallbackSession.starterPrompts,
      messages: fallbackSession.messages,
      tone: role.tone,
    }

    return { role, session }
  }, fallback)
}
