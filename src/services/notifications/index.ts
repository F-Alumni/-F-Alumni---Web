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

/**
 * Normalizes backend Notification responses (from ForumService or NotificationService)
 * into a uniform frontend BackendNotification structure.
 */
export function normalizeNotification(raw: any): BackendNotification {
  const typeStr = String(raw?.type || raw?.Type || 'system').toLowerCase()
  let normalizedType: string = typeStr
  if (typeStr.includes('comment')) normalizedType = 'post_comment'
  else if (typeStr.includes('reaction') || typeStr.includes('like')) normalizedType = 'post_like'
  else if (typeStr.includes('chat') || typeStr.includes('message')) normalizedType = 'chat_message'
  else if (typeStr.includes('event')) normalizedType = 'system'

  const postId = raw?.postId || raw?.PostId
  const link =
    raw?.link ||
    raw?.Link ||
    raw?.linkUrl ||
    raw?.LinkUrl ||
    (postId ? `/app/posts/${postId}` : '/app/notifications')

  return {
    id: String(raw?.id || raw?.Id || ''),
    recipientUserId: String(
      raw?.recipientId || raw?.RecipientId || raw?.recipientUserId || raw?.RecipientUserId || ''
    ),
    actorUserId: raw?.senderId || raw?.SenderId || raw?.actorUserId || raw?.ActorUserId || null,
    actorName: raw?.senderName || raw?.SenderName || raw?.actorName || raw?.ActorName || 'Thành viên FPT',
    type: normalizedType,
    title: raw?.title || raw?.Title || 'Thông báo mới',
    message: raw?.message || raw?.Message || raw?.body || raw?.Body || '',
    link,
    referenceId: raw?.referenceId || raw?.ReferenceId || postId || raw?.eventId || raw?.EventId || null,
    isRead: Boolean(raw?.isRead ?? raw?.IsRead ?? false),
    readAt: raw?.readAt || raw?.ReadAt || null,
    createdAt: raw?.createdAt || raw?.CreatedAt || new Date().toISOString(),
  }
}

export const notificationsService = {
  async getNotifications(params?: {
    unreadOnly?: boolean
    type?: string
    page?: number
    pageSize?: number
  }): Promise<PagedNotificationsResponse> {
    const res = await notificationApiClient.get<any>('/notifications', {
      params,
    })
    const data = res.data
    const rawItems: any[] = data?.items || (Array.isArray(data) ? data : [])
    const items = rawItems.map(normalizeNotification)
    const unread = data?.unreadCount ?? data?.UnreadCount ?? items.filter((i) => !i.isRead).length
    return {
      items,
      totalCount: data?.totalCount ?? data?.TotalCount ?? items.length,
      unreadCount: unread,
      page: data?.page ?? data?.Page ?? 1,
      pageSize: data?.pageSize ?? data?.PageSize ?? items.length,
    }
  },

  async getUnreadCount(): Promise<number> {
    const res = await notificationApiClient.get<any>('/notifications/unread-count')
    return res.data?.unreadCount ?? res.data?.UnreadCount ?? 0
  },

  async markAsRead(id: string): Promise<BackendNotification> {
    const res = await notificationApiClient.patch<any>(`/notifications/${id}/read`)
    return normalizeNotification(res.data)
  },

  async markAllAsRead(): Promise<number> {
    const res = await notificationApiClient.patch<any>('/notifications/read-all').catch(async () => {
      // Fallback for POST if PATCH returns 405 on some gateways
      return await notificationApiClient.post<any>('/notifications/read-all')
    })
    return res.data?.updatedCount ?? res.data?.UpdatedCount ?? 0
  },

  async deleteRead(): Promise<number> {
    const res = await notificationApiClient.delete<any>('/notifications/read').catch(() => ({ data: { deletedCount: 0 } }))
    return res.data?.deletedCount ?? res.data?.DeletedCount ?? 0
  },

  async deleteNotification(id: string): Promise<void> {
    await notificationApiClient.delete(`/notifications/${id}`)
  },
}

type NotificationListener = (notification: BackendNotification) => void
type UnreadCountListener = (count: number) => void

class NotificationHubClient {
  private connection: signalR.HubConnection | null = null
  private listeners = new Set<NotificationListener>()
  private unreadListeners = new Set<UnreadCountListener>()

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  public subscribeUnreadCount(listener: UnreadCountListener): () => void {
    this.unreadListeners.add(listener)
    return () => {
      this.unreadListeners.delete(listener)
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
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    this.connection.on('ReceiveNotification', (raw: any) => {
      const notification = normalizeNotification(raw)
      for (const listener of this.listeners) {
        listener(notification)
      }
    })

    this.connection.on('ReceiveUnreadCount', (count: number) => {
      for (const listener of this.unreadListeners) {
        listener(count)
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
