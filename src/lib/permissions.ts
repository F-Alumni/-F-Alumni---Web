import { PERMISSIONS } from '@/constants/permissions'
import { ROLES, type Role } from '@/constants/roles'
import { USER_TYPES } from '@/constants/userTypes'
import type { UserSummary } from '@/types/user.types'

/**
 * Computes granular permissions for a user profile according to the
 * Dual-Axis Role & Persona Harmonization Matrix.
 */
export const getPermissionsForUser = (user: UserSummary | null | undefined): string[] => {
  if (!user) return []

  // Superuser grant
  if (user.role === ROLES.ADMIN) {
    return Object.values(PERMISSIONS)
  }

  const perms = new Set<string>()

  // Standard user capabilities
  perms.add(PERMISSIONS.POSTS_CREATE)
  perms.add(PERMISSIONS.POSTS_EDIT_OWN)
  perms.add(PERMISSIONS.POSTS_DELETE_OWN)
  perms.add(PERMISSIONS.REPORTS_FILE)
  perms.add(PERMISSIONS.COMMUNITIES_JOIN)
  perms.add(PERMISSIONS.OPPORTUNITIES_VIEW)
  perms.add(PERMISSIONS.USERS_DIRECTORY_LOOKUP)

  // Moderator capabilities
  if (user.role === ROLES.MODERATOR) {
    perms.add(PERMISSIONS.REPORTS_READ_QUEUE)
    perms.add(PERMISSIONS.REPORTS_RESOLVE)
    perms.add(PERMISSIONS.REPORTS_VIEW_HISTORY)
    perms.add(PERMISSIONS.POSTS_MODERATE)
    perms.add(PERMISSIONS.USERS_READ)
    perms.add(PERMISSIONS.USERS_SUSPEND)
    perms.add(PERMISSIONS.OPPORTUNITIES_MODERATE)
  }

  // Persona capabilities
  if (user.userType === USER_TYPES.FACULTY) {
    perms.add(PERMISSIONS.COMMUNITIES_MANAGE_ASSIGNED)
    perms.add(PERMISSIONS.POSTS_PIN)
    perms.add(PERMISSIONS.OPPORTUNITIES_CREATE_ACADEMIC)
    perms.add(PERMISSIONS.MENTORSHIP_COORDINATE)
  } else if (user.userType === USER_TYPES.ALUMNI) {
    perms.add(PERMISSIONS.MENTORSHIP_OFFER)
    if (user.isVerified) {
      perms.add(PERMISSIONS.OPPORTUNITIES_CREATE_REFERRAL)
    } else {
      perms.add(PERMISSIONS.ALUMNI_VERIFY_SUBMIT)
    }
  } else if (user.userType === USER_TYPES.STUDENT) {
    perms.add(PERMISSIONS.OPPORTUNITIES_APPLY)
  }

  return Array.from(perms)
}

/**
 * Checks whether user has the requested role or persona.
 */
export const hasUserRole = (
  user: UserSummary | null | undefined,
  allowedRoles: (Role | 'FACULTY')[]
): boolean => {
  if (!user) return false
  if (user.role === ROLES.ADMIN) return true

  return allowedRoles.some((allowed) => {
    if (allowed === 'FACULTY') {
      return (
        user.role === ('FACULTY' as unknown as Role) ||
        (user.role === ROLES.USER && user.userType === USER_TYPES.FACULTY)
      )
    }
    return user.role === allowed
  })
}
