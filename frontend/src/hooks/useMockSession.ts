import { useCallback, useEffect, useState } from 'react'

import {
  creatorUploads as defaultCreatorUploads,
  creatorUploadsStorageKey,
  mockSessionStorageKey,
} from '../data/mockData'
import type { CreatorUpload, MockUser, UserRole } from '../types/app'

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

function readMockSession() {
  const storage = getStorage()

  if (!storage) {
    return null
  }

  const rawValue = storage.getItem(mockSessionStorageKey)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as MockUser
  } catch {
    storage.removeItem(mockSessionStorageKey)
    return null
  }
}

function readCreatorUploads() {
  const storage = getStorage()

  if (!storage) {
    return defaultCreatorUploads
  }

  const rawValue = storage.getItem(creatorUploadsStorageKey)

  if (!rawValue) {
    return defaultCreatorUploads
  }

  try {
    return JSON.parse(rawValue) as CreatorUpload[]
  } catch {
    storage.removeItem(creatorUploadsStorageKey)
    return defaultCreatorUploads
  }
}

export function useMockSession() {
  const [user, setUser] = useState<MockUser | null>(() => readMockSession())
  const [creatorUploads, setCreatorUploads] = useState<CreatorUpload[]>(() => readCreatorUploads())

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(readMockSession())
      setCreatorUploads(readCreatorUploads())
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const login = useCallback((nextUser: MockUser) => {
    const storage = getStorage()

    if (storage) {
      storage.setItem(mockSessionStorageKey, JSON.stringify(nextUser))
    }

    setUser(nextUser)
  }, [])

  const logout = useCallback(() => {
    const storage = getStorage()

    if (storage) {
      storage.removeItem(mockSessionStorageKey)
    }

    setUser(null)
  }, [])

  const saveCreatorUploads = useCallback((nextUploads: CreatorUpload[]) => {
    const storage = getStorage()

    if (storage) {
      storage.setItem(creatorUploadsStorageKey, JSON.stringify(nextUploads))
    }

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

      const nextUser: MockUser = {
        ...user,
        role,
      }

      const storage = getStorage()

      if (storage) {
        storage.setItem(mockSessionStorageKey, JSON.stringify(nextUser))
      }

      setUser(nextUser)
    },
    [user],
  )

  return {
    user,
    creatorUploads,
    isAuthenticated: Boolean(user),
    isCreator: user?.role === 'creator',
    login,
    logout,
    addCreatorUpload,
    switchRole,
  }
}
