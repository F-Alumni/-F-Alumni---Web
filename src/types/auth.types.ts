/**
 * Authentication domain types foundation.
 */

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

export interface AuthSession {
  userId: string
  role: string
  isAuthenticated: boolean
}
