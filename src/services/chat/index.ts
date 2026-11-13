import { chatApiClient, userApiClient } from '@/services/api/apiClient'
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
  const attachmentUrl = raw.attachmentUrl || raw.AttachmentUrl || raw.mediaUrl || raw.MediaUrl || null
  const attachmentType =
    raw.attachmentType || raw.AttachmentType || raw.messageType || raw.MessageType || (attachmentUrl ? 'Image' : null)
  const status = raw.status || raw.Status || 'Sent'
  const readAt = raw.readAt || raw.ReadAt || null

  return {
    id: raw.id || raw.Id,
    roomId: raw.conversationId || raw.ConversationId || raw.roomId || raw.RoomId,
    senderId: raw.senderUserId || raw.SenderUserId || raw.senderId || raw.SenderId,
    senderName: raw.senderDisplayName || raw.SenderDisplayName || raw.senderName || 'Anonymous',
    senderAvatarUrl: raw.senderAvatarUrl || raw.SenderAvatarUrl || null,
    content: raw.content || raw.Content || '',
    mediaUrl: attachmentUrl,
    attachmentUrl,
    attachmentType,
    messageType: attachmentUrl && String(attachmentType).toLowerCase() === 'image' ? 'Image' : 'Text',
    status,
    readAt,
    isRead: status === 'Read' || Boolean(readAt) || Boolean(raw.isRead ?? raw.IsRead),
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
  async getRooms(currentUserId?: string): Promise<BackendChatRoom[]> {
    const res = await chatApiClient.get<any>('/chats/conversations')
    const paged = res.data?.items ? res.data : { items: Array.isArray(res.data) ? res.data : [] }

    return (paged.items || []).map((c: any) => {
      const participants: any[] = c.participants || []
      const selfParticipant = currentUserId
        ? participants.find((p) => (p.userId || p.UserId) === currentUserId)
        : undefined
      return {
        id: c.id,
        name: c.title || (c.isGroup ? 'Nhóm thảo luận' : 'Hội thoại trực tiếp'),
        roomType: c.isGroup ? 'Group' : 'Direct',
        major: null,
        createdAt: c.createdAt || new Date().toISOString(),
        lastMessage: c.lastMessage ? mapBackendChatMessage(c.lastMessage) : null,
        isMuted: selfParticipant?.isMuted ?? c.isMuted ?? false,
        unreadCount: c.unreadCount ?? 0,
      }
    })
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
    const participants = payload.participantUserIds || []

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
    const attachmentUrl = payload.mediaUrl || null
    const res = await chatApiClient.post<any>(`/chats/conversations/${roomId}/messages`, {
      content: payload.content.trim(),
      attachmentUrl,
      attachmentType: attachmentUrl ? (payload.messageType || 'Image') : null,
    })
    return mapBackendChatMessage(res.data)
  },

  /**
   * CH-05: Mark messages in a conversation as read.
   * Matches BE contract: POST /api/v1/chats/conversations/{conversationId}/read
   */
  async markRead(roomId: string): Promise<{ success: boolean; readCount: number }> {
    try {
      const res = await chatApiClient.post<any>(`/chats/conversations/${roomId}/read`)
      return {
        success: true,
        readCount: res.data?.markedCount ?? res.data?.readCount ?? 0,
      }
    } catch {
      return { success: false, readCount: 0 }
    }
  },

  /**
   * CH-08: Search message history in a conversation by keyword.
   * Matches BE contract: GET /api/v1/chats/conversations/{conversationId}/messages?search={q}
   */
  async searchMessages(roomId: string, search: string, page = 1, pageSize = 30): Promise<BackendChatMessage[]> {
    const res = await chatApiClient.get<any>(`/chats/conversations/${roomId}/messages`, {
      params: { search, page, pageSize },
    })
    const raw = res.data
    return (raw.items || (Array.isArray(raw) ? raw : [])).map(mapBackendChatMessage)
  },

  /**
   * CH-09: Update conversation participant settings (Mute/Hide).
   * Matches BE contract: PUT /api/v1/chats/conversations/{conversationId}/settings
   */
  async updateSettings(roomId: string, settings: { isMuted?: boolean; isHidden?: boolean }): Promise<void> {
    await chatApiClient.put(`/chats/conversations/${roomId}/settings`, {
      isMuted: settings.isMuted,
      isHidden: settings.isHidden,
    })
  },

  /**
   * CH-07: Upload image to Cloudinary via User Service media endpoint.
   * Matches BE contract: POST /api/v1/users/media/upload
   */
  async uploadChatMedia(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await userApiClient.post<any>('/users/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data?.secureUrl || res.data?.url || ''
  },
}

