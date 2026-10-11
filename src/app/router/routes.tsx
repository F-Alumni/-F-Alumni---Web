import type { RouteObject } from 'react-router-dom'
import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { AdminLayout, AuthLayout, UserLayout } from '@/layouts'
import { HomePage } from '@/pages/user'
import { LoginPage, RegisterPage } from '@/pages/auth'
import { ProtectedRoute, PublicRoute, RootRedirect } from './guards'

/**
 * Application routing tree with authentication guards.
 * Unauthenticated users are strictly guarded from entering application feeds.
 */
export const routes: RouteObject[] = [
  // Root Redirect (Dynamic based on auth status)
  {
    path: ROUTES.ROOT,
    element: <RootRedirect />,
  },

  // Guest Only Auth Section (/auth/*)
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
    ],
  },

  // Student & Alumni Main Protected Application Section (/app/*)
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
            element: <Outlet />,
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
            path: 'scholarships/:scholarshipId',
            element: <Outlet />,
          },
          {
            path: 'search',
            element: <Outlet />,
          },
          {
            path: 'chat',
            element: <Outlet />,
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
            element: <Outlet />,
          },
          {
            path: 'settings',
            element: <Outlet />,
          },
        ],
      },
    ],
  },

  // Admin Section (/admin/*)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.ADMIN.ROOT,
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Outlet />,
          },
          {
            path: 'users',
            element: <Outlet />,
          },
          {
            path: 'alumni-verification',
            element: <Outlet />,
          },
          {
            path: 'communities',
            element: <Outlet />,
          },
          {
            path: 'posts',
            element: <Outlet />,
          },
          {
            path: 'opportunities',
            element: <Outlet />,
          },
          {
            path: 'reports',
            element: <Outlet />,
          },
          {
            path: 'analytics',
            element: <Outlet />,
          },
          {
            path: 'settings',
            element: <Outlet />,
          },
        ],
      },
    ],
  },

  // Fallback Wildcard Route
  {
    path: '*',
    element: <RootRedirect />,
  },
]
