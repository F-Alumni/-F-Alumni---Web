import { create } from 'zustand'
import {
  notificationsService,
  notificationHubClient,
  type BackendNotification,
} from '@/services/notifications'

interface NotificationState {
  items: BackendNotification[]
  unreadCount: number
  isLoading: boolean
  hasLoaded: boolean
  loadNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteRead: () => Promise<void>
  pushIncoming: (item: BackendNotification) => void
  startRealtime: () => () => void
  reset: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  unreadCount: 0,
  isLoading: false,
  hasLoaded: false,

  loadNotifications: async () => {
    set({ isLoading: true })
    try {
      const res = await notificationsService.getNotifications({ page: 1, pageSize: 30 })
      set({
        items: res.items || [],
        unreadCount: res.unreadCount ?? (res.items || []).filter((i) => !i.isRead).length,
        hasLoaded: true,
      })
    } catch (err) {
      console.warn('Failed to load notifications:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  markAsRead: async (id: string) => {
    const existing = get().items.find((n) => n.id === id)
    if (existing && !existing.isRead) {
      set((state) => ({
        items: state.items.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    }
    try {
      await notificationsService.markAsRead(id)
    } catch {
      // Keep UI responsive; next reload reconciles state
    }
  },

  markAllAsRead: async () => {
    set((state) => ({
      items: state.items.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }))
    try {
      await notificationsService.markAllAsRead()
    } catch {
      // Ignore transient network errors
    }
  },

  deleteRead: async () => {
    set((state) => ({
      items: state.items.filter((n) => !n.isRead),
    }))
    try {
      await notificationsService.deleteRead()
    } catch {
      // Ignore transient network errors
    }
  },

  pushIncoming: (item: BackendNotification) => {
    set((state) => {
      if (state.items.some((n) => n.id === item.id)) {
        return state
      }
      return {
        items: [item, ...state.items].slice(0, 50),
        unreadCount: item.isRead ? state.unreadCount : state.unreadCount + 1,
      }
    })
  },

  startRealtime: () => {
    const unsubNotification = notificationHubClient.subscribe((incoming) => {
      get().pushIncoming(incoming)
    })
    const unsubUnread = notificationHubClient.subscribeUnreadCount((count) => {
      set({ unreadCount: count })
    })
    void notificationHubClient.startConnection()
    return () => {
      unsubNotification()
      unsubUnread()
    }
  },

  reset: () => {
    void notificationHubClient.stopConnection()
    set({ items: [], unreadCount: 0, isLoading: false, hasLoaded: false })
  },
}))
