import type { RouteObject } from 'react-router-dom'
import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'
import { AdminLayout, AuthLayout, UserLayout } from '@/layouts'
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
import { HomePage, ProfilePage, AlumniPage, ChatPage } from '@/pages/user'
import { ProtectedRoute, PublicRoute, RoleGuard, RootRedirect } from './guards'

/**
 * Application routing tree for FPT Alumni Community Platform.
 * Implements dual-layout routing: /admin/* (AdminLayout) and /app/* (UserLayout),
 * with granular role-based route guards and safe fallback redirection.
 */
export const routes: RouteObject[] = [
  // 1. Dynamic Root Redirect (Authenticated -> Role Destination | Guest -> Login)
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
            path: 'posts',
            element: (
              <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]}>
                <PostsManagementPage />
              </RoleGuard>
            ),
          },

          // Academic Coordination & Chapters (Admin & Faculty)
          {
            path: 'communities',
            element: (
              <RoleGuard allowedRoles={[ROLES.ADMIN, 'FACULTY']}>
                <CommunitiesManagementPage />
              </RoleGuard>
            ),
          },
          {
            path: 'opportunities',
            element: (
              <RoleGuard allowedRoles={[ROLES.ADMIN, 'FACULTY']}>
                <OpportunitiesManagementPage />
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

          // System Administration Only (Admin)
          {
            path: 'alumni-verification',
            element: (
              <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                <AlumniVerificationPage />
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
        ],
      },
    ],
  },

  // 4. End-User Social & Academic Community Platform (/app/*)
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
            path: 'communities',
            element: <Outlet />,
          },
          {
            path: 'communities/:communityId',
            element: <Outlet />,
          },
          {
            path: 'posts/create',
            element: <Outlet />,
          },
          {
            path: 'posts/:postId',
            element: <Outlet />,
          },
          {
            path: 'alumni',
            element: <AlumniPage />,
          },
          {
            path: 'alumni/:userId',
            element: <Outlet />,
          },
          {
            path: 'jobs',
            element: <Outlet />,
          },
          {
            path: 'jobs/:jobId',
            element: <Outlet />,
          },
          {
            path: 'internships',
            element: <Outlet />,
          },
          {
            path: 'scholarships',
            element: <Outlet />,
          },
          {
            path: 'search',
            element: <Outlet />,
          },
          {
            path: 'chat',
            element: <ChatPage />,
          },
          {
            path: 'notifications',
            element: <Outlet />,
          },
          {
            path: 'ai',
            element: <Outlet />,
          },
          {
            path: 'saved',
            element: <Outlet />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'settings',
            element: <Outlet />,
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
