import type { RouteObject } from 'react-router-dom'
import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { AdminLayout, AuthLayout } from '@/layouts'
import { LoginPage, RegisterPage } from '@/pages/auth'
import {
  DashboardPage,
  UsersManagementPage,
  AlumniVerificationPage,
  CommunitiesManagementPage,
  PostsManagementPage,
  OpportunitiesManagementPage,
  ReportsManagementPage,
  AnalyticsPage,
  SettingsPage,
} from '@/pages/admin'
import { ProtectedRoute, PublicRoute, RootRedirect } from './guards'

/**
 * Application routing tree for FPT Alumni Administration Portal.
 * Enforces admin layout structure, route guards, and governance management modules.
 */
export const routes: RouteObject[] = [
  // 1. Dynamic Root Redirect (Authenticated -> Admin Dashboard | Guest -> Login)
  {
    path: ROUTES.ROOT,
    element: <RootRedirect />,
  },

  // 2. Authentication Section (/auth/* & /admin/login)
  {
    element: <PublicRoute />,
    children: [
      {
        path: ROUTES.AUTH.ROOT,
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.AUTH.LOGIN} replace />,
          },
          {
            path: 'login',
            element: <LoginPage />,
          },
          {
            path: 'register',
            element: <RegisterPage />,
          },
          {
            path: 'verify-email',
            element: <Outlet />,
          },
          {
            path: 'forgot-password',
            element: <Outlet />,
          },
        ],
      },
      // Convenience alias for /admin/login
      {
        path: '/admin/login',
        element: <Navigate to={ROUTES.AUTH.LOGIN} replace />,
      },
    ],
  },

  // 3. Web Administration Portal Section (/admin/*)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.ADMIN.ROOT,
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />,
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          },
          {
            path: 'users',
            element: <UsersManagementPage />,
          },
          {
            path: 'alumni-verification',
            element: <AlumniVerificationPage />,
          },
          {
            path: 'communities',
            element: <CommunitiesManagementPage />,
          },
          {
            path: 'posts',
            element: <PostsManagementPage />,
          },
          {
            path: 'opportunities',
            element: <OpportunitiesManagementPage />,
          },
          {
            path: 'reports',
            element: <ReportsManagementPage />,
          },
          {
            path: 'analytics',
            element: <AnalyticsPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },

  // 4. Legacy End-User App Routes Redirect
  // (Student/Alumni mobile app scope redirects to Admin Dashboard on web)
  {
    path: `${ROUTES.APP.ROOT}/*`,
    element: <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />,
  },

  // 5. Fallback Wildcard Route
  {
    path: '*',
    element: <RootRedirect />,
  },
]
