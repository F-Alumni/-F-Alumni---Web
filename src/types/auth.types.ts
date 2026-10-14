import type { Role } from '@/constants/roles'
import type { UserType } from '@/constants/userTypes'
import type { CampusCode, UserSummary } from './user.types'

/**
 * Authentication domain types and DTO contracts.
 */

export interface LoginPayload {
  email: string
  password: string
  rememberMe?: boolean
}

export type LoginRequest = LoginPayload

export interface GoogleLoginPayload {
  idToken: string
  email?: string
  fullName?: string
  avatarUrl?: string
  role?: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  userType?: UserType
  role?: string
  campus?: CampusCode | string
  studentId?: string
  department?: string
  cohort?: string
}

export interface BackendAuthData {
  userId: string
  email: string
  fullName: string
  role: string
  token: string
  expiresAt: string
  isEmailVerified: boolean
}

export interface BackendAuthResponse {
  message: string
  data: BackendAuthData
}

export interface AuthResponse {
  token: string
  user: UserSummary
  expiresAt?: string
  isEmailVerified?: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

export interface AuthSession {
  userId: string
  role: Role
  userType: UserType
  isAuthenticated: boolean
}

export interface JwtTokenPayload {
  nameid?: string
  email?: string
  unique_name?: string
  role?: string
  exp?: number
  sub?: string
  name?: string
  userType?: UserType
  campus?: string
  isVerified?: boolean
  permissions?: string[]
  iat?: number
}
