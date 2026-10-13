/**
 * Centralized Permission Constants & Capability Tokens.
 * Decouples role checks from action-level authorization.
 */

export const PERMISSIONS = {
  // 1. User & Account Management
  USERS_READ: 'users:read',
  USERS_SUSPEND: 'users:suspend',
  USERS_CHANGE_ROLE: 'users:change_role',
  USERS_DIRECTORY_LOOKUP: 'users:directory_lookup',

  // 2. Alumni Verification
  ALUMNI_VERIFY_READ: 'alumni:verify_read',
  ALUMNI_VERIFY_APPROVE: 'alumni:verify_approve',
  ALUMNI_VERIFY_REJECT: 'alumni:verify_reject',
  ALUMNI_VERIFY_SUBMIT: 'alumni:verify_submit',

  // 3. Post & Discussion Management
  POSTS_CREATE: 'posts:create',
  POSTS_EDIT_OWN: 'posts:edit_own',
  POSTS_DELETE_OWN: 'posts:delete_own',
  POSTS_MODERATE: 'posts:moderate', // Hide, suppress, or delete violating posts
  POSTS_PIN: 'posts:pin',           // Pin official announcement in community

  // 4. Moderation & Safety Reports
  REPORTS_READ_QUEUE: 'reports:read_queue',
  REPORTS_RESOLVE: 'reports:resolve',       // Sanction content, warn user, dismiss
  REPORTS_VIEW_HISTORY: 'reports:view_history',
  REPORTS_FILE: 'reports:file',             // Standard user filing report

  // 5. Community Chapter Governance
  COMMUNITIES_CREATE: 'communities:create',
  COMMUNITIES_MANAGE_ALL: 'communities:manage_all',
  COMMUNITIES_MANAGE_ASSIGNED: 'communities:manage_assigned', // Faculty coordinating department
  COMMUNITIES_JOIN: 'communities:join',

  // 6. Opportunities & Career
  OPPORTUNITIES_VIEW: 'opportunities:view',
  OPPORTUNITIES_CREATE_REFERRAL: 'opportunities:create_referral', // Verified alumni
  OPPORTUNITIES_CREATE_ACADEMIC: 'opportunities:create_academic', // Faculty capstones/fellowships
  OPPORTUNITIES_MODERATE: 'opportunities:moderate',               // Admin/mod approve/close
  OPPORTUNITIES_APPLY: 'opportunities:apply',

  // 7. Mentorship Coordination
  MENTORSHIP_COORDINATE: 'mentorship:coordinate', // Faculty scheduling department office hours
  MENTORSHIP_OFFER: 'mentorship:offer',           // Alumni accepting mentees

  // 8. System & Insights
  ANALYTICS_VIEW: 'analytics:view',
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_MANAGE: 'settings:manage',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
