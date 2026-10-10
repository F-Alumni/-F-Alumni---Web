import type { UserId } from './user.types'

export type ChatConversationId = string
export type ChatMessageId = string

export interface ChatMessage {
  id: ChatMessageId
  conversationId: ChatConversationId
  senderId: UserId
  content: string
  createdAt: string
}

export interface ChatConversation {
  id: ChatConversationId
  participantIds: UserId[]
  lastMessage?: ChatMessage
  updatedAt: string
}
