export type SurfaceTone = 'violet' | 'rose' | 'blue' | 'gold' | 'emerald'
export type SortTag = '最热' | '最新' | '连载中' | '会员可听'
export type BannerTargetType = 'content' | 'anchor'
export type FeatureIconKey = 'sleep' | 'earworm' | 'wake-up' | 'story'
export type HomeSectionId = 'asmr' | 'recommended' | 'series'
export type CategoryFilterType = 'role' | 'scene' | 'sort'
export type AuthMethod = 'phone' | 'email' | 'nickname' | 'apple'
export type UserRole = 'listener' | 'creator'

export interface BannerAction {
  label: string
  to: string
}

export interface BannerItem {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  meta: string
  tone: SurfaceTone
  targetType: BannerTargetType
  targetId: string
  to: string
  primaryAction: BannerAction
  secondaryAction?: BannerAction
}

export interface FeatureTileItem {
  id: string
  title: string
  subtitle: string
  tone: SurfaceTone
  iconKey: FeatureIconKey
  to?: string
}

export interface ContentItem {
  id: string
  title: string
  meta: string
  badge: string
  badgeTone?: 'default' | 'vip'
  role: string
  scene: string
  sortTags: SortTag[]
  tone: SurfaceTone
  coverImageUrl?: string
}

export interface SeriesItem {
  id: string
  title: string
  meta: string
  tone: SurfaceTone
  to?: string
  coverImageUrl?: string
}

export interface VipStatus {
  subscriptionActive: boolean
  expiresAt?: string
  creditBalance: number
}

export interface MockUser {
  id: string
  nickname: string
  role: UserRole
  vipStatus: VipStatus
  avatarInitial: string
  avatarUrl?: string
  authMethod: AuthMethod
  phone?: string
  email?: string
}

export interface ProfileSummary {
  displayName: string
  purchasedCount: number
  playlistCount: number
  aiMinutes: number
}

export interface PlaylistItem {
  id: string
  title: string
  subtitle: string
  tone: SurfaceTone
  badge?: string
  badgeTone?: 'default' | 'vip'
  to?: string
  coverImageUrl?: string
}

export interface AssetEntry {
  id: string
  label: string
  value: string
  tone?: 'default' | 'gold' | 'accent'
  to?: string
}

export interface VipPlan {
  id: string
  type: 'subscription' | 'credit'
  title: string
  price: string
  desc: string
  bonus?: string
  recommended?: boolean
}

export interface OrderItem {
  id: string
  type: 'content' | 'subscription' | 'credit' | 'ai'
  title: string
  amount: string
  status: '已完成' | '处理中' | '已关闭'
  createdAt: string
  detail?: string
}

export interface CreatorUpload {
  id: string
  title: string
  status: 'draft' | 'reviewing' | 'published'
  role: string
  scene: string
  updatedAt: string
  playCount: number
  orderCount: number
}

export interface CreatorStats {
  totalPlays: number
  totalOrders: number
  totalFollowers: number
  monthlyRevenue: string
}

export interface ContentDetailData {
  id: string
  title: string
  eyebrow: string
  creator: string
  duration: string
  status: string
  description: string
  tags: string[]
  unlockLabel: string
  seriesId: string
  seriesTitle: string
  seriesMeta: string
  tone: SurfaceTone
  coverImageUrl?: string
  audioUrl?: string
}

export interface PlayerStateData {
  contentId: string
  title: string
  meta: string
  currentTimeLabel: string
  durationLabel: string
  progressPercent: number
  tone: SurfaceTone
  coverImageUrl?: string
  audioUrl?: string
}

export interface AnchorProfile {
  id: string
  name: string
  tagline: string
  intro: string
  updateNote: string
  followerLabel: string
  scheduleLabel: string
  tags: string[]
  tone: SurfaceTone
  featuredContentIds: string[]
  coverImageUrl?: string
}

export interface HomeSectionMeta {
  id: HomeSectionId
  title: string
  subtitle: string
  description: string
}

export interface CategoryFilterMeta {
  id: CategoryFilterType
  title: string
  subtitle: string
  description: string
  options: readonly string[]
}

export interface AIRoleItem {
  id: string
  name: string
  subtitle: string
  relationship: string
  intro: string
  scene: string
  traits: string[]
  tone: SurfaceTone
}

export interface AIPreferenceItem {
  label: string
  value: string
}

export interface AIMessageItem {
  id: string
  speaker: 'user' | 'ai'
  text: string
}

export interface AIChatSessionData {
  roleId: string
  roleName: string
  roleSubtitle: string
  remainingMinutes: number
  memory: string
  sessionStatus: string
  preferences: AIPreferenceItem[]
  starterPrompts: string[]
  messages: AIMessageItem[]
  tone: SurfaceTone
}

export interface AIPackItem {
  id: string
  title: string
  price: string
  minutes: number
  description: string
  bonus?: string
  recommended?: boolean
}
