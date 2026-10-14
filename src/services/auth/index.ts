import { apiClient } from '@/services/api/apiClient'
import { ROLES, type Role } from '@/constants/roles'
import { USER_TYPES, type UserType } from '@/constants/userTypes'
import type { UserSummary } from '@/types/user.types'
import type {
  LoginPayload,
  RegisterPayload,
  GoogleLoginPayload,
  BackendAuthResponse,
  AuthResponse,
} from '@/types/auth.types'

/**
 * Maps BE user entity / DTO to the Frontend UserSummary domain structure.
 * Correctly normalizes role string ('Admin', 'Moderator', 'Faculty', 'Student', 'Alumni')
 * into the dual FE axis (role + userType).
 */
export function mapBackendUserToUserSummary(beUser: {
  userId?: string
  id?: string
  email?: string
  fullName: string
  role: string
  avatarUrl?: string | null
  campus?: string | null
  major?: string | null
  batch?: string | null
  isEmailVerified?: boolean
}): UserSummary {
  const rawRole = (beUser.role || '').toLowerCase()
  let role: Role = ROLES.USER
  let userType: UserType = USER_TYPES.STUDENT

  if (rawRole.includes('admin')) {
    role = ROLES.ADMIN
    userType = USER_TYPES.FACULTY
  } else if (rawRole.includes('mod')) {
    role = ROLES.MODERATOR
    userType = USER_TYPES.FACULTY
  } else if (rawRole.includes('faculty')) {
    role = ROLES.USER
    userType = USER_TYPES.FACULTY
  } else if (rawRole.includes('alumni')) {
    role = ROLES.USER
    userType = USER_TYPES.ALUMNI
  } else {
    role = ROLES.USER
    userType = USER_TYPES.STUDENT
  }

  return {
    id: beUser.userId || beUser.id || '',
    name: beUser.fullName,
    email: beUser.email || '',
    avatarUrl: beUser.avatarUrl || undefined,
    role,
    userType,
    campus: beUser.campus || 'HOA_LAC',
    department: beUser.major || undefined,
    cohort: beUser.batch || undefined,
    isVerified: beUser.isEmailVerified ?? false,
  }
}

/**
 * Maps FE userType/role to the exact backend role string.
 */
export function mapFrontendRoleToBackend(role?: Role | string, userType?: UserType | string): string {
  if (role === ROLES.ADMIN || role === 'ADMIN' || role === 'Admin') return 'Admin'
  if (role === ROLES.MODERATOR || role === 'MODERATOR' || role === 'Moderator') return 'Moderator'
  if (userType === USER_TYPES.FACULTY || userType === 'FACULTY' || userType === 'Faculty') return 'Faculty'
  if (userType === USER_TYPES.ALUMNI || userType === 'ALUMNI' || userType === 'Alumni') return 'Alumni'
  return 'Student'
}

/**
 * Authentication service communicating directly with UserService (http://localhost:5164).
 */
export const authService = {
  /**
   * Log in user with email & password.
   * Matches BE contract: POST /api/auth/login -> { message, data: { userId, email, fullName, role, token, expiresAt, isEmailVerified } }
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<BackendAuthResponse>('/api/auth/login', {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    })

    const beData = res.data.data
    const user = mapBackendUserToUserSummary(beData)

    return {
      token: beData.token,
      user,
      expiresAt: beData.expiresAt,
      isEmailVerified: beData.isEmailVerified,
    }
  },

  /**
   * Register a new user.
   * Matches BE contract: POST /api/auth/register -> { message, data: { userId, email, fullName, role, token, expiresAt, isEmailVerified } }
   * Note BE fields: fullName, email, password, role, campus, major, batch.
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const beRole = payload.role || mapFrontendRoleToBackend(undefined, payload.userType)

    const res = await apiClient.post<BackendAuthResponse>('/api/auth/register', {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      fullName: payload.name.trim(),
      role: beRole,
      campus: payload.campus || null,
      major: payload.department || null,
      batch: payload.cohort || null,
    })

    const beData = res.data.data
    const user = mapBackendUserToUserSummary(beData)

    return {
      token: beData.token,
      user,
      expiresAt: beData.expiresAt,
      isEmailVerified: beData.isEmailVerified,
    }
  },

  /**
   * Google Workspace authentication.
   * Matches BE contract: POST /api/auth/google-login
   */
  async googleLogin(payload: GoogleLoginPayload): Promise<AuthResponse> {
    const res = await apiClient.post<BackendAuthResponse>('/api/auth/google-login', {
      idToken: payload.idToken,
      email: payload.email?.trim().toLowerCase() || '',
      fullName: payload.fullName?.trim() || 'Google User',
      avatarUrl: payload.avatarUrl || null,
      role: payload.role || 'Student',
    })

    const beData = res.data.data
    const user = mapBackendUserToUserSummary(beData)

    return {
      token: beData.token,
      user,
      expiresAt: beData.expiresAt,
      isEmailVerified: beData.isEmailVerified,
    }
  },

  /**
   * Invalidate current token session.
   * Matches BE contract: POST /api/auth/logout (Bearer auth required)
   */
  async logout(): Promise<{ message: string }> {
    try {
      const res = await apiClient.post<{ message: string }>('/api/auth/logout')
      return res.data
    } finally {
      localStorage.removeItem('access_token')
    }
  },

  /**
   * Change user password.
   * Matches BE contract: POST /api/auth/change-password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>('/api/auth/change-password', {
      currentPassword,
      newPassword,
    })
    return res.data
  },

  /**
   * Request password reset token.
   * Matches BE contract: POST /api/auth/forgot-password -> { message, token }
   */
  async forgotPassword(email: string): Promise<{ message: string; token?: string }> {
    const res = await apiClient.post<{ message: string; token?: string }>('/api/auth/forgot-password', {
      email: email.trim().toLowerCase(),
    })
    return res.data
  },

  /**
   * Reset password with reset token.
   * Matches BE contract: POST /api/auth/reset-password
   */
  async resetPassword(email: string, token: string, newPassword: string): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>('/api/auth/reset-password', {
      email: email.trim().toLowerCase(),
      token,
      newPassword,
    })
    return res.data
  },

  /**
   * Verify email address with token.
   * Matches BE contract: POST /api/auth/verify-email
   */
  async verifyEmail(email: string, token: string): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>('/api/auth/verify-email', {
      email: email.trim().toLowerCase(),
      token,
    })
    return res.data
  },

  /**
   * Resend verification email token.
   * Matches BE contract: POST /api/auth/resend-verification
   */
  async resendVerification(email: string): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>('/api/auth/resend-verification', {
      email: email.trim().toLowerCase(),
    })
    return res.data
  },
}
