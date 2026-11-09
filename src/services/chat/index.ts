import { chatApiClient } from '@/services/api/apiClient'
import type {
  BackendChatRoom,
  BackendChatMessage,
  BackendChatMessagesPage,
  CreateDirectRoomPayload,
  CreateGroupRoomPayload,
  SendMessagePayload,
} from '@/types/chat.types'

/**
 * Normalizes backend ChatMessageResponse into Frontend BackendChatMessage.
 */
export function mapBackendChatMessage(raw: any): BackendChatMessage {
  return {
    id: raw.id || raw.Id,
    roomId: raw.conversationId || raw.ConversationId || raw.roomId || raw.RoomId,
    senderId: raw.senderUserId || raw.SenderUserId || raw.senderId || raw.SenderId,
    senderName: raw.senderDisplayName || raw.SenderDisplayName || raw.senderName || 'Anonymous',
    senderAvatarUrl: raw.senderAvatarUrl || raw.SenderAvatarUrl || null,
    content: raw.content || raw.Content || '',
    sentAt: raw.sentAt || raw.SentAt || new Date().toISOString(),
  }
}

/**
 * Chat service communicating directly with ChatService via API Gateway (/api/v1/chats/*).
 */
export const chatService = {
  /**
   * Fetch all group and direct conversations the user is participating in.
   * Matches BE contract: GET /api/v1/chats/conversations
   */
  async getRooms(): Promise<BackendChatRoom[]> {
    const res = await chatApiClient.get<any>('/chats/conversations')
    const paged = res.data?.items ? res.data : { items: Array.isArray(res.data) ? res.data : [] }

    return (paged.items || []).map((c: any) => ({
      id: c.id,
      name: c.title || (c.isGroup ? 'Nhóm thảo luận' : 'Hội thoại trực tiếp'),
      roomType: c.isGroup ? 'Group' : 'Direct',
      major: null,
      createdAt: c.createdAt || new Date().toISOString(),
      lastMessage: c.lastMessage ? mapBackendChatMessage(c.lastMessage) : null,
    }))
  },

  /**
   * Create or fetch existing 1-1 direct chat conversation.
   * Matches BE contract: POST /api/v1/chats/conversations
   */
  async createDirectRoom(payload: CreateDirectRoomPayload): Promise<{ roomId: string; name: string }> {
    const res = await chatApiClient.post<any>('/chats/conversations', {
      title: payload.targetUserName,
      isGroup: false,
      targetUserId: payload.targetUserId,
      participantUserIds: [payload.targetUserId],
    })
    return {
      roomId: res.data.id,
      name: res.data.title || payload.targetUserName,
    }
  },

  /**
   * Create a group chat conversation.
   * Matches BE contract: POST /api/v1/chats/conversations
   */
  async createGroupRoom(payload: CreateGroupRoomPayload): Promise<{ roomId: string; name: string }> {
    const participants = (payload.participantUserIds && payload.participantUserIds.length > 0)
      ? payload.participantUserIds
      : ['11111111-1111-1111-1111-111111111111']

    const res = await chatApiClient.post<any>('/chats/conversations', {
      title: payload.name.trim(),
      isGroup: true,
      participantUserIds: participants,
    })
    return {
      roomId: res.data.id,
      name: res.data.title || payload.name,
    }
  },

  /**
   * Retrieve messages for a conversation with pagination.
   * Matches BE contract: GET /api/v1/chats/conversations/{conversationId}/messages?page=1&pageSize=50
   */
  async getMessages(roomId: string, page = 1, pageSize = 50): Promise<BackendChatMessagesPage> {
    const safePage = Math.max(1, page)
    const safePageSize = Math.min(100, Math.max(1, pageSize))

    const res = await chatApiClient.get<any>(`/chats/conversations/${roomId}/messages`, {
      params: {
        page: safePage,
        pageSize: safePageSize,
      },
    })

    const raw = res.data
    const items = (raw.items || (Array.isArray(raw) ? raw : [])).map(mapBackendChatMessage)

    return {
      items,
      totalCount: raw.totalCount || items.length,
      page: raw.pageNumber || safePage,
      pageSize: raw.pageSize || safePageSize,
    }
  },

  /**
   * Post a message to a conversation via REST endpoint.
   * Matches BE contract: POST /api/v1/chats/conversations/{conversationId}/messages
   */
  async sendMessage(roomId: string, payload: SendMessagePayload): Promise<BackendChatMessage> {
    const res = await chatApiClient.post<any>(`/chats/conversations/${roomId}/messages`, {
      content: payload.content.trim(),
    })
    return mapBackendChatMessage(res.data)
  },
}
