import { adminApiClient } from '@/services/api/apiClient'
import type {
  AdminDashboardSummary,
  ActivityTimelineItem,
  AdminUserSummary,
  AdminUserFilterQuery,
  SuspendUserPayload,
  UnsuspendUserPayload,
  ModerationReportItem,
  ModerationReportFilterQuery,
  ResolveReportPayload,
  DismissReportPayload,
  SystemAnnouncementItem,
  AnnouncementFilterQuery,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
  AuditLogItem,
  AuditLogFilterQuery,
  PagedResponse,
} from '@/types/admin.types'

/**
 * Helper to download Blob as a file with specified filename.
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

/**
 * Administrative operations service connecting to Admin Service & API Gateway.
 */
export const adminService = {
  // -------------------------------------------------------------------------
  // 1. Dashboard & Analytics Endpoints
  // -------------------------------------------------------------------------

  /**
   * AD-07: Get high-level KPI metrics summary for administrator dashboard.
   * GET /api/v1/admin/dashboard/summary
   */
  async getDashboardSummary(): Promise<AdminDashboardSummary> {
    const res = await adminApiClient.get<AdminDashboardSummary>(
      '/admin/dashboard/summary'
    )
    return res.data
  },

  /**
   * AD-07: Get activity timeline for the last N days.
   * GET /api/v1/admin/dashboard/activity-timeline?days=30
   */
  async getActivityTimeline(days = 30): Promise<ActivityTimelineItem[]> {
    const res = await adminApiClient.get<ActivityTimelineItem[]>(
      '/admin/dashboard/activity-timeline',
      { params: { days } }
    )
    return res.data
  },

  // -------------------------------------------------------------------------
  // 2. User Moderation Endpoints
  // -------------------------------------------------------------------------

  /**
   * AD-01 / AD-02: Search, filter, and paginate all system users.
   * GET /api/v1/admin/users
   */
  async getUsers(
    params?: AdminUserFilterQuery
  ): Promise<PagedResponse<AdminUserSummary>> {
    const res = await adminApiClient.get<PagedResponse<AdminUserSummary>>(
      '/admin/users',
      { params }
    )
    return res.data
  },

  /**
   * AD-02: Get detailed profile of a specific user by GUID.
   * GET /api/v1/admin/users/{id}
   */
  async getUserById(id: string): Promise<AdminUserSummary> {
    const res = await adminApiClient.get<AdminUserSummary>(`/admin/users/${id}`)
    return res.data
  },

  /**
   * AD-03: Suspend a user account with required reason and optional duration.
   * POST /api/v1/admin/users/{id}/suspend
   */
  async suspendUser(
    id: string,
    payload: SuspendUserPayload
  ): Promise<{ message: string; userId: string }> {
    const res = await adminApiClient.post<{ message: string; userId: string }>(
      `/admin/users/${id}/suspend`,
      payload
    )
    return res.data
  },

  /**
   * AD-04: Unsuspend / restore an active status to a suspended user account.
   * POST /api/v1/admin/users/{id}/unsuspend
   */
  async unsuspendUser(
    id: string,
    payload?: UnsuspendUserPayload
  ): Promise<{ message: string; userId: string }> {
    const res = await adminApiClient.post<{ message: string; userId: string }>(
      `/admin/users/${id}/unsuspend`,
      payload || {}
    )
    return res.data
  },

  // -------------------------------------------------------------------------
  // 3. Moderation Reports Endpoints
  // -------------------------------------------------------------------------

  /**
   * AD-05: Query and filter user reports against posts, comments, or users.
   * GET /api/v1/admin/moderation/reports
   */
  async getReports(
    params?: ModerationReportFilterQuery
  ): Promise<PagedResponse<ModerationReportItem>> {
    const res = await adminApiClient.get<PagedResponse<ModerationReportItem>>(
      '/admin/moderation/reports',
      { params }
    )
    return res.data
  },

  /**
   * AD-05: Get specific moderation report details by GUID.
   * GET /api/v1/admin/moderation/reports/{id}
   */
  async getReportById(id: string): Promise<ModerationReportItem> {
    const res = await adminApiClient.get<ModerationReportItem>(
      `/admin/moderation/reports/${id}`
    )
    return res.data
  },

  /**
   * AD-06: Resolve an incident report by taking action (ContentRemoved, UserSuspended, WarningIssued).
   * POST /api/v1/admin/moderation/reports/{id}/resolve
   */
  async resolveReport(
    id: string,
    payload: ResolveReportPayload
  ): Promise<{ message: string; reportId: string }> {
    const res = await adminApiClient.post<{ message: string; reportId: string }>(
      `/admin/moderation/reports/${id}/resolve`,
      payload
    )
    return res.data
  },

  /**
   * AD-06: Dismiss an invalid or false-positive incident report.
   * POST /api/v1/admin/moderation/reports/{id}/dismiss
   */
  async dismissReport(
    id: string,
    payload: DismissReportPayload
  ): Promise<{ message: string; reportId: string }> {
    const res = await adminApiClient.post<{ message: string; reportId: string }>(
      `/admin/moderation/reports/${id}/dismiss`,
      payload
    )
    return res.data
  },

  // -------------------------------------------------------------------------
  // 4. System Announcements Endpoints
  // -------------------------------------------------------------------------

  /**
   * AD-08: Get paginated system-wide announcements.
   * GET /api/v1/admin/announcements
   */
  async getAnnouncements(
    params?: AnnouncementFilterQuery
  ): Promise<PagedResponse<SystemAnnouncementItem>> {
    const res = await adminApiClient.get<PagedResponse<SystemAnnouncementItem>>(
      '/admin/announcements',
      { params }
    )
    return res.data
  },

  /**
   * AD-08: Get specific announcement details by ID.
   * GET /api/v1/admin/announcements/{id}
   */
  async getAnnouncementById(id: string): Promise<SystemAnnouncementItem> {
    const res = await adminApiClient.get<SystemAnnouncementItem>(
      `/admin/announcements/${id}`
    )
    return res.data
  },

  /**
   * AD-08: Create and publish a new system announcement.
   * POST /api/v1/admin/announcements
   */
  async createAnnouncement(
    payload: CreateAnnouncementPayload
  ): Promise<SystemAnnouncementItem> {
    const res = await adminApiClient.post<SystemAnnouncementItem>(
      '/admin/announcements',
      payload
    )
    return res.data
  },

  /**
   * AD-08: Update an existing system announcement.
   * PUT /api/v1/admin/announcements/{id}
   */
  async updateAnnouncement(
    id: string,
    payload: UpdateAnnouncementPayload
  ): Promise<SystemAnnouncementItem> {
    const res = await adminApiClient.put<SystemAnnouncementItem>(
      `/admin/announcements/${id}`,
      payload
    )
    return res.data
  },

  /**
   * AD-08: Delete an announcement permanently.
   * DELETE /api/v1/admin/announcements/{id}
   */
  async deleteAnnouncement(id: string): Promise<void> {
    await adminApiClient.delete(`/admin/announcements/${id}`)
  },

  // -------------------------------------------------------------------------
  // 5. Audit Logs Endpoints
  // -------------------------------------------------------------------------

  /**
   * AD-09: Query security audit log records with filters.
   * GET /api/v1/admin/audit-logs
   */
  async getAuditLogs(
    params?: AuditLogFilterQuery
  ): Promise<PagedResponse<AuditLogItem>> {
    const res = await adminApiClient.get<PagedResponse<AuditLogItem>>(
      '/admin/audit-logs',
      { params }
    )
    return res.data
  },

  /**
   * AD-09: Get most recent administrative audit logs.
   * GET /api/v1/admin/audit-logs/recent?count=10
   */
  async getRecentAuditLogs(count = 10): Promise<AuditLogItem[]> {
    const res = await adminApiClient.get<AuditLogItem[]>(
      '/admin/audit-logs/recent',
      { params: { count } }
    )
    return res.data
  },

  /**
   * AD-09: Get specific audit log entry by GUID.
   * GET /api/v1/admin/audit-logs/{id}
   */
  async getAuditLogById(id: string): Promise<AuditLogItem> {
    const res = await adminApiClient.get<AuditLogItem>(`/admin/audit-logs/${id}`)
    return res.data
  },

  // -------------------------------------------------------------------------
  // 6. CSV Export Endpoints
  // -------------------------------------------------------------------------

  /**
   * Export audit log records into a downloadable CSV file.
   * GET /api/v1/admin/export/audit-logs
   */
  async exportAuditLogs(params?: AuditLogFilterQuery): Promise<void> {
    const res = await adminApiClient.get('/admin/export/audit-logs', {
      params,
      responseType: 'blob',
    })
    const dateStr = new Date().toISOString().slice(0, 10)
    downloadBlob(
      new Blob([res.data], { type: 'text/csv;charset=utf-8;' }),
      `fpt_audit_logs_${dateStr}.csv`
    )
  },

  /**
   * Export user accounts summary into a downloadable CSV file.
   * GET /api/v1/admin/export/users-summary
   */
  async exportUsersSummary(params?: AdminUserFilterQuery): Promise<void> {
    const res = await adminApiClient.get('/admin/export/users-summary', {
      params,
      responseType: 'blob',
    })
    const dateStr = new Date().toISOString().slice(0, 10)
    downloadBlob(
      new Blob([res.data], { type: 'text/csv;charset=utf-8;' }),
      `fpt_users_summary_${dateStr}.csv`
    )
  },
}
