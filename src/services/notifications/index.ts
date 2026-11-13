import { notificationApiClient } from '@/services/api/apiClient'

export interface NotificationItemDto {
  id: string
  recipientUserId: string
  actorUserId?: string | null
  actorName: string
  type: string
  title: string
  message: string
  link: string
  referenceId?: string | null
  isRead: boolean
  readAt?: string | null
  createdAt: string
}

export interface PagedNotificationsResult {
  items: NotificationItemDto[]
  totalCount: number
  unreadCount: number
  page: number
  pageSize: number
}

export const notificationsService = {
  async getNotifications(params?: {
    page?: number
    pageSize?: number
    unreadOnly?: boolean
  }): Promise<PagedNotificationsResult> {
    const res = await notificationApiClient.get<PagedNotificationsResult>('/notifications', {
      params,
    })
    return {
      items: res.data?.items || [],
      totalCount: res.data?.totalCount || 0,
      unreadCount: res.data?.unreadCount || 0,
      page: res.data?.page || params?.page || 1,
      pageSize: res.data?.pageSize || params?.pageSize || 20,
    }
  },

  async getUnreadCount(): Promise<number> {
    const res = await notificationApiClient.get<{ unreadCount?: number }>(
      '/notifications/unread-count'
    )
    return res.data?.unreadCount ?? 0
  },

  async markAsRead(id: string): Promise<void> {
    await notificationApiClient.patch(`/notifications/${id}/read`)
  },

  async markAllAsRead(): Promise<{ updatedCount: number }> {
    const res = await notificationApiClient.post<{ updatedCount?: number }>(
      '/notifications/read-all'
    )
    return { updatedCount: res.data?.updatedCount ?? 0 }
  },

  async deleteNotification(id: string): Promise<void> {
    await notificationApiClient.delete(`/notifications/${id}`)
  },
}
