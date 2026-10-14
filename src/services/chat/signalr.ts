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
    const token = localStorage.getItem('access_token')
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

    const hubUrl = env.chatHubUrl || 'http://localhost:5199/hubs/chat'

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          return localStorage.getItem('access_token') || ''
        },
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    this.connection.onreconnected(async () => {
      // Re-join previously joined rooms
      for (const roomId of this.joinedRooms) {
        try {
          await this.connection?.invoke('JoinRoom', roomId)
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
        await this.connection.invoke('JoinRoom', roomId)
      } catch (err) {
        console.warn(`Failed to join SignalR room ${roomId}:`, err)
      }
    }
  }

  public async leaveRoom(roomId: string): Promise<void> {
    this.joinedRooms.delete(roomId)
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('LeaveRoom', roomId)
      } catch (err) {
        console.warn(`Failed to leave SignalR room ${roomId}:`, err)
      }
    }
  }

  public async sendMessage(roomId: string, content: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('SendMessage', roomId, content)
    }
  }

  public async sendTyping(roomId: string, isTyping: boolean): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('SendTyping', roomId, isTyping)
    }
  }

  public onReceiveMessage(callback: (message: BackendChatMessage) => void): () => void {
    if (!this.connection) return () => {}
    this.connection.on('ReceiveMessage', callback)
    return () => {
      this.connection?.off('ReceiveMessage', callback)
    }
  }

  public onUserTyping(callback: (payload: UserTypingEvent) => void): () => void {
    if (!this.connection) return () => {}
    this.connection.on('UserTyping', callback)
    return () => {
      this.connection?.off('UserTyping', callback)
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
