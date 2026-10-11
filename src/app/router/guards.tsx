import type { FC } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'

/**
 * Route guard for authenticated areas (/app/*, /admin/*).
 * Redirects unauthenticated visitors directly to the Login page.
 */
export const ProtectedRoute: FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />
  }

  return <Outlet />
}

/**
 * Route guard for guest-only areas (/auth/*).
 * Redirects already authenticated users away from Login/Register into Home Feed.
 */
export const PublicRoute: FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to={ROUTES.APP.HOME} replace />
  }

  return <Outlet />
}

/**
 * Dynamic Root Redirector (for path "/").
 * Automatically directs authenticated users to Home Feed and unauthenticated guests to Login.
 */
export const RootRedirect: FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return <Navigate to={isAuthenticated ? ROUTES.APP.HOME : ROUTES.AUTH.LOGIN} replace />
}
