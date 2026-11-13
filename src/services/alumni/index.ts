import { usersService } from '@/services/users'
import type {
  BackendUserSummary,
  BackendPagedResult,
  GetUsersParams,
  BackendPublicProfileResponse,
  BackendBlockedUser,
} from '@/types/user.types'

/**
 * Alumni service boundary.
 * Architectural boundary for alumni directory, profiles, and member management.
 * Communicates with the User Microservice via API Gateway / UserService.
 */
export const alumniService = {
  /**
   * Search and filter alumni members directory.
   * Defaults to role 'Alumni' if not explicitly overridden.
   */
  async getAlumniDirectory(
    params?: GetUsersParams
  ): Promise<BackendPagedResult<BackendUserSummary>> {
    return usersService.searchUsers({
      ...params,
      role: params?.role || 'Alumni',
    })
  },

  /**
   * Fetch public profile of a specific alumni member.
   */
  async getAlumniProfile(userId: string): Promise<BackendPublicProfileResponse> {
    return usersService.getUserProfile(userId)
  },

  /**
   * Block an alumni member from interactions and search results.
   */
  async blockMember(userId: string): Promise<{ message: string }> {
    return usersService.blockUser(userId)
  },

  /**
   * Unblock a previously blocked alumni member.
   */
  async unblockMember(userId: string): Promise<{ message: string }> {
    return usersService.unblockUser(userId)
  },

  /**
   * Retrieve list of members blocked by current authenticated user.
   */
  async getBlockedMembers(): Promise<BackendBlockedUser[]> {
    return usersService.getBlockedUsers()
  },
}

export default alumniService
