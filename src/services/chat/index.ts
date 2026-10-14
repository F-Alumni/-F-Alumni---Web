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
 * Chat service communicating directly with ChatService (http://localhost:5199).
 */
export const chatService = {
  /**
   * Fetch all group rooms and direct rooms the user is participating in.
   * Matches BE contract: GET /api/chat/rooms
   */
  async getRooms(): Promise<BackendChatRoom[]> {
    const res = await chatApiClient.get<BackendChatRoom[]>('/api/chat/rooms')
    return res.data
  },

  /**
   * Create or fetch existing 1-1 direct chat room.
   * Matches BE contract: POST /api/chat/rooms/direct -> { roomId, name }
   */
  async createDirectRoom(payload: CreateDirectRoomPayload): Promise<{ roomId: string; name: string }> {
    const res = await chatApiClient.post<{ roomId: string; name: string }>('/api/chat/rooms/direct', {
      targetUserId: payload.targetUserId,
      targetUserName: payload.targetUserName,
    })
    return res.data
  },

  /**
   * Create a group chat room.
   * Matches BE contract: POST /api/chat/rooms/group -> { roomId, name }
   */
  async createGroupRoom(payload: CreateGroupRoomPayload): Promise<{ roomId: string; name: string }> {
    const res = await chatApiClient.post<{ roomId: string; name: string }>('/api/chat/rooms/group', {
      name: payload.name.trim(),
      major: payload.major || null,
    })
    return res.data
  },

  /**
   * Retrieve messages for a room with pagination.
   * Matches BE contract: GET /api/chat/rooms/{roomId}/messages?page=1&pageSize=50
   */
  async getMessages(roomId: string, page = 1, pageSize = 50): Promise<BackendChatMessagesPage> {
    const safePage = Math.max(1, page)
    const safePageSize = Math.min(100, Math.max(1, pageSize))

    const res = await chatApiClient.get<BackendChatMessagesPage>(`/api/chat/rooms/${roomId}/messages`, {
      params: {
        page: safePage,
        pageSize: safePageSize,
      },
    })
    return res.data
  },

  /**
   * Post a message to a room via REST endpoint.
   * Matches BE contract: POST /api/chat/rooms/{roomId}/messages
   */
  async sendMessage(roomId: string, payload: SendMessagePayload): Promise<BackendChatMessage> {
    const res = await chatApiClient.post<BackendChatMessage>(`/api/chat/rooms/${roomId}/messages`, {
      content: payload.content.trim(),
    })
    return res.data
  },
}
