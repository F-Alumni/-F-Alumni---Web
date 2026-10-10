import type { UserId } from './user.types'

export type NotificationId = string

export type NotificationType =
  'POST_COMMENT' | 'MENTION' | 'OPPORTUNITY_ALERT' | 'VERIFICATION_UPDATE' | 'MESSAGE' | 'SYSTEM'

export interface NotificationItem {
  id: NotificationId
  recipientId: UserId
  type: NotificationType
  title: string
  body: string
  isRead: boolean
  linkUrl?: string
  createdAt: string
}
