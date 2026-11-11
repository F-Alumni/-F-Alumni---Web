import { useState, useCallback, type FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  IconSchool,
  IconUserCheck,
  IconClockHour4,
  IconAlertTriangle,
  IconArticle,
  IconBriefcase,
  IconBuildingCommunity,
  IconArrowRight,
  IconEye,
  IconRefresh,
  IconCircleCheck,
  IconShieldCheck,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader, StatCard, StatusBadge, DataTable, type Column } from '@/components/admin'
import { ROUTES } from '@/constants/routes'
import {
  useAdminDashboardSummary,
  useAdminReports,
  useResolveReportMutation,
} from '@/features/admin'

export interface PendingReviewItem {
  id: string
  item: string
  details: string
  type: 'ALUMNI_VERIFY' | 'REPORTED_CONTENT' | 'OPPORTUNITY_REVIEW' | 'NEW_COMMUNITY'
  submittedBy: string
  submittedDate: string
  status: 'pending' | 'urgent'
  targetRoute: string
  rawReportId?: string
}

export const DashboardPage: FC = () => {
  const navigate = useNavigate()

  // 1. Live Backend TanStack Query Hooks
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useAdminDashboardSummary()

  const {
    data: reportsData,
    isLoading: isReportsLoading,
    refetch: refetchReports,
  } = useAdminReports({ status: 'Pending', pageSize: 15 })

  const resolveReportMutation = useResolveReportMutation()

  // State management
  const [activeCategory, setActiveCategory] = useState<string>('ALL')
  const [resolvedIds, setResolvedIds] = useState<string[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)

  // Map real backend moderation reports into dashboard pending queue
  const backendPendingReports: PendingReviewItem[] = (reportsData?.items || []).map((r) => ({
    id: `REP-${r.id.slice(0, 8)}`,
    rawReportId: r.id,
    item: `Report #${r.targetId.slice(0, 8)} (${r.targetType}) - ${r.reason}`,
    details: r.details || `Flagged for: ${r.reason}`,
    type: 'REPORTED_CONTENT' as const,
    submittedBy: r.reporterEmail || 'Community Member',
    submittedDate: r.createdAtUtc ? new Date(r.createdAtUtc).toLocaleString('vi-VN') : 'Vừa xong',
    status: 'urgent' as const,
    targetRoute: ROUTES.ADMIN.REPORTS,
  }))

  // Combined active reviews from live backend reports
  const allCombinedReviews = backendPendingReports
  const activeReviews = allCombinedReviews.filter((item) => !resolvedIds.includes(item.id))

  const filteredReviews =
    activeCategory === 'ALL'
      ? activeReviews
      : activeReviews.filter((item) => item.type === activeCategory)

  // Counts for reports
  const reportsCount = activeReviews.length

  // Quick data reload calling both backend queries
  const handleRefresh = useCallback(async () => {
    setIsManualRefreshing(true)
    try {
      await Promise.allSettled([refetchSummary(), refetchReports()])
      setToastMessage('Dashboard metrics synchronized successfully with live backend.')
    } finally {
      setIsManualRefreshing(false)
      setTimeout(() => setToastMessage(null), 3500)
    }
  }, [refetchReports, refetchSummary])

  // Quick resolve action on the dashboard
  const handleQuickResolve = async (item: PendingReviewItem) => {
    setResolvedIds((prev) => [...prev, item.id])

    if (item.rawReportId) {
      try {
        await resolveReportMutation.mutateAsync({
          id: item.rawReportId,
          payload: {
            actionTaken: 'WarningIssued',
            resolutionNotes: 'Resolved directly from Admin Dashboard review queue.',
            deleteTargetContent: false,
          },
        })
      } catch (err) {
        console.warn('Backend resolve report mutation notice:', err)
      }
    }

    setToastMessage(`Item "${item.item}" processed and archived from pending review queue.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Pending Reviews DataTable columns
  const reviewColumns: Column<PendingReviewItem>[] = [
    {
      key: 'item',
      header: 'Pending Item & Details',
      className: 'min-w-[280px]',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 line-clamp-1">{item.item}</span>
          <span className="text-[11px] text-slate-500 line-clamp-1">{item.details}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Submitted by: {item.submittedBy}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Category',
      className: 'text-center w-44',
      render: (item) => {
        const types = {
          ALUMNI_VERIFY: {
            label: 'Alumni Verification',
            icon: IconUserCheck,
            style: 'text-brand-secondary bg-sky-50 border-sky-200',
          },
          REPORTED_CONTENT: {
            label: 'Content Moderation',
            icon: IconAlertTriangle,
            style: 'text-rose-600 bg-rose-50 border-rose-200',
          },
          OPPORTUNITY_REVIEW: {
            label: 'Opportunity Review',
            icon: IconBriefcase,
            style: 'text-amber-700 bg-amber-50 border-amber-200',
          },
          NEW_COMMUNITY: {
            label: 'Community Request',
            icon: IconBuildingCommunity,
            style: 'text-brand-accent bg-emerald-50 border-emerald-200',
          },
        }
        const config = types[item.type]
        const Icon = config.icon
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold ${config.style}`}
          >
            <Icon size={14} stroke={1.8} className="shrink-0" />
            <span>{config.label}</span>
          </span>
        )
      },
    },
    {
      key: 'submittedDate',
      header: 'Submission Date',
      className: 'text-center w-36',
      render: (item) => (
        <span className="inline-flex items-center gap-1 text-slate-500 font-mono text-[11px]">
          <IconClockHour4 size={14} stroke={1.8} className="text-slate-400 shrink-0" />
          <span>{item.submittedDate}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'text-center w-36',
      render: (item) => (
        <div className="flex items-center justify-center">
          <StatusBadge
            status={item.status}
            label={item.status === 'urgent' ? 'Urgent' : 'Pending'}
          />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right w-44',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(item.targetRoute)}
            className="h-7 text-xs border-slate-200 hover:border-brand-primary hover:text-brand-primary"
            title="Open comprehensive review workspace"
          >
            <IconEye size={14} stroke={1.8} className="mr-1" />
            <span>Review</span>
          </Button>

          <Button
            size="sm"
            onClick={() => handleQuickResolve(item)}
            className="h-7 text-xs bg-emerald-50 text-brand-accent hover:bg-brand-accent hover:text-white border border-emerald-200 transition-colors"
            title="Mark as verified/resolved"
          >
            <IconCircleCheck size={14} stroke={1.8} className="mr-1" />
            <span>Resolve</span>
          </Button>
        </div>
      ),
    },
  ]

  // Dynamic route for View All link
  const getViewAllRoute = () => {
    return { label: 'View all moderation reports', route: ROUTES.ADMIN.REPORTS }
  }

  const viewAllInfo = getViewAllRoute()
  const isGlobalLoading = isSummaryLoading || isManualRefreshing

  // Dynamic Metrics computed from live backend (0 when no data)
  const totalUsersDisplay = summary?.totalUsers !== undefined ? summary.totalUsers.toLocaleString() : '0'
  const activeAlumniDisplay = summary?.activeUsers !== undefined ? summary.activeUsers.toLocaleString() : '0'
  const pendingReportsCount = summary?.pendingReports ?? reportsCount
  const announcementsCount = summary?.publishedAnnouncements !== undefined ? summary.publishedAnnouncements.toLocaleString() : '0'
  const auditLogsCount = summary?.totalAuditLogsCount !== undefined ? summary.totalAuditLogsCount.toLocaleString() : '0'
  const suspendedCount = summary?.suspendedUsers !== undefined ? summary.suspendedUsers.toLocaleString() : '0'

  return (
    <div className="space-y-6">
      {/* Feedback Toast Notification */}
      {toastMessage && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <IconCircleCheck size={16} stroke={1.8} className="text-brand-accent shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-4"
          >
            ×
          </button>
        </div>
      )}

      {/* Error State Banner */}
      {isSummaryError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <IconAlertTriangle size={16} stroke={1.8} className="text-rose-600 shrink-0" />
            <span>Không thể kết nối đến backend microservices. Vui lòng kiểm tra API Gateway hoặc đăng nhập lại.</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="h-7 border-rose-300 text-rose-700 bg-white hover:bg-rose-100"
          >
            <IconRefresh size={14} stroke={1.8} className="mr-1" />
            <span>Retry Connection</span>
          </Button>
        </div>
      )}

      {/* 1. Page Header */}
      <PageHeader
        title="Dashboard"
        description="Monitor and manage your university alumni community operations."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isGlobalLoading}
              className="h-9 rounded-lg border-slate-200 text-slate-700 hover:border-brand-primary hover:text-brand-primary"
            >
              <IconRefresh
                size={14}
                stroke={1.8}
                className={`mr-1.5 ${isGlobalLoading ? 'animate-spin' : ''}`}
              />
              <span>Refresh Data</span>
            </Button>

            <Link to={ROUTES.ADMIN.ALUMNI_VERIFICATION}>
              <Button className="h-9 rounded-lg bg-brand-primary px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-primary-hover">
                <IconUserCheck size={16} stroke={1.8} className="mr-1.5" />
                <span>Verify Alumni</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* 2. System Metrics & Governance Overview */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconShieldCheck size={16} stroke={1.8} className="text-brand-secondary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              System Metrics & Governance Overview
            </h2>
          </div>
          <span className="text-[11px] font-medium text-slate-400">Live Backend Metrics</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Users"
            value={totalUsersDisplay}
            description="Registered accounts in system"
            icon={<IconSchool size={20} stroke={1.8} />}
            variant="secondary"
            isLoading={isSummaryLoading}
          />

          <StatCard
            title="Active Users"
            value={activeAlumniDisplay}
            description="Active accounts without restriction"
            icon={<IconUserCheck size={20} stroke={1.8} />}
            variant="accent"
            isLoading={isSummaryLoading}
          />

          <StatCard
            title="Suspended Accounts"
            value={suspendedCount}
            description="Restricted user accounts"
            icon={<IconAlertTriangle size={20} stroke={1.8} />}
            variant="neutral"
            isLoading={isSummaryLoading}
          />

          <StatCard
            title="Pending Reports"
            value={pendingReportsCount}
            description="Content flags awaiting decision"
            icon={<IconAlertTriangle size={20} stroke={1.8} />}
            variant="primary"
            isLoading={isReportsLoading}
          />

          <StatCard
            title="Published Announcements"
            value={announcementsCount}
            description="Official system announcements broadcasted"
            icon={<IconArticle size={20} stroke={1.8} />}
            variant="secondary"
            isLoading={isSummaryLoading}
          />

          <StatCard
            title="Audit Trail Logs"
            value={auditLogsCount}
            description="Recorded security and administrative events"
            icon={<IconBriefcase size={20} stroke={1.8} />}
            variant="primary"
            isLoading={isSummaryLoading}
          />
        </div>
      </div>

      {/* 4. Pending Reviews (Visual Operational Priority) */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-slate-900">Pending Reviews</h2>
            <span className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-bold text-brand-primary">
              {activeReviews.length} Tasks
            </span>
          </div>

          <Link
            to={viewAllInfo.route}
            className="text-xs font-semibold text-brand-secondary hover:text-brand-primary transition-colors flex items-center gap-1"
          >
            <span>{viewAllInfo.label}</span>
            <IconArrowRight size={14} stroke={1.8} />
          </Link>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveCategory('ALL')}
            className="rounded-md px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white transition-colors"
          >
            All Pending Reports ({reportsCount})
          </button>
        </div>

        <DataTable
          data={filteredReviews}
          columns={reviewColumns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search review tasks by title, submitter or keyword..."
          searchFilter={(item, query) =>
            item.item.toLowerCase().includes(query) ||
            item.submittedBy.toLowerCase().includes(query) ||
            item.details.toLowerCase().includes(query)
          }
          pageSize={5}
          isLoading={isReportsLoading}
          emptyTitle="No pending review tasks"
          emptyDescription="All submitted verification documents, reports, and opportunity proposals in this category are completely processed."
        />
      </div>

      {/* 5. Quick Governance Portals & Management Shortcuts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 pt-2">
        <Card className="p-4.5 rounded-xl border-slate-200 bg-white hover:border-brand-primary/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-brand-secondary">
              <IconSchool size={20} stroke={1.8} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">User Management</h3>
              <p className="text-xs text-slate-500">Manage student, alumni, and faculty records across 5 campuses.</p>
            </div>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex justify-end">
            <Link
              to={ROUTES.ADMIN.USERS}
              className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
            >
              <span>Manage Directory</span>
              <IconArrowRight size={14} stroke={1.8} />
            </Link>
          </div>
        </Card>

        <Card className="p-4.5 rounded-xl border-slate-200 bg-white hover:border-brand-primary/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-brand-accent">
              <IconBuildingCommunity size={20} stroke={1.8} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Community Chapters</h3>
              <p className="text-xs text-slate-500">Oversee official academic majors and international chapters.</p>
            </div>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex justify-end">
            <Link
              to={ROUTES.ADMIN.COMMUNITIES}
              className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
            >
              <span>Manage Chapters</span>
              <IconArrowRight size={14} stroke={1.8} />
            </Link>
          </div>
        </Card>

        <Card className="p-4.5 rounded-xl border-slate-200 bg-white hover:border-brand-primary/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <IconAlertTriangle size={20} stroke={1.8} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Content Moderation</h3>
              <p className="text-xs text-slate-500">Review reported discussions, job postings, and comments.</p>
            </div>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex justify-end">
            <Link
              to={ROUTES.ADMIN.REPORTS}
              className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
            >
              <span>View Moderation Queue</span>
              <IconArrowRight size={14} stroke={1.8} />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
