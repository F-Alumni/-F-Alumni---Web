import { useAuthStore } from '@/stores/authStore'
import type { Permission } from '@/constants/permissions'
import { ROLES, type Role } from '@/constants/roles'
import { USER_TYPES } from '@/constants/userTypes'

export const usePermissions = () => {
  const { currentUser, role, userType, permissions, isAuthenticated } = useAuthStore()

  const hasPermission = (permission: Permission): boolean => {
    if (!isAuthenticated || !currentUser) return false
    if (role === ROLES.ADMIN) return true // Superuser grant
    return permissions.includes(permission)
  }

  const hasAnyPermission = (perms: Permission[]): boolean => {
    return perms.some((p) => hasPermission(p))
  }

  const hasRole = (allowedRoles: (Role | 'FACULTY')[]): boolean => {
    if (!isAuthenticated || !currentUser) return false
    if (role === ROLES.ADMIN) return true // Superuser bypass

    return allowedRoles.some((allowed) => {
      if (allowed === 'FACULTY') {
        return (
          role === ('FACULTY' as unknown as Role) ||
          (role === ROLES.USER && userType === USER_TYPES.FACULTY)
        )
      }
      return role === allowed
    })
  }

  const isVerifiedAlumni = (): boolean => {
    return userType === USER_TYPES.ALUMNI && Boolean(currentUser?.isVerified)
  }

  return {
    currentUser,
    role,
    userType,
    isAuthenticated,
    hasPermission,
    hasAnyPermission,
    hasRole,
    isVerifiedAlumni,
  }
}
