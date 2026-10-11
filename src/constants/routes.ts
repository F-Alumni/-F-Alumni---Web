/**
 * Centralized Application Route Constants.
 * Defines all route paths for auth, user/app, and admin sections.
 */

export const ROUTES = {
  // Root
  ROOT: '/',

  // Auth routes (/auth/*)
  AUTH: {
    ROOT: '/auth',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },

  // Main application routes (/app/*)
  APP: {
    ROOT: '/app',
    HOME: '/app/home',
    COMMUNITIES: '/app/communities',
    COMMUNITY_DETAIL: '/app/communities/:communityId',
    POSTS_CREATE: '/app/posts/create',
    POST_DETAIL: '/app/posts/:postId',
    ALUMNI: '/app/alumni',
    ALUMNI_PROFILE: '/app/alumni/:userId',
    JOBS: '/app/jobs',
    JOB_DETAIL: '/app/jobs/:jobId',
    INTERNSHIPS: '/app/internships',
    SCHOLARSHIPS: '/app/scholarships',
    SCHOLARSHIP_DETAIL: '/app/scholarships/:scholarshipId',
    SEARCH: '/app/search',
    CHAT: '/app/chat',
    NOTIFICATIONS: '/app/notifications',
    AI: '/app/ai',
    SAVED: '/app/saved',
    PROFILE: '/app/profile',
    SETTINGS: '/app/settings',
  },

  // Admin routes (/admin/*)
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    ALUMNI_VERIFICATION: '/admin/alumni-verification',
    COMMUNITIES: '/admin/communities',
    POSTS: '/admin/posts',
    OPPORTUNITIES: '/admin/opportunities',
    REPORTS: '/admin/reports',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
  },
} as const
