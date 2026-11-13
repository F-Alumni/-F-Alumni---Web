import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { ROLES } from '@/constants/roles'
import { AdminLayout, AuthLayout, UserLayout } from '@/layouts'
import { LoginPage, RegisterPage, ForgotPasswordPage, VerifyEmailPage } from '@/pages/auth'
import {
  DashboardPage,
  UsersManagementPage,
  PostsManagementPage,
  ReportsManagementPage,
  AnalyticsPage,
  SettingsPage,
  CommunitiesManagementPage,
  OpportunitiesManagementPage,
  AlumniVerificationPage,
} from '@/pages/admin'
import {
  HomePage,
  AlumniPage,
  ChatPage,
  ProfilePage,
  OpportunitiesPage,
  CommunitiesPage,
  NotificationsPage,
} from '@/pages/user'
import { LandingPage } from '@/pages/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
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
            element: <RegisterPage />,
          },
          {
            path: 'verify-email',
            element: <VerifyEmailPage />,
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
          // Forum & Content Moderation (AD-04, AD-05)
          {
            path: 'posts',
            element: (
              <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.MODERATOR]}>
                <PostsManagementPage />
              </RoleGuard>
            ),
          },
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
            path: 'alumni-verification',
            element: (
              <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                <AlumniVerificationPage />
              </RoleGuard>
            ),
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
            path: 'posts/:id',
            element: <HomePage />,
          },
          {
            path: 'posts/:postId',
            element: <HomePage />,
          },
          {
            path: 'communities',
            element: <CommunitiesPage />,
          },
          {
            path: 'alumni',
            element: <AlumniPage />,
          },
          {
            path: 'jobs',
            element: <OpportunitiesPage defaultTab="jobs" />,
          },
          {
            path: 'internships',
            element: <OpportunitiesPage defaultTab="internships" />,
          },
          {
            path: 'scholarships',
            element: <OpportunitiesPage defaultTab="scholarships" />,
          },
          {
            path: 'opportunities',
            element: <OpportunitiesPage defaultTab="all" />,
          },
          {
            path: 'chat',
            element: <ChatPage />,
          },
          {
            path: 'notifications',
            element: <NotificationsPage />,
          },
          {
            path: 'saved',
            element: <Navigate to="/app/profile?tab=bookmarks" replace />,
          },
          {
            path: 'ai',
            element: <Navigate to="/app/home?ai=open" replace />,
          },
          {
            path: 'settings',
            element: <Navigate to="/app/profile?tab=settings" replace />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
        ],
      },
    ],
  },

  // 5. Fallback Wildcard Route (Web 404 Not Found)
  {
    path: '*',
    element: <NotFoundPage />,
  },
]
