import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  aiHighlights,
  creatorUploads as defaultCreatorUploads,
  creatorUploadsStorageKey,
  mockOrders,
  mockSessionStorageKey,
  profilePlaylistAllItems,
} from '../data/mockData'
import type {
  AIPackItem,
  ContentDetailData,
  CreatorUpload,
  MockUser,
  OrderItem,
  PlaylistItem,
  UserRole,
  VipPlan,
} from '../types/app'

const orderStorageKey = 'earbian_orders'
const playlistStorageKey = 'earbian_playlist'
const unlockedContentStorageKey = 'earbian_unlocked_contents'
const aiMinutesStorageKey = 'earbian_ai_minutes'
const blockedAnchorsStorageKey = 'earbian_blocked_anchors'
const ageAcknowledgedStorageKey = 'earbian_age_acknowledged'
const reportLogStorageKey = 'earbian_report_log'

export interface ReportLogEntry {
  id: string
  surface: 'ai' | 'content' | 'anchor' | 'comment'
  targetId: string
  targetTitle: string
  reason: string
  note: string
  status: '受理中' | '已处理'
  submittedAt: string
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function readJson<T>(key: string, fallback: T) {
  const storage = getStorage()

  if (!storage) {
    return fallback
  }

  const rawValue = storage.getItem(key)

  if (!rawValue) {
    return fallback
  }

  try {
    return JSON.parse(rawValue) as T
  } catch {
    storage.removeItem(key)
    return fallback
  }
}

function readMockSession() {
  return readJson<MockUser | null>(mockSessionStorageKey, null)
}

function writeJson(key: string, value: unknown) {
  const storage = getStorage()

  if (!storage) {
    return
  }

  storage.setItem(key, JSON.stringify(value))
}

function formatNow() {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return formatter.format(new Date()).replace(/\//g, '-').replace(',', '')
}

function extractNumber(value?: string) {
  const matched = value?.match(/(\d+)/)
  return matched ? Number(matched[1]) : 0
}

function buildPlaylistItem(detail: ContentDetailData): PlaylistItem {
  return {
    id: detail.id,
    title: detail.title,
    subtitle: `${detail.creator} · ${detail.status}`,
    tone: detail.tone,
    badge: detail.status.includes('会员') ? 'VIP' : '已加入',
    badgeTone: detail.status.includes('会员') ? 'vip' : 'default',
    to: `/content/${detail.id}`,
  }
}

export function useMockSession() {
  const [user, setUser] = useState<MockUser | null>(() => readMockSession())
  const [creatorUploads, setCreatorUploads] = useState<CreatorUpload[]>(() => readJson(creatorUploadsStorageKey, defaultCreatorUploads))
  const [orders, setOrders] = useState<OrderItem[]>(() => readJson(orderStorageKey, mockOrders))
  const [playlistItems, setPlaylistItems] = useState<PlaylistItem[]>(() => readJson(playlistStorageKey, profilePlaylistAllItems))
  const [unlockedContentIds, setUnlockedContentIds] = useState<string[]>(() => readJson(unlockedContentStorageKey, []))
  const [aiMinutes, setAiMinutes] = useState<number>(() => readJson(aiMinutesStorageKey, aiHighlights.remainingMinutes))
  const [blockedAnchorIds, setBlockedAnchorIds] = useState<string[]>(() => readJson(blockedAnchorsStorageKey, []))
  const [ageAcknowledged, setAgeAcknowledged] = useState<boolean>(() => readJson(ageAcknowledgedStorageKey, false))
  const [reportLog, setReportLog] = useState<ReportLogEntry[]>(() => readJson(reportLogStorageKey, []))

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(readMockSession())
      setCreatorUploads(readJson(creatorUploadsStorageKey, defaultCreatorUploads))
      setOrders(readJson(orderStorageKey, mockOrders))
      setPlaylistItems(readJson(playlistStorageKey, profilePlaylistAllItems))
      setUnlockedContentIds(readJson(unlockedContentStorageKey, []))
      setAiMinutes(readJson(aiMinutesStorageKey, aiHighlights.remainingMinutes))
      setBlockedAnchorIds(readJson(blockedAnchorsStorageKey, []))
      setAgeAcknowledged(readJson(ageAcknowledgedStorageKey, false))
      setReportLog(readJson(reportLogStorageKey, []))
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const syncUser = useCallback((nextUser: MockUser | null) => {
    const storage = getStorage()

    if (storage) {
      if (nextUser) {
        storage.setItem(mockSessionStorageKey, JSON.stringify(nextUser))
      } else {
        storage.removeItem(mockSessionStorageKey)
      }
    }

    setUser(nextUser)
  }, [])

  const syncOrders = useCallback((nextOrders: OrderItem[]) => {
    writeJson(orderStorageKey, nextOrders)
    setOrders(nextOrders)
  }, [])

  const syncPlaylistItems = useCallback((nextPlaylistItems: PlaylistItem[]) => {
    writeJson(playlistStorageKey, nextPlaylistItems)
    setPlaylistItems(nextPlaylistItems)
  }, [])

  const syncUnlockedContentIds = useCallback((nextUnlockedContentIds: string[]) => {
    writeJson(unlockedContentStorageKey, nextUnlockedContentIds)
    setUnlockedContentIds(nextUnlockedContentIds)
  }, [])

  const syncAiMinutes = useCallback((nextAiMinutes: number) => {
    writeJson(aiMinutesStorageKey, nextAiMinutes)
    setAiMinutes(nextAiMinutes)
  }, [])

  const login = useCallback((nextUser: MockUser) => {
    syncUser(nextUser)
  }, [syncUser])

  const logout = useCallback(() => {
    syncUser(null)
  }, [syncUser])

  const updateUser = useCallback(
    (patch: Partial<MockUser>) => {
      if (!user) {
        return
      }
      syncUser({ ...user, ...patch })
    },
    [syncUser, user],
  )

  const saveCreatorUploads = useCallback((nextUploads: CreatorUpload[]) => {
    writeJson(creatorUploadsStorageKey, nextUploads)
    setCreatorUploads(nextUploads)
  }, [])

  const addCreatorUpload = useCallback(
    (upload: Omit<CreatorUpload, 'id' | 'updatedAt' | 'playCount' | 'orderCount' | 'status'>) => {
      const nextUpload: CreatorUpload = {
        ...upload,
        id: `creator-upload-${Date.now()}`,
        status: 'draft',
        updatedAt: '刚刚',
        playCount: 0,
        orderCount: 0,
      }

      saveCreatorUploads([nextUpload, ...creatorUploads])
    },
    [creatorUploads, saveCreatorUploads],
  )

  const switchRole = useCallback(
    (role: UserRole) => {
      if (!user) {
        return
      }

      syncUser({
        ...user,
        role,
      })
    },
    [syncUser, user],
  )

  const appendOrder = useCallback(
    (order: Omit<OrderItem, 'id' | 'createdAt'>) => {
      const nextOrder: OrderItem = {
        ...order,
        id: `order-${Date.now()}`,
        createdAt: formatNow(),
      }

      syncOrders([nextOrder, ...orders])
      return nextOrder
    },
    [orders, syncOrders],
  )

  const addPlaylistItem = useCallback(
    (detail: ContentDetailData) => {
      const exists = playlistItems.some((item) => item.id === detail.id)

      if (exists) {
        return 'exists' as const
      }

      syncPlaylistItems([buildPlaylistItem(detail), ...playlistItems])
      return 'added' as const
    },
    [playlistItems, syncPlaylistItems],
  )

  const unlockContent = useCallback(
    (detail: ContentDetailData) => {
      if (!user) {
        return { ok: false as const, reason: 'auth' as const }
      }

      if (unlockedContentIds.includes(detail.id) || user.vipStatus.subscriptionActive) {
        return { ok: false as const, reason: 'already-unlocked' as const }
      }

      syncUnlockedContentIds([detail.id, ...unlockedContentIds])
      appendOrder({
        type: 'content',
        title: `单集解锁：${detail.title}`,
        amount: detail.unlockLabel.replace('单集解锁 ', ''),
        status: '已完成',
      })

      return { ok: true as const }
    },
    [appendOrder, syncUnlockedContentIds, unlockedContentIds, user],
  )

  const purchaseVipPlan = useCallback(
    (plan: VipPlan) => {
      if (!user) {
        return { ok: false as const, reason: 'auth' as const }
      }

      const bonusCredits = extractNumber(plan.bonus)
      const nextUser: MockUser = {
        ...user,
        vipStatus: {
          subscriptionActive: true,
          expiresAt: plan.id.includes('yearly') ? '2027-04-18' : '2026-05-18',
          creditBalance: user.vipStatus.creditBalance + bonusCredits,
        },
      }

      syncUser(nextUser)
      appendOrder({
        type: 'subscription',
        title: plan.title,
        amount: plan.price,
        status: '已完成',
      })

      return { ok: true as const }
    },
    [appendOrder, syncUser, user],
  )

  const purchaseCreditPack = useCallback(
    (plan: VipPlan) => {
      if (!user) {
        return { ok: false as const, reason: 'auth' as const }
      }

      const nextUser: MockUser = {
        ...user,
        vipStatus: {
          ...user.vipStatus,
          creditBalance: user.vipStatus.creditBalance + extractNumber(plan.bonus),
        },
      }

      syncUser(nextUser)
      appendOrder({
        type: 'credit',
        title: plan.title,
        amount: plan.price,
        status: '已完成',
      })

      return { ok: true as const }
    },
    [appendOrder, syncUser, user],
  )

  const consumeAiMinutes = useCallback(
    (minutes: number) => {
      if (minutes <= 0) {
        return aiMinutes
      }

      const nextAiMinutes = Math.max(0, aiMinutes - minutes)
      syncAiMinutes(nextAiMinutes)
      return nextAiMinutes
    },
    [aiMinutes, syncAiMinutes],
  )

  const purchaseAiPack = useCallback(
    (pack: AIPackItem) => {
      if (!user) {
        return { ok: false as const, reason: 'auth' as const }
      }

      const nextAiMinutes = aiMinutes + pack.minutes + extractNumber(pack.bonus)
      syncAiMinutes(nextAiMinutes)
      appendOrder({
        type: 'ai',
        title: pack.title,
        amount: pack.price,
        status: '已完成',
      })

      return { ok: true as const, nextAiMinutes }
    },
    [aiMinutes, appendOrder, syncAiMinutes, user],
  )

  const hasUnlockedContent = useCallback(
    (contentId: string) => unlockedContentIds.includes(contentId) || Boolean(user?.vipStatus.subscriptionActive),
    [unlockedContentIds, user?.vipStatus.subscriptionActive],
  )

  const syncBlockedAnchorIds = useCallback((next: string[]) => {
    writeJson(blockedAnchorsStorageKey, next)
    setBlockedAnchorIds(next)
  }, [])

  const blockAnchor = useCallback(
    (anchorId: string) => {
      if (blockedAnchorIds.includes(anchorId)) return
      syncBlockedAnchorIds([anchorId, ...blockedAnchorIds])
    },
    [blockedAnchorIds, syncBlockedAnchorIds],
  )

  const unblockAnchor = useCallback(
    (anchorId: string) => {
      syncBlockedAnchorIds(blockedAnchorIds.filter((id) => id !== anchorId))
    },
    [blockedAnchorIds, syncBlockedAnchorIds],
  )

  const isAnchorBlocked = useCallback(
    (anchorId: string) => blockedAnchorIds.includes(anchorId),
    [blockedAnchorIds],
  )

  const acknowledgeAge = useCallback(() => {
    writeJson(ageAcknowledgedStorageKey, true)
    setAgeAcknowledged(true)
  }, [])

  const submitReport = useCallback(
    (entry: Omit<ReportLogEntry, 'id' | 'status' | 'submittedAt'>) => {
      const next: ReportLogEntry = {
        ...entry,
        id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        status: '受理中',
        submittedAt: formatNow(),
      }
      const merged = [next, ...reportLog].slice(0, 100)
      writeJson(reportLogStorageKey, merged)
      setReportLog(merged)
      return next
    },
    [reportLog],
  )

  const profileSummary = useMemo(() => {
    return {
      purchasedCount: orders.filter((order) => order.type === 'content' || order.type === 'subscription').length,
      playlistCount: playlistItems.length,
      aiMinutes,
    }
  }, [aiMinutes, orders, playlistItems.length])

  return {
    user,
    creatorUploads,
    orders,
    playlistItems,
    aiMinutes,
    profileSummary,
    isAuthenticated: Boolean(user),
    isCreator: user?.role === 'creator',
    login,
    logout,
    updateUser,
    addCreatorUpload,
    switchRole,
    addPlaylistItem,
    hasUnlockedContent,
    unlockContent,
    purchaseVipPlan,
    purchaseCreditPack,
    purchaseAiPack,
    consumeAiMinutes,
    blockedAnchorIds,
    blockAnchor,
    unblockAnchor,
    isAnchorBlocked,
    ageAcknowledged,
    acknowledgeAge,
    reportLog,
    submitReport,
  }
}
