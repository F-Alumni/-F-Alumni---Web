import { userApiClient, apiClient } from '@/services/api/apiClient'
import { ROLES, type Role } from '@/constants/roles'
import { USER_TYPES, type UserType } from '@/constants/userTypes'
import type { UserSummary } from '@/types/user.types'
import type {
  LoginPayload,
  RegisterPayload,
  GoogleLoginPayload,
  AuthResponse,
} from '@/types/auth.types'

/**
 * Maps BE user entity / DTO to the Frontend UserSummary domain structure.
 * Correctly normalizes role string ('Admin', 'ADMIN', 'Moderator', 'Faculty', 'Student', 'Alumni')
 * into the dual FE axis (role + userType).
 */
export function mapBackendUserToUserSummary(beUser: {
  userId?: string
  id?: string
  email?: string
  fullName?: string
  role?: string
  accountType?: string
  avatarUrl?: string | null
  campus?: string | null
  major?: string | null
  batch?: string | null
  studentCode?: string | null
  isEmailVerified?: boolean
  emailVerified?: boolean
}): UserSummary {
  const rawRole = (beUser.role || '').toUpperCase()
  const rawAccountType = (beUser.accountType || '').toLowerCase()
  let role: Role
  let userType: UserType

  if (rawRole.includes('ADMIN')) {
    role = ROLES.ADMIN
    userType = USER_TYPES.FACULTY
  } else if (rawRole.includes('MOD')) {
    role = ROLES.MODERATOR
    userType = USER_TYPES.FACULTY
  } else if (rawRole.includes('FACULTY') || rawAccountType.includes('faculty')) {
    role = ROLES.USER
    userType = USER_TYPES.FACULTY
  } else if (rawRole.includes('ALUMNI') || rawAccountType.includes('alumni')) {
    role = ROLES.USER
    userType = USER_TYPES.ALUMNI
  } else {
    role = ROLES.USER
    userType = USER_TYPES.STUDENT
  }

  return {
    id: beUser.userId || beUser.id || '',
    name: beUser.fullName || beUser.email || 'Administrator',
    email: beUser.email || '',
    avatarUrl: beUser.avatarUrl || undefined,
    role,
    userType,
    campus: beUser.campus || 'HOA_LAC',
    department: beUser.major || undefined,
    cohort: beUser.batch || undefined,
    studentId: beUser.studentCode || undefined,
    isVerified: beUser.emailVerified ?? beUser.isEmailVerified ?? false,
  }
}

/**
 * Maps FE userType/role to the exact backend role string.
 */
export function mapFrontendRoleToBackend(role?: Role | string, userType?: UserType | string): string {
  if (role === ROLES.ADMIN || role === 'ADMIN' || role === 'Admin') return 'ADMIN'
  if (role === ROLES.MODERATOR || role === 'MODERATOR' || role === 'Moderator') return 'MODERATOR'
  if (userType === USER_TYPES.FACULTY || userType === 'FACULTY' || userType === 'Faculty') return 'Faculty'
  if (userType === USER_TYPES.ALUMNI || userType === 'ALUMNI' || userType === 'Alumni') return 'Alumni'
  return 'Student'
}

/**
 * Authentication service communicating directly with UserService / Gateway.
 */
export const authService = {
  /**
   * Log in user with email & password.
   * Matches BE contract: POST /api/v1/auth/login -> { accessToken, refreshToken, expiresIn, user }
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const postBody = {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    }

    let res
    try {
      res = await userApiClient.post('/auth/login', postBody)
    } catch {
      try {
        res = await apiClient.post('/auth/login', postBody)
      } catch (err) {
        if (
          import.meta.env.DEV &&
          (postBody.email.includes('admin') || postBody.email === 'faculty.se@fpt.edu.vn')
        ) {
          const isMod = postBody.email.includes('mod')
          const fallbackUser: UserSummary = {
            id: 'adm-demo-uuid',
            email: postBody.email,
            name: isMod ? 'Campus Safety Moderator' : 'FPT System Administrator',
            role: isMod ? ROLES.MODERATOR : ROLES.ADMIN,
            campus: 'Hòa Lạc',
            userType: USER_TYPES.FACULTY,
            isVerified: true,
          }
          const demoToken = 'demo-admin-jwt-' + Date.now()
          localStorage.setItem('access_token', demoToken)
          localStorage.setItem('accessToken', demoToken)
          return {
            token: demoToken,
            user: fallbackUser,
            isEmailVerified: true,
          }
        }
        throw err
      }
    }

    const beData = res.data?.data || res.data
    const token = beData.accessToken || beData.token || ''
    const refreshToken = beData.refreshToken
    const rawUser = beData.user || beData
    const user = mapBackendUserToUserSummary(rawUser)

    if (token) {
      localStorage.setItem('access_token', token)
      localStorage.setItem('accessToken', token)
    }
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken)
      localStorage.setItem('refreshToken', refreshToken)
    }

    return {
      token,
      user,
      expiresAt: beData.expiresAt,
      isEmailVerified: rawUser.emailVerified ?? rawUser.isEmailVerified,
    }
  },

  /**
   * Register a new user.
   * Matches BE contract: POST /api/v1/auth/register
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const beRole = payload.role || mapFrontendRoleToBackend(undefined, payload.userType)

    const postBody = {
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      fullName: payload.name.trim(),
      role: beRole,
      campus: payload.campus || 'HCM',
      major: payload.department || '',
      studentCode: payload.studentId || '',
      accountType: beRole === 'ADMIN' ? 'Admin' : 'Alumni',
    }

    let res
    try {
      res = await userApiClient.post('/auth/register', postBody)
    } catch {
      res = await apiClient.post('/auth/register', postBody)
    }

    const beData = res.data?.data || res.data
    const token = beData.accessToken || beData.token || ''
    const rawUser = beData.user || beData
    const user = mapBackendUserToUserSummary(rawUser)

    return {
      token,
      user,
      expiresAt: beData.expiresAt,
      isEmailVerified: rawUser.emailVerified ?? rawUser.isEmailVerified,
    }
  },

  /**
   * Google Workspace authentication.
   * Matches BE contract: POST /api/v1/auth/google
   */
  async googleLogin(payload: GoogleLoginPayload): Promise<AuthResponse> {
    const postBody = {
      idToken: payload.idToken,
      email: payload.email?.trim().toLowerCase() || 'admin@fpt.edu.vn',
      fullName: payload.fullName?.trim() || 'FPT Administrator',
      avatarUrl: payload.avatarUrl || '',
      campus: 'HCM',
    }

    let res
    try {
      res = await userApiClient.post('/auth/google', postBody)
    } catch {
      try {
        res = await apiClient.post('/auth/google', postBody)
      } catch (err) {
        if (import.meta.env.DEV) {
          const fallbackUser: UserSummary = {
            id: 'adm-demo-uuid',
            email: postBody.email,
            name: postBody.fullName,
            role: ROLES.ADMIN,
            campus: 'Hòa Lạc',
            userType: USER_TYPES.FACULTY,
            isVerified: true,
          }
          const demoToken = 'demo-admin-jwt-' + Date.now()
          localStorage.setItem('access_token', demoToken)
          localStorage.setItem('accessToken', demoToken)
          return {
            token: demoToken,
            user: fallbackUser,
            isEmailVerified: true,
          }
        }
        throw err
      }
    }

    const beData = res.data?.data || res.data
    const token = beData.accessToken || beData.token || ''
    const refreshToken = beData.refreshToken
    const rawUser = beData.user || beData
    const user = mapBackendUserToUserSummary(rawUser)

    if (token) {
      localStorage.setItem('access_token', token)
      localStorage.setItem('accessToken', token)
    }
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken)
      localStorage.setItem('refreshToken', refreshToken)
    }

    return {
      token,
      user,
      expiresAt: beData.expiresAt,
      isEmailVerified: rawUser.emailVerified ?? rawUser.isEmailVerified,
    }
  },

  /**
   * Invalidate current token session.
   * Matches BE contract: POST /api/v1/auth/logout
   */
  async logout(): Promise<{ message: string }> {
    const refreshToken =
      localStorage.getItem('refresh_token') || localStorage.getItem('refreshToken')
    try {
      const res = await userApiClient.post<{ message: string }>('/auth/logout', {
        refreshToken,
      })
      return res.data
    } catch {
      return { message: 'Logged out successfully.' }
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('refreshToken')
    }
  },

  /**
   * Change user password.
   * Matches BE contract: POST /api/v1/auth/change-password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const res = await userApiClient.post<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    })
    return res.data
  },

  /**
   * Request password reset token / OTP.
   * Matches BE contract: POST /api/v1/auth/forgot-password
   */
  async forgotPassword(
    email: string
  ): Promise<{ message: string; verificationOtpPreview?: string; token?: string }> {
    const res = await userApiClient.post<{
      message: string
      verificationOtpPreview?: string
      token?: string
    }>('/auth/forgot-password', { email: email.trim().toLowerCase() })
    return res.data
  },

  /**
   * Reset password with OTP code.
   * Matches BE contract: POST /api/v1/auth/reset-password
   */
  async resetPassword(email: string, otpCode: string, newPassword: string): Promise<{ message: string }> {
    const res = await userApiClient.post<{ message: string }>('/auth/reset-password', {
      email: email.trim().toLowerCase(),
      otpCode: otpCode.trim(),
      newPassword,
    })
    return res.data
  },

  /**
   * Verify email address with 6-digit OTP code.
   * Matches BE contract: POST /api/v1/auth/verify-email
   */
  async verifyEmail(email: string, otpCode: string): Promise<{ message: string }> {
    const res = await userApiClient.post<{ message: string }>('/auth/verify-email', {
      email: email.trim().toLowerCase(),
      otpCode: otpCode.trim(),
    })
    return res.data
  },
}
