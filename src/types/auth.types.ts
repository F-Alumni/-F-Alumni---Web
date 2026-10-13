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
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  userType: UserType
  campus?: CampusCode | string
  studentId?: string
  department?: string
  cohort?: string
}

export interface AuthResponse {
  token: string
  user: UserSummary
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
  sub: string
  email: string
  name: string
  role: Role
  userType: UserType
  campus: string
  isVerified: boolean
  permissions: string[]
  iat: number
  exp: number
}
