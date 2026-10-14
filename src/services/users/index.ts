import { apiClient } from '@/services/api/apiClient'
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
 * Users and Profile service communicating directly with UserService (http://localhost:5164).
 */
export const usersService = {
  /**
   * Fetch current authenticated user's profile and privacy settings.
   * Matches BE contract: GET /api/profile/me
   */
  async getMe(): Promise<BackendMyProfileResponse> {
    const res = await apiClient.get<BackendMyProfileResponse>('/api/profile/me')
    return res.data
  },

  /**
   * Update current user profile. Full overwrite for editable fields.
   * Matches BE contract: PUT /api/profile/me -> { message, data: BackendMyProfileResponse }
   */
  async updateMe(payload: UpdateProfilePayload): Promise<BackendMyProfileResponse> {
    const res = await apiClient.put<{ message: string; data: BackendMyProfileResponse }>('/api/profile/me', {
      fullName: payload.fullName,
      avatarUrl: payload.avatarUrl || null,
      campus: payload.campus || null,
      major: payload.major || null,
      batch: payload.batch || null,
      bio: payload.bio || null,
      googleCalendarUrl: payload.googleCalendarUrl || null,
    })
    return res.data.data
  },

  /**
   * Fetch a public profile by user GUID with privacy filters applied by BE.
   * Matches BE contract: GET /api/profile/{id}
   */
  async getUserProfile(id: string): Promise<BackendPublicProfileResponse> {
    const res = await apiClient.get<BackendPublicProfileResponse>(`/api/profile/${id}`)
    return res.data
  },

  /**
   * Fetch current privacy flags.
   * Matches BE contract: GET /api/profile/privacy
   */
  async getPrivacySettings(): Promise<BackendPrivacySetting> {
    const res = await apiClient.get<BackendPrivacySetting>('/api/profile/privacy')
    return res.data
  },

  /**
   * Update privacy flags (all 6 flags must be provided).
   * Matches BE contract: PUT /api/profile/privacy -> { message, data: BackendPrivacySetting }
   */
  async updatePrivacySettings(settings: BackendPrivacySetting): Promise<BackendPrivacySetting> {
    const res = await apiClient.put<{ message: string; data: BackendPrivacySetting }>('/api/profile/privacy', settings)
    return res.data.data
  },

  /**
   * Search users across the university community directory.
   * Matches BE contract: GET /api/users/search
   * Query params: keyword, campus, major, role, page, pageSize
   */
  async searchUsers(params: GetUsersParams = {}): Promise<BackendPagedResult<BackendUserSummary>> {
    const queryParams: Record<string, string | number> = {}

    const searchKeyword = params.keyword || params.search
    if (searchKeyword && searchKeyword.trim()) {
      queryParams.keyword = searchKeyword.trim()
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

    if (params.page && params.page > 0) {
      queryParams.page = params.page
    }

    const pageSize = params.pageSize || params.limit
    if (pageSize && pageSize > 0 && pageSize <= 50) {
      queryParams.pageSize = pageSize
    }

    const res = await apiClient.get<BackendPagedResult<BackendUserSummary>>('/api/users/search', {
      params: queryParams,
    })
    return res.data
  },

  /**
   * Block target user by GUID.
   * Matches BE contract: POST /api/users/{id}/block
   */
  async blockUser(userId: string): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>(`/api/users/${userId}/block`)
    return res.data
  },

  /**
   * Remove block from target user by GUID.
   * Matches BE contract: DELETE /api/users/{id}/block
   */
  async unblockUser(userId: string): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/api/users/${userId}/block`)
    return res.data
  },

  /**
   * Retrieve list of users currently blocked by the authenticated caller.
   * Matches BE contract: GET /api/users/blocked
   */
  async getBlockedUsers(): Promise<BackendBlockedUser[]> {
    const res = await apiClient.get<BackendBlockedUser[]>('/api/users/blocked')
    return res.data
  },
}
