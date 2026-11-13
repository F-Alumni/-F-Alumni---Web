import { userApiClient } from '@/services/api/apiClient'
import type {
  BackendMyProfileResponse,
  BackendPublicProfileResponse,
  BackendPrivacySetting,
  BackendPagedResult,
  BackendUserSummary,
  BackendBlockedUser,
  UpdateProfilePayload,
  GetUsersParams,
} from '@/types/user.types'

/**
 * Maps backend UserProfileResponse to Frontend BackendMyProfileResponse.
 */
function mapUserProfileResponseToBackendMyProfile(dto: any): BackendMyProfileResponse {
  return {
    id: dto.id,
    email: dto.email || '',
    fullName: dto.fullName || dto.displayName || '',
    avatarUrl: dto.avatarUrl || null,
    campus: dto.campus || null,
    major: dto.major || null,
    batch: dto.graduationYear ? String(dto.graduationYear) : (dto.studentCode || dto.batch || null),
    bio: dto.bio || null,
    googleCalendarUrl: dto.googleCalendarUrl || null,
    role: dto.role || 'USER',
    isEmailVerified: dto.emailVerified ?? dto.isEmailVerified ?? true,
    createdAt: dto.createdAtUtc || dto.createdAt || new Date().toISOString(),
    privacySetting: {
      showEmail: dto.showEmailPublicly ?? dto.privacySetting?.showEmail ?? true,
      showCampus: dto.privacySetting?.showCampus ?? true,
      showMajor: dto.privacySetting?.showMajor ?? true,
      showBatch: dto.privacySetting?.showBatch ?? true,
      showBio: dto.privacySetting?.showBio ?? true,
      showGoogleCalendar: dto.showCalendarPublicly ?? dto.privacySetting?.showGoogleCalendar ?? true,
    },
  }
}

/**
 * Maps backend UserProfileResponse to Frontend BackendPublicProfileResponse.
 */
function mapUserProfileResponseToBackendPublicProfile(dto: any): BackendPublicProfileResponse {
  return {
    id: dto.id,
    fullName: dto.fullName || dto.displayName || '',
    avatarUrl: dto.avatarUrl || null,
    campus: dto.campus || null,
    major: dto.major || null,
    batch: dto.graduationYear ? String(dto.graduationYear) : null,
    bio: dto.bio || null,
    googleCalendarUrl: dto.googleCalendarUrl || null,
    role: dto.role || 'USER',
    email: dto.showEmailPublicly ? dto.email : null,
  }
}

/**
 * Users and Profile service communicating with UserService via API Gateway (/api/v1/users/*).
 */
export const usersService = {
  /**
   * Fetch current authenticated user's profile and privacy settings.
   * Matches BE contract: GET /api/v1/users/me
   */
  async getMe(): Promise<BackendMyProfileResponse> {
    const res = await userApiClient.get<any>('/users/me')
    const raw = res.data?.data || res.data
    return mapUserProfileResponseToBackendMyProfile(raw)
  },

  /**
   * Update current user profile. Full overwrite for editable fields.
   * Matches BE contract: PUT /api/v1/users/me
   */
  async updateMe(payload: UpdateProfilePayload): Promise<BackendMyProfileResponse> {
    const parsedYear = payload.batch
      ? parseInt(String(payload.batch).replace(/\D/g, ''), 10)
      : undefined
    const res = await userApiClient.put<any>('/users/me', {
      fullName: payload.fullName,
      avatarUrl: payload.avatarUrl || '',
      campus: payload.campus || 'HCM',
      major: payload.major || '',
      graduationYear: parsedYear && !isNaN(parsedYear) && parsedYear > 1990 ? parsedYear : undefined,
      studentCode: payload.batch || '',
      bio: payload.bio || '',
      googleCalendarUrl: payload.googleCalendarUrl || '',
    })
    const raw = res.data?.data || res.data
    return mapUserProfileResponseToBackendMyProfile(raw)
  },

  /**
   * Fetch a public profile by user GUID with privacy filters applied by BE.
   * Matches BE contract: GET /api/v1/users/{id}
   */
  async getUserProfile(id: string): Promise<BackendPublicProfileResponse> {
    const res = await userApiClient.get<any>(`/users/${id}`)
    const raw = res.data?.data || res.data
    return mapUserProfileResponseToBackendPublicProfile(raw)
  },

  /**
   * Fetch current privacy flags.
   * Matches BE contract: GET /api/v1/users/me -> extracts privacy booleans
   */
  async getPrivacySettings(): Promise<BackendPrivacySetting> {
    const res = await userApiClient.get<any>('/users/me')
    const raw = res.data?.data || res.data
    return {
      showEmail: raw.showEmailPublicly ?? true,
      showCampus: true,
      showMajor: true,
      showBatch: true,
      showBio: true,
      showGoogleCalendar: raw.showCalendarPublicly ?? true,
    }
  },

  /**
   * Update current user avatar URL.
   * Matches BE contract: PUT /api/v1/users/me/avatar
   */
  async updateAvatar(avatarUrl: string): Promise<BackendMyProfileResponse> {
    const res = await userApiClient.put<any>('/users/me/avatar', { avatarUrl })
    const raw = res.data?.data || res.data
    return mapUserProfileResponseToBackendMyProfile(raw)
  },

  /**
   * Update privacy flags.
   * Matches BE contract: PUT /api/v1/users/me/privacy
   */
  async updatePrivacySettings(settings: BackendPrivacySetting): Promise<BackendPrivacySetting> {
    const res = await userApiClient.put<any>('/users/me/privacy', {
      showEmailPublicly: settings.showEmail,
      showPhonePublicly: false,
      showCompanyPublicly: true,
      showCalendarPublicly: settings.showGoogleCalendar,
    })
    const raw = res.data?.data || res.data
    return {
      showEmail: raw.showEmailPublicly ?? settings.showEmail,
      showCampus: settings.showCampus,
      showMajor: settings.showMajor,
      showBatch: settings.showBatch,
      showBio: settings.showBio,
      showGoogleCalendar: raw.showCalendarPublicly ?? settings.showGoogleCalendar,
    }
  },

  /**
   * Search users across the university community directory.
   * Matches BE contract: GET /api/v1/users?search=...&campus=...&major=...&role=...&pageNumber=...&pageSize=...
   */
  async searchUsers(params: GetUsersParams = {}): Promise<BackendPagedResult<BackendUserSummary>> {
    const queryParams: Record<string, string | number> = {}

    const searchKeyword = params.keyword || params.search
    if (searchKeyword && searchKeyword.trim()) {
      queryParams.search = searchKeyword.trim()
    }

    if (params.campus && params.campus !== 'ALL') {
      queryParams.campus = params.campus
    }

    if (params.major && params.major !== 'ALL') {
      queryParams.major = params.major
    }

    if (params.role && params.role !== 'ALL') {
      queryParams.role = params.role
    }

    const pageNumber = params.page && params.page > 0 ? params.page : 1
    queryParams.pageNumber = pageNumber

    const pageSize = params.pageSize || params.limit || 20
    queryParams.pageSize = Math.min(100, Math.max(1, pageSize))

    const res = await userApiClient.get<any>('/users', {
      params: queryParams,
    })

    const raw = res.data
    const rawItems: any[] = raw.items || (Array.isArray(raw) ? raw : [])

    const items: BackendUserSummary[] = rawItems.map((u: any) => ({
      id: u.id,
      fullName: u.fullName || u.displayName || '',
      avatarUrl: u.avatarUrl || null,
      campus: u.campus || null,
      major: u.major || null,
      batch: u.graduationYear ? String(u.graduationYear) : (u.studentCode || u.batch || null),
      role: u.role || 'USER',
      bio: u.bio || null,
      googleCalendarUrl: u.googleCalendarUrl || null,
      email: u.showEmailPublicly ? u.email : null,
    }))

    return {
      items,
      totalCount: raw.totalCount || items.length,
      page: raw.pageNumber || pageNumber,
      pageSize: raw.pageSize || pageSize,
      totalPages: raw.totalPages || Math.ceil((raw.totalCount || items.length) / pageSize) || 1,
    }
  },

  /**
   * Block target user by GUID.
   * Matches BE contract: POST /api/v1/users/{id}/block
   */
  async blockUser(userId: string): Promise<{ message: string }> {
    const res = await userApiClient.post<{ message?: string }>(`/users/${userId}/block`, {})
    return {
      message: res.data?.message || 'User blocked successfully.',
    }
  },

  /**
   * Remove block from target user by GUID.
   * Matches BE contract: DELETE /api/v1/users/{id}/block
   */
  async unblockUser(userId: string): Promise<{ message: string }> {
    await userApiClient.delete(`/users/${userId}/block`)
    return {
      message: 'User unblocked successfully.',
    }
  },

  /**
   * Retrieve list of users currently blocked by the authenticated caller.
   * Matches BE contract: GET /api/v1/users/me/blocks
   */
  async getBlockedUsers(): Promise<BackendBlockedUser[]> {
    const res = await userApiClient.get<any[]>('/users/me/blocks')
    const list = Array.isArray(res.data) ? res.data : []
    return list.map((b: any) => ({
      blockedUserId: b.blockedTargetUserId || b.blockedUserId || b.id,
      fullName: b.targetFullName || b.fullName || b.targetEmail || 'Người dùng đã chặn',
      email: b.targetEmail || null,
      avatarUrl: b.targetAvatarUrl || b.avatarUrl || null,
      role: b.targetRole || null,
      major: b.targetMajor || null,
      campus: b.targetCampus || null,
      reason: b.reason || null,
      blockedAt: b.createdAtUtc || b.blockedAt || new Date().toISOString(),
    }))
  },
}
