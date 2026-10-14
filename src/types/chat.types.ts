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
  sentAt: string
}

export interface BackendChatRoom {
  id: string
  name: string
  roomType: 'Group' | 'Direct'
  major: string | null
  createdAt: string
  lastMessage: BackendChatMessage | null
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
}

export interface SendMessagePayload {
  content: string
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
  major?: string | null
  participantIds?: UserId[]
  lastMessage?: ChatMessage
  updatedAt: string
}
