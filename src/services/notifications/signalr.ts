import * as signalR from '@microsoft/signalr'
import { env } from '@/app/config/env'
import type { NotificationItemDto } from './index'

class NotificationHubClient {
  private connection: signalR.HubConnection | null = null
  private startPromise: Promise<signalR.HubConnection | null> | null = null
  private listeners = new Set<(notification: NotificationItemDto) => void>()

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
            // Ignore stop error on reconnect
          }
        }

        const conn = new signalR.HubConnectionBuilder()
          .withUrl(env.notificationHubUrl || 'http://localhost:5006/hubs/notifications', {
            accessTokenFactory: () =>
              localStorage.getItem('access_token') || localStorage.getItem('accessToken') || '',
          })
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Error)
          .build()

        conn.on('ReceiveNotification', (payload: NotificationItemDto) => {
          this.listeners.forEach((cb) => cb(payload))
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
      try {
        await conn.stop()
      } catch {
        // Ignore teardown error
      }
    }
  }

  public onReceiveNotification(callback: (notification: NotificationItemDto) => void): () => void {
    this.listeners.add(callback)
    return () => {
      this.listeners.delete(callback)
    }
  }
}

export const notificationHubClient = new NotificationHubClient()
