import type { FC, ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'
import { ROLES, type Role } from '@/constants/roles'
import { USER_TYPES, type UserType } from '@/constants/userTypes'

/**
 * 1. ProtectedRoute: Base guard requiring user authentication.
 * Redirects unauthenticated visitors to login, preserving intended path.
 */
export const ProtectedRoute: FC = () => {
  const location = useLocation()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}

/**
 * 2. PublicRoute: Guest-only route guard (e.g. login, register).
 * Redirects already authenticated actors to their respective home portal:
 * Admin/Moderator to /admin/dashboard, Faculty/Student/Alumni to /app/home.
 */
export const PublicRoute: FC = () => {
  const { isAuthenticated, role } = useAuthStore()

  if (isAuthenticated) {
    if (role === ROLES.ADMIN || role === ROLES.MODERATOR) {
      return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />
    }
    return <Navigate to={ROUTES.APP.HOME} replace />
  }

  return <Outlet />
}

/**
 * 3. RoleGuard: Enforces role-based or user-type authorization.
 * Supports technical roles (ADMIN, MODERATOR, USER) and university personas (FACULTY).
 * Unauthorized redirection:
 * - Admin / Moderator redirected safely to /admin/dashboard
 * - Faculty / Student / Alumni redirected safely to /app/home
 */
export interface RoleGuardProps {
  allowedRoles?: (Role | 'FACULTY')[]
  allowedUserTypes?: UserType[]
  fallbackPath?: string
  children?: ReactNode
}

export const RoleGuard: FC<RoleGuardProps> = ({
  allowedRoles,
  allowedUserTypes,
  fallbackPath,
  children,
}) => {
  const { isAuthenticated, role, userType } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />
  }

  // Superuser bypass: ADMIN has access to all administrative routes
  if (role === ROLES.ADMIN) {
    return children ? <>{children}</> : <Outlet />
  }

  let isAllowed = true

  if (allowedRoles && allowedRoles.length > 0) {
    const roleMatches = allowedRoles.some((r) => {
      if (r === 'FACULTY') {
        return (
          role === ('FACULTY' as unknown as Role) ||
          (role === ROLES.USER && userType === USER_TYPES.FACULTY)
        )
      }
      return role === r
    })
    if (!roleMatches) {
      isAllowed = false
    }
  }

  if (isAllowed && allowedUserTypes && allowedUserTypes.length > 0) {
    const typeMatches = Boolean(userType && allowedUserTypes.includes(userType))
    if (!typeMatches) {
      isAllowed = false
    }
  }

  if (!isAllowed) {
    const defaultFallback =
      role === ROLES.MODERATOR
        ? ROUTES.ADMIN.DASHBOARD
        : ROUTES.APP.HOME

    return <Navigate to={fallbackPath || defaultFallback} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

/**
 * 4. RootRedirect: Dynamic landing page router for path "/".
 * Unauthenticated -> /auth/login
 * Admin / Moderator -> /admin/dashboard
 * Faculty / Student / Alumni -> /app/home
 */
export const RootRedirect: FC = () => {
  const { isAuthenticated, role } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />
  }

  if (role === ROLES.ADMIN || role === ROLES.MODERATOR) {
    return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />
  }

  return <Navigate to={ROUTES.APP.HOME} replace />
}
