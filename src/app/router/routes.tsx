import type { RouteObject } from 'react-router-dom'
import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'
import { AdminLayout, AuthLayout, UserLayout } from '@/layouts'
import { LoginPage, ForgotPasswordPage } from '@/pages/auth'
import {
  DashboardPage,
  UsersManagementPage,
  ReportsManagementPage,
  AnalyticsPage,
  SettingsPage,
} from '@/pages/admin'
import { HomePage, AlumniPage, ChatPage, ProfilePage } from '@/pages/user'
import { LandingPage } from '@/pages/LandingPage'
import { ProtectedRoute, PublicRoute, RoleGuard, RootRedirect } from './guards'

/**
 * Application routing tree for FPT Alumni Community Platform.
 * Implements dual-layout routing: /admin/* (AdminLayout) and /app/* (UserLayout),
 * with granular role-based route guards and safe fallback redirection.
 */
export const routes: RouteObject[] = [
  // 1. Dynamic Root Redirect (Authenticated -> Role Destination | Guest -> LandingPage)
  {
    path: ROUTES.ROOT,
    element: <RootRedirect />,
  },
  // Dedicated Landing Page Route (Available for both Guests and Authenticated Review)
  {
    path: ROUTES.LANDING,
    element: <LandingPage />,
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
            element: <Navigate to={ROUTES.AUTH.LOGIN} replace />,
          },
          {
            path: 'verify-email',
            element: <Outlet />,
          },
          {
            path: 'forgot-password',
            element: <ForgotPasswordPage />,
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

  // 3. Web Administration & Governance Portal Section (/admin/*)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.ADMIN.ROOT,
        element: (
          <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR, 'FACULTY']}>
            <AdminLayout />
          </RoleGuard>
        ),
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />,
          },
          {
            path: 'dashboard',
            element: (
              <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR, 'FACULTY']}>
                <DashboardPage />
              </RoleGuard>
            ),
          },

          // Safety Governance & Moderation (Admin & Moderator)
          {
            path: 'reports',
            element: (
              <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]}>
                <ReportsManagementPage />
              </RoleGuard>
            ),
          },
          {
            path: 'users',
            element: (
              <RoleGuard allowedRoles={[ROLES.ADMIN, 'FACULTY']}>
                <UsersManagementPage />
              </RoleGuard>
            ),
          },
          {
            path: 'analytics',
            element: (
              <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                <AnalyticsPage />
              </RoleGuard>
            ),
          },
          {
            path: 'settings',
            element: (
              <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                <SettingsPage />
              </RoleGuard>
            ),
          },
          // Fallback redirects for obsolete routes
          {
            path: 'posts',
            element: <Navigate to={ROUTES.ADMIN.REPORTS} replace />,
          },
          {
            path: 'communities',
            element: <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />,
          },
          {
            path: 'opportunities',
            element: <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />,
          },
          {
            path: 'alumni-verification',
            element: <Navigate to={ROUTES.ADMIN.USERS} replace />,
          },
        ],
      },
    ],
  },

  // 4. End-User Community Portal Section (/app/*)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.APP.ROOT,
        element: <UserLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.APP.HOME} replace />,
          },
          {
            path: 'home',
            element: <HomePage />,
          },
          {
            path: 'alumni',
            element: <AlumniPage />,
          },
          {
            path: 'chat',
            element: <ChatPage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },

  // 5. Fallback Wildcard Route
  {
    path: '*',
    element: <RootRedirect />,
  },
]
