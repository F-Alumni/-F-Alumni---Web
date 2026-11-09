import * as signalR from '@microsoft/signalr'
import { env } from '@/app/config/env'
import type { BackendChatMessage } from '@/types/chat.types'

export interface UserTypingEvent {
  roomId: string
  userName: string
  isTyping: boolean
}

export interface UserPresenceEvent {
  roomId: string
  userName: string
  timestamp: string
}

class ChatHubClient {
  private connection: signalR.HubConnection | null = null
  private joinedRooms = new Set<string>()

  public getConnection(): signalR.HubConnection | null {
    return this.connection
  }

  public async startConnection(): Promise<signalR.HubConnection | null> {
    const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken')
    if (!token) return null

    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return this.connection
    }

    if (this.connection) {
      try {
        await this.connection.stop()
      } catch {
        // Ignore
      }
    }

    const hubUrl = env.chatHubUrl || 'http://localhost:5000/hubs/chat'

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          return localStorage.getItem('access_token') || localStorage.getItem('accessToken') || ''
        },
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    this.connection.onreconnected(async () => {
      // Re-join previously joined conversations
      for (const roomId of this.joinedRooms) {
        try {
          await this.connection?.invoke('JoinConversation', roomId)
        } catch {
          // Ignore re-join errors
        }
      }
    })

    try {
      await this.connection.start()
      return this.connection
    } catch (err) {
      console.warn('Could not establish SignalR chat hub connection:', err)
      return null
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop()
      } catch {
        // Ignore
      }
      this.connection = null
      this.joinedRooms.clear()
    }
  }

  public async joinRoom(roomId: string): Promise<void> {
    this.joinedRooms.add(roomId)
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('JoinConversation', roomId)
      } catch (err) {
        console.warn(`Failed to join SignalR conversation ${roomId}:`, err)
      }
    }
  }

  public async leaveRoom(roomId: string): Promise<void> {
    this.joinedRooms.delete(roomId)
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('LeaveConversation', roomId)
      } catch (err) {
        console.warn(`Failed to leave SignalR conversation ${roomId}:`, err)
      }
    }
  }

  public async sendMessage(roomId: string, content: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('SendMessage', roomId, { content })
    }
  }

  public async sendTyping(roomId: string, isTyping: boolean): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('SendTypingIndicator', roomId, isTyping)
    }
  }

  public async markConversationRead(roomId: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('MarkConversationRead', roomId)
    }
  }

  public onReceiveMessage(callback: (message: BackendChatMessage) => void): () => void {
    if (!this.connection) return () => {}
    const handler = (raw: any) => {
      const msg: BackendChatMessage = {
        id: raw.id || raw.Id,
        roomId: raw.conversationId || raw.ConversationId || raw.roomId || raw.RoomId,
        senderId: raw.senderUserId || raw.SenderUserId || raw.senderId || raw.SenderId,
        senderName: raw.senderDisplayName || raw.SenderDisplayName || raw.senderName || 'Anonymous',
        senderAvatarUrl: raw.senderAvatarUrl || raw.SenderAvatarUrl || null,
        content: raw.content || raw.Content || '',
        sentAt: raw.sentAt || raw.SentAt || new Date().toISOString(),
      }
      callback(msg)
    }
    this.connection.on('ReceiveMessage', handler)
    return () => {
      this.connection?.off('ReceiveMessage', handler)
    }
  }

  public onUserTyping(callback: (payload: UserTypingEvent) => void): () => void {
    if (!this.connection) return () => {}
    const handler = (data: any) => {
      const roomId = data.conversationId || data.ConversationId || data.roomId
      const isTyping = data.isTyping ?? data.IsTyping ?? false
      const userName = data.userName || data.senderDisplayName || (data.userId ? `User ${String(data.userId).slice(0, 4)}` : 'Someone')
      callback({ roomId, userName, isTyping })
    }
    this.connection.on('UserTyping', handler)
    return () => {
      this.connection?.off('UserTyping', handler)
    }
  }

  public onMessagesRead(callback: (payload: { conversationId: string; readerUserId: string; markedCount: number }) => void): () => void {
    if (!this.connection) return () => {}
    const handler = (data: any) => {
      callback({
        conversationId: data.conversationId || data.ConversationId,
        readerUserId: data.readerUserId || data.ReaderUserId,
        markedCount: data.markedCount ?? data.MarkedCount ?? 0,
      })
    }
    this.connection.on('MessagesRead', handler)
    return () => {
      this.connection?.off('MessagesRead', handler)
    }
  }

  public onUserJoined(callback: (payload: UserPresenceEvent) => void): () => void {
    if (!this.connection) return () => {}
    this.connection.on('UserJoined', callback)
    return () => {
      this.connection?.off('UserJoined', callback)
    }
  }

  public onUserLeft(callback: (payload: UserPresenceEvent) => void): () => void {
    if (!this.connection) return () => {}
    this.connection.on('UserLeft', callback)
    return () => {
      this.connection?.off('UserLeft', callback)
    }
  }
}

export const chatHubClient = new ChatHubClient()
