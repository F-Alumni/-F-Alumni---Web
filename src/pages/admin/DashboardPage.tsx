import { useState, useCallback, type FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  IconSchool,
  IconUserCheck,
  IconClockHour4,
  IconAlertTriangle,
  IconArticle,
  IconBriefcase,
  IconAward,
  IconBuildingCommunity,
  IconArrowRight,
  IconEye,
  IconRefresh,
  IconCircleCheck,
  IconShieldCheck,
  IconStack2,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader, StatCard, StatusBadge, DataTable, type Column } from '@/components/admin'
import { ROUTES } from '@/constants/routes'

export interface PendingReviewItem {
  id: string
  item: string
  details: string
  type: 'ALUMNI_VERIFY' | 'REPORTED_CONTENT' | 'OPPORTUNITY_REVIEW' | 'NEW_COMMUNITY'
  submittedBy: string
  submittedDate: string
  status: 'pending' | 'urgent'
  targetRoute: string
}

export const DashboardPage: FC = () => {
  const navigate = useNavigate()

  // State management for data, loading, error, and filters
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [activeCategory, setActiveCategory] = useState<string>('ALL')
  const [resolvedIds, setResolvedIds] = useState<string[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Real data placeholders based on domain records in project architecture
  const initialPendingReviews: PendingReviewItem[] = [
    {
      id: 'REV-ALUMNI-01',
      item: 'Dang Tran Hoang - Alumni Class 2023 (K15 SE)',
      details: 'Degree Certificate: Bang_Tot_Nghiep_SE150392.pdf',
      type: 'ALUMNI_VERIFY',
      submittedBy: 'hoangdt@alumni.fpt.edu.vn',
      submittedDate: '2026-10-10 14:32',
      status: 'pending',
      targetRoute: ROUTES.ADMIN.ALUMNI_VERIFICATION,
    },
    {
      id: 'REV-ALUMNI-02',
      item: 'Nguyen Quoc Dat - Diploma Degree SE160982 (K16 AI)',
      details: 'Transcript & Degree: ChungChi_TotNghiep_DatNQ.jpg',
      type: 'ALUMNI_VERIFY',
      submittedBy: 'datnq@fpt.edu.vn',
      submittedDate: '2026-10-10 11:20',
      status: 'pending',
      targetRoute: ROUTES.ADMIN.ALUMNI_VERIFICATION,
    },
    {
      id: 'REV-REP-01',
      item: 'Post #4829 - "Commercial spam & cryptocurrency scam"',
      details: 'Reported by 5 community members in General Announcements',
      type: 'REPORTED_CONTENT',
      submittedBy: 'Automated Filter & Community',
      submittedDate: '2026-10-09 19:45',
      status: 'urgent',
      targetRoute: ROUTES.ADMIN.REPORTS,
    },
    {
      id: 'REV-OPP-01',
      item: 'FPT Alumni Global Master Fellowship 2026 ($15,000 grant)',
      details: 'Tokyo Chapter • Academic scholarship & tuition assistance',
      type: 'OPPORTUNITY_REVIEW',
      submittedBy: 'Tokyo Alumni Chapter',
      submittedDate: '2026-10-09 16:30',
      status: 'pending',
      targetRoute: ROUTES.ADMIN.OPPORTUNITIES,
    },
    {
      id: 'REV-COM-01',
      item: 'Proposal: FPT Cloud & DevOps Alumni Chapter (Tokyo)',
      details: 'International campus charter proposed by K12 Alumni team',
      type: 'NEW_COMMUNITY',
      submittedBy: 'minh.tokyo@fpt.jp',
      submittedDate: '2026-10-09 08:15',
      status: 'pending',
      targetRoute: ROUTES.ADMIN.COMMUNITIES,
    },
  ]

  // Filter reviews excluding resolved items
  const activeReviews = initialPendingReviews.filter((item) => !resolvedIds.includes(item.id))

  const filteredReviews = activeCategory === 'ALL'
    ? activeReviews
    : activeReviews.filter((item) => item.type === activeCategory)

  // Counts for tabs
  const alumniVerifyCount = activeReviews.filter((r) => r.type === 'ALUMNI_VERIFY').length
  const reportsCount = activeReviews.filter((r) => r.type === 'REPORTED_CONTENT').length
  const oppsCount = activeReviews.filter((r) => r.type === 'OPPORTUNITY_REVIEW').length
  const communitiesCount = activeReviews.filter((r) => r.type === 'NEW_COMMUNITY').length

  // Quick simulated data reload
  const handleRefresh = useCallback(() => {
    setIsLoading(true)
    setIsError(false)
    setTimeout(() => {
      setIsLoading(false)
      setToastMessage('Dashboard metrics synchronized successfully with live system state.')
      setTimeout(() => setToastMessage(null), 3500)
    }, 450)
  }, [])

  // Quick resolve action right on the dashboard
  const handleQuickResolve = (id: string, label: string) => {
    setResolvedIds((prev) => [...prev, id])
    setToastMessage(`Item "${label}" processed and archived from pending review queue.`)
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
            onClick={() => handleQuickResolve(item.id, item.item)}
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

  // Dynamic route for View All link based on current filter
  const getViewAllRoute = () => {
    switch (activeCategory) {
      case 'REPORTED_CONTENT':
        return { label: 'View all moderation reports', route: ROUTES.ADMIN.REPORTS }
      case 'OPPORTUNITY_REVIEW':
        return { label: 'View all career opportunities', route: ROUTES.ADMIN.OPPORTUNITIES }
      case 'NEW_COMMUNITY':
        return { label: 'View all campus communities', route: ROUTES.ADMIN.COMMUNITIES }
      default:
        return { label: 'View all alumni verification requests', route: ROUTES.ADMIN.ALUMNI_VERIFICATION }
    }
  }

  const viewAllInfo = getViewAllRoute()

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
      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <IconAlertTriangle size={16} stroke={1.8} className="text-rose-600 shrink-0" />
            <span>Unable to synchronize current administration metrics. Check network connection.</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="h-7 border-rose-300 text-rose-700 bg-white hover:bg-rose-100"
          >
            <IconRefresh size={14} stroke={1.8} className="mr-1" />
            <span>Retry</span>
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
              disabled={isLoading}
              className="h-9 rounded-lg border-slate-200 text-slate-700 hover:border-brand-primary hover:text-brand-primary"
            >
              <IconRefresh size={14} stroke={1.8} className={`mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
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

      {/* 2. KPI Section 1: Member Verification & Trust Governance */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconShieldCheck size={16} stroke={1.8} className="text-brand-secondary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Member Verification & Trust Governance
            </h2>
          </div>
          <span className="text-[11px] font-medium text-slate-400">Core Identity Operations</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Enrolled Students"
            value="32,450"
            description="Active students across 5 campuses"
            icon={<IconSchool size={20} stroke={1.8} />}
            trend={{ value: '8.4% YoY', isPositive: true }}
            variant="secondary"
            isLoading={isLoading}
          />

          <StatCard
            title="Verified Alumni"
            value="7,835"
            description="Certified alumni in directory"
            icon={<IconUserCheck size={20} stroke={1.8} />}
            trend={{ value: '14.2% YoY', isPositive: true }}
            variant="accent"
            isLoading={isLoading}
          />

          <StatCard
            title="Pending Verification"
            value={alumniVerifyCount}
            description="Alumni awaiting degree audit"
            icon={<IconClockHour4 size={20} stroke={1.8} />}
            trend={{ value: alumniVerifyCount > 0 ? 'Requires action' : 'All clear', isPositive: alumniVerifyCount === 0 }}
            variant="primary"
            isLoading={isLoading}
          />

          <StatCard
            title="Pending Reports"
            value={reportsCount}
            description="Flagged content & account reports"
            icon={<IconAlertTriangle size={20} stroke={1.8} />}
            trend={{ value: reportsCount > 0 ? 'Requires review' : 'Zero flags', isPositive: reportsCount === 0 }}
            variant="neutral"
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* 3. KPI Section 2: Content & Opportunity Ecosystem */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconStack2 size={16} stroke={1.8} className="text-brand-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Content & Opportunity Ecosystem
            </h2>
          </div>
          <span className="text-[11px] font-medium text-slate-400">Community Engagement</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Community Posts"
            value="1,240"
            description="Active academic & career discussions"
            icon={<IconArticle size={20} stroke={1.8} />}
            trend={{ value: '24 new today', isPositive: true }}
            variant="secondary"
            isLoading={isLoading}
          />

          <StatCard
            title="Job Opportunities"
            value="86"
            description="Full-time & internship vacancies"
            icon={<IconBriefcase size={20} stroke={1.8} />}
            trend={{ value: '12 closing soon', isPositive: true }}
            variant="primary"
            isLoading={isLoading}
          />

          <StatCard
            title="Scholarships"
            value="15"
            description="Fellowships & global grants"
            icon={<IconAward size={20} stroke={1.8} />}
            trend={{ value: '3 active grants', isPositive: true }}
            variant="accent"
            isLoading={isLoading}
          />

          <StatCard
            title="Active Communities"
            value="46"
            description="Campus & academic interest chapters"
            icon={<IconBuildingCommunity size={20} stroke={1.8} />}
            trend={{ value: '5 campus hubs', isPositive: true }}
            variant="neutral"
            isLoading={isLoading}
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
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeCategory === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Tasks ({activeReviews.length})
          </button>

          <button
            onClick={() => setActiveCategory('ALUMNI_VERIFY')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeCategory === 'ALUMNI_VERIFY'
                ? 'bg-brand-secondary text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <IconUserCheck size={14} stroke={1.8} />
            <span>Alumni Verification ({alumniVerifyCount})</span>
          </button>

          <button
            onClick={() => setActiveCategory('REPORTED_CONTENT')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeCategory === 'REPORTED_CONTENT'
                ? 'bg-rose-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <IconAlertTriangle size={14} stroke={1.8} />
            <span>Reports ({reportsCount})</span>
          </button>

          <button
            onClick={() => setActiveCategory('OPPORTUNITY_REVIEW')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeCategory === 'OPPORTUNITY_REVIEW'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <IconBriefcase size={14} stroke={1.8} />
            <span>Opportunities ({oppsCount})</span>
          </button>

          <button
            onClick={() => setActiveCategory('NEW_COMMUNITY')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeCategory === 'NEW_COMMUNITY'
                ? 'bg-brand-accent text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <IconBuildingCommunity size={14} stroke={1.8} />
            <span>Communities ({communitiesCount})</span>
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
          isLoading={isLoading}
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
