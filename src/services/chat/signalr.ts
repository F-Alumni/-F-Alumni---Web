import * as signalR from '@microsoft/signalr'
import { env } from '@/app/config/env'
import { mapBackendChatMessage } from './index'
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
  private startPromise: Promise<signalR.HubConnection | null> | null = null
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

    if (this.startPromise) {
      return this.startPromise
    }

    this.startPromise = (async () => {
      try {
        if (this.connection) {
          try {
            await this.connection.stop()
          } catch {
            // Ignore
          }
        }

        const hubUrl = env.chatHubUrl || 'http://localhost:5000/hubs/chat'

        const conn = new signalR.HubConnectionBuilder()
          .withUrl(hubUrl, {
            accessTokenFactory: () =>
              localStorage.getItem('access_token') || localStorage.getItem('accessToken') || '',
          })
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Error)
          .build()

        conn.onreconnected(async () => {
          for (const roomId of this.joinedRooms) {
            try {
              await conn.invoke('JoinConversation', roomId)
            } catch {
              // Ignore re-join errors
            }
          }
        })

        this.connection = conn
        await conn.start()
        return conn
      } catch {
        return null
      } finally {
        this.startPromise = null
      }
    })()

    return this.startPromise
  }

  public async stopConnection(): Promise<void> {
    this.startPromise = null
    if (this.connection) {
      const conn = this.connection
      this.connection = null
      this.joinedRooms.clear()
      try {
        await conn.stop()
      } catch {
        // Ignore teardown abort
      }
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

  public async sendMessage(
    roomId: string,
    content: string,
    attachmentUrl?: string | null,
    attachmentType?: string | null
  ): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('SendMessage', roomId, {
        content,
        attachmentUrl: attachmentUrl || null,
        attachmentType: attachmentUrl ? attachmentType || 'Image' : null,
      })
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
      callback(mapBackendChatMessage(raw))
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
