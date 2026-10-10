import { create } from 'zustand'

export interface NotificationState {
  unreadCount: number
  setUnreadCount: (count: number) => void
  incrementUnreadCount: () => void
  resetUnreadCount: () => void
}

/**
 * Client-side notification UI state store.
 * Note: Notification item lists must be retrieved and cached via TanStack Query.
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  incrementUnreadCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  resetUnreadCount: () => set({ unreadCount: 0 }),
}))
