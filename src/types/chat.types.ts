import type { UserId } from './user.types'

export type ChatConversationId = string
export type ChatMessageId = string

export interface BackendChatMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  senderAvatarUrl: string | null
  content: string
  mediaUrl?: string | null
  attachmentUrl?: string | null
  attachmentType?: 'Text' | 'Image' | 'File' | string | null
  messageType?: 'Text' | 'Image'
  status?: string
  readAt?: string | null
  isRead?: boolean
  sentAt: string
}

export interface BackendChatRoom {
  id: string
  name: string
  roomType: 'Group' | 'Direct'
  major: string | null
  createdAt: string
  lastMessage: BackendChatMessage | null
  isMuted?: boolean
  unreadCount?: number
}

export interface BackendChatMessagesPage {
  items: BackendChatMessage[]
  totalCount: number
  page: number
  pageSize: number
}

export interface CreateDirectRoomPayload {
  targetUserId: string
  targetUserName: string
}

export interface CreateGroupRoomPayload {
  name: string
  major?: string
  participantUserIds?: string[]
}

export interface SendMessagePayload {
  content: string
  mediaUrl?: string | null
  messageType?: 'Text' | 'Image'
}

export interface ChatMessage {
  id: ChatMessageId
  conversationId: ChatConversationId
  senderId: UserId
  senderName?: string
  senderAvatarUrl?: string
  content: string
  createdAt: string
}

export interface ChatConversation {
  id: ChatConversationId
  name?: string
  roomType?: 'Group' | 'Direct'
  major?: string
  participantUserIds?: string[] | null
  participantIds?: UserId[]
  lastMessage?: ChatMessage
  updatedAt: string
}
