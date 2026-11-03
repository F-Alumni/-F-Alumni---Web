/**
 * Admin Service domain types & DTO contracts.
 * Matches backend contracts from f-alumni-admin-service, f-alumni-user-service, and f-alumni-forum-service.
 */

export interface PagedResponse<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

// ---------------------------------------------------------------------------
// 1. Dashboard DTOs
// ---------------------------------------------------------------------------

export interface AdminDashboardSummary {
  totalUsers: number
  activeUsers: number
  suspendedUsers: number
  pendingReports: number
  publishedAnnouncements: number
  totalAuditLogsCount: number
  recentActivityFeed: AuditLogItem[]
  timestamp: string
}

export interface ActivityTimelineItem {
  date: string
  totalActions: number
  actionBreakdown: Record<string, number>
}

// ---------------------------------------------------------------------------
// 2. User Moderation DTOs
// ---------------------------------------------------------------------------

export interface AdminUserSummary {
  id: string
  email: string
  fullName: string
  role: string // USER, ADMIN
  accountType: string // Student, Alumni, Admin
  status: string // PendingVerification, Active, Suspended
  suspensionReason?: string | null
  emailVerified: boolean
  createdAtUtc: string
  displayName?: string | null
  avatarUrl?: string | null
  studentCode?: string | null
  major?: string | null
  campus?: string | null
  currentCompany?: string | null
  jobTitle?: string | null
  batch?: string | null
  studentId?: string | null
  lastLoginAtUtc?: string | null
  suspendedUntilUtc?: string | null
}

export interface SuspendUserPayload {
  reason: string
  durationDays?: number | null
}

export interface UnsuspendUserPayload {
  reason?: string | null
}

export interface AdminUserFilterQuery {
  search?: string
  campus?: string
  major?: string
  graduationYear?: number
  company?: string
  status?: string
  role?: string
  pageNumber?: number
  pageSize?: number
}

// ---------------------------------------------------------------------------
// 3. Moderation Reports DTOs
// ---------------------------------------------------------------------------

export interface ModerationReportItem {
  id: string
  reporterUserId: string
  reporterEmail: string
  targetType: string // Post, Comment, User
  targetId: string
  reason: string
  details?: string | null
  status: 'Pending' | 'Resolved' | 'Dismissed' | string
  resolvedByAdminId?: string | null
  resolutionNotes?: string | null
  resolvedAtUtc?: string | null
  createdAtUtc: string
}

export interface ResolveReportPayload {
  actionTaken: string // ContentRemoved, UserSuspended, WarningIssued
  resolutionNotes: string
  deleteTargetContent?: boolean
}

export interface DismissReportPayload {
  dismissalReason: string
}

export interface ModerationReportFilterQuery {
  status?: string
  targetType?: string
  pageNumber?: number
  pageSize?: number
}

// ---------------------------------------------------------------------------
// 4. Announcements DTOs
// ---------------------------------------------------------------------------

export interface SystemAnnouncementItem {
  id: string
  title: string
  content: string
  type: string // General, Urgent, Academic, Event, Maintenance
  priority: string // Normal, High, Urgent
  createdByAdminId: string
  createdByAdminEmail: string
  isPublished: boolean
  publishedAtUtc?: string | null
  expiresAtUtc?: string | null
  createdAtUtc: string
  updatedAtUtc?: string | null
}

export interface CreateAnnouncementPayload {
  title: string
  content: string
  type?: string
  priority?: string
  isPublished?: boolean
  expiresAtUtc?: string | null
}

export interface UpdateAnnouncementPayload {
  title?: string
  content?: string
  type?: string
  priority?: string
  isPublished?: boolean
  expiresAtUtc?: string | null
}

export interface AnnouncementFilterQuery {
  includeUnpublished?: boolean
  type?: string
  pageNumber?: number
  pageSize?: number
}

// ---------------------------------------------------------------------------
// 5. Audit Log DTOs
// ---------------------------------------------------------------------------

export interface AuditLogItem {
  id: string
  adminUserId: string
  adminEmail: string
  action: string
  targetEntity: string
  targetId: string
  reason?: string | null
  details?: string | null
  ipAddress?: string | null
  createdAtUtc: string
}

export interface AuditLogFilterQuery {
  action?: string
  targetEntity?: string
  adminUserId?: string
  fromDate?: string
  toDate?: string
  pageNumber?: number
  pageSize?: number
}
