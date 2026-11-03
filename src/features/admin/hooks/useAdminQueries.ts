import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminService } from '@/services/admin'
import type {
  AdminUserFilterQuery,
  SuspendUserPayload,
  UnsuspendUserPayload,
  ModerationReportFilterQuery,
  ResolveReportPayload,
  DismissReportPayload,
  AnnouncementFilterQuery,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
  AuditLogFilterQuery,
} from '@/types/admin.types'

// ---------------------------------------------------------------------------
// 1. Dashboard & Timeline Hooks
// ---------------------------------------------------------------------------

export function useAdminDashboardSummary() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'summary'],
    queryFn: () => adminService.getDashboardSummary(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

export function useAdminActivityTimeline(days = 30) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'timeline', days],
    queryFn: () => adminService.getActivityTimeline(days),
    staleTime: 60 * 1000,
  })
}

// ---------------------------------------------------------------------------
// 2. User Moderation Hooks
// ---------------------------------------------------------------------------

export function useAdminUsers(params?: AdminUserFilterQuery) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminService.getUsers(params),
    staleTime: 20 * 1000,
  })
}

export function useAdminUserDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => adminService.getUserById(id),
    enabled: Boolean(id),
  })
}

export function useSuspendUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SuspendUserPayload }) =>
      adminService.suspendUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
  })
}

export function useUnsuspendUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: UnsuspendUserPayload }) =>
      adminService.unsuspendUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
  })
}

// ---------------------------------------------------------------------------
// 3. Moderation Reports Hooks
// ---------------------------------------------------------------------------

export function useAdminReports(params?: ModerationReportFilterQuery) {
  return useQuery({
    queryKey: ['admin', 'reports', params],
    queryFn: () => adminService.getReports(params),
    staleTime: 20 * 1000,
  })
}

export function useResolveReportMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResolveReportPayload }) =>
      adminService.resolveReport(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
  })
}

export function useDismissReportMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DismissReportPayload }) =>
      adminService.dismissReport(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
  })
}

// ---------------------------------------------------------------------------
// 4. Announcements Hooks
// ---------------------------------------------------------------------------

export function useAdminAnnouncements(params?: AnnouncementFilterQuery) {
  return useQuery({
    queryKey: ['admin', 'announcements', params],
    queryFn: () => adminService.getAnnouncements(params),
    staleTime: 30 * 1000,
  })
}

export function useCreateAnnouncementMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAnnouncementPayload) =>
      adminService.createAnnouncement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
  })
}

export function useUpdateAnnouncementMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAnnouncementPayload }) =>
      adminService.updateAnnouncement(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
    },
  })
}

export function useDeleteAnnouncementMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminService.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
  })
}

// ---------------------------------------------------------------------------
// 5. Audit Logs Hooks
// ---------------------------------------------------------------------------

export function useAdminAuditLogs(params?: AuditLogFilterQuery) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => adminService.getAuditLogs(params),
    staleTime: 20 * 1000,
  })
}

export function useRecentAuditLogs(count = 10) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', 'recent', count],
    queryFn: () => adminService.getRecentAuditLogs(count),
    staleTime: 20 * 1000,
  })
}
