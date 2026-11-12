import * as signalR from '@microsoft/signalr'
import { notificationApiClient } from '@/services/api/apiClient'
import { env } from '@/app/config/env'

export type NotificationType =
  | 'chat_message'
  | 'post_like'
  | 'post_comment'
  | 'comment_reply'
  | 'system'

export interface BackendNotification {
  id: string
  recipientUserId: string
  actorUserId?: string | null
  actorName: string
  type: NotificationType | string
  title: string
  message: string
  link: string
  referenceId?: string | null
  isRead: boolean
  readAt?: string | null
  createdAt: string
}

export interface PagedNotificationsResponse {
  items: BackendNotification[]
  totalCount: number
  unreadCount: number
  page: number
  pageSize: number
}

export const notificationsService = {
  async getNotifications(params?: {
    unreadOnly?: boolean
    type?: string
    page?: number
    pageSize?: number
  }): Promise<PagedNotificationsResponse> {
    const res = await notificationApiClient.get<PagedNotificationsResponse>('/notifications', {
      params,
    })
    return res.data
  },

  async getUnreadCount(): Promise<number> {
    const res = await notificationApiClient.get<{ unreadCount: number }>('/notifications/unread-count')
    return res.data?.unreadCount ?? 0
  },

  async markAsRead(id: string): Promise<BackendNotification> {
    const res = await notificationApiClient.patch<BackendNotification>(`/notifications/${id}/read`)
    return res.data
  },

  async markAllAsRead(): Promise<number> {
    const res = await notificationApiClient.post<{ updatedCount: number }>('/notifications/read-all')
    return res.data?.updatedCount ?? 0
  },

  async deleteRead(): Promise<number> {
    const res = await notificationApiClient.delete<{ deletedCount: number }>('/notifications/read')
    return res.data?.deletedCount ?? 0
  },

  async deleteNotification(id: string): Promise<void> {
    await notificationApiClient.delete(`/notifications/${id}`)
  },
}

type NotificationListener = (notification: BackendNotification) => void

class NotificationHubClient {
  private connection: signalR.HubConnection | null = null
  private listeners = new Set<NotificationListener>()

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public async startConnection(): Promise<void> {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken')
    if (!token) return

    if (
      this.connection &&
      (this.connection.state === signalR.HubConnectionState.Connected ||
        this.connection.state === signalR.HubConnectionState.Connecting)
    ) {
      return
    }

    if (this.connection) {
      try {
        await this.connection.stop()
      } catch {
        // Ignore stop errors
      }
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(env.notificationHubUrl, {
        accessTokenFactory: () =>
          localStorage.getItem('access_token') || localStorage.getItem('accessToken') || '',
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    this.connection.on('ReceiveNotification', (notification: BackendNotification) => {
      for (const listener of this.listeners) {
        listener(notification)
      }
    })

    try {
      await this.connection.start()
    } catch (err) {
      console.warn('Could not establish SignalR notification hub connection:', err)
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop()
      } catch {
        // Ignore stop errors
      }
      this.connection = null
    }
  }
}

export const notificationHubClient = new NotificationHubClient()

export const formatNotificationTime = (isoString?: string): string => {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diffSeconds < 60) return 'Vừa xong'
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes} phút trước`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} giờ trước`
  return date.toLocaleDateString('vi-VN')
}
