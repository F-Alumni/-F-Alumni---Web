import * as signalR from '@microsoft/signalr'
import { env } from '@/app/config/env'

class ForumHubClient {
  private connection: signalR.HubConnection | null = null
  private startPromise: Promise<signalR.HubConnection | null> | null = null
  private postCreatedListeners = new Set<(post: unknown) => void>()
  private reactionListeners = new Set<(payload: { postId: string; likeCount: number }) => void>()
  private commentListeners = new Set<(payload: { postId?: string }) => void>()

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
            // Ignore stop error
          }
        }

        const conn = new signalR.HubConnectionBuilder()
          .withUrl(env.forumHubUrl || 'http://localhost:5003/hubs/forum', {
            accessTokenFactory: () =>
              localStorage.getItem('access_token') || localStorage.getItem('accessToken') || '',
          })
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Error)
          .build()

        conn.on('ReceiveNewPost', (post: unknown) => {
          this.postCreatedListeners.forEach((cb) => cb(post))
        })
        conn.on('ReceiveReaction', (payload: { postId: string; likeCount: number }) => {
          this.reactionListeners.forEach((cb) => cb(payload))
        })
        conn.on('ReceiveComment', (payload: { postId?: string }) => {
          this.commentListeners.forEach((cb) => cb(payload))
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
        // Ignore teardown abort
      }
    }
  }

  public async joinPostGroup(postId: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('JoinPostGroup', postId)
      } catch {
        // Ignore
      }
    }
  }

  public async leavePostGroup(postId: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('LeavePostGroup', postId)
      } catch {
        // Ignore
      }
    }
  }

  public async joinEventsGroup(): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('JoinEventsGroup')
      } catch {
        // Ignore
      }
    }
  }

  public onEvent<T = unknown>(eventName: string, callback: (payload: T) => void): () => void {
    if (!this.connection) return () => {}
    this.connection.on(eventName, callback)
    return () => {
      this.connection?.off(eventName, callback)
    }
  }

  public onPostCreated(callback: (post: unknown) => void): () => void {
    this.postCreatedListeners.add(callback)
    return () => {
      this.postCreatedListeners.delete(callback)
    }
  }

  public onReactionUpdated(
    callback: (payload: { postId: string; likeCount: number }) => void
  ): () => void {
    this.reactionListeners.add(callback)
    return () => {
      this.reactionListeners.delete(callback)
    }
  }

  public onCommentReceived(callback: (payload: { postId?: string }) => void): () => void {
    this.commentListeners.add(callback)
    return () => {
      this.commentListeners.delete(callback)
    }
  }
}

export const forumHubClient = new ForumHubClient()
