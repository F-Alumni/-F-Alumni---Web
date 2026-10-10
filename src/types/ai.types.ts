export type AiMessageId = string

export type AiMessageRole = 'user' | 'assistant' | 'system'

export interface AiMessage {
  id: AiMessageId
  role: AiMessageRole
  content: string
  createdAt: string
}

export interface AiConversation {
  id: string
  title?: string
  messages: AiMessage[]
  createdAt: string
}
