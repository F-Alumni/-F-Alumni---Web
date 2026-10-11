import type { FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  UserCheck,
  AlertTriangle,
  Building2,
  ArrowRight,
  Eye,
  FileText,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader, StatCard, StatusBadge, DataTable, type Column } from '@/components/admin'
import { ROUTES } from '@/constants/routes'

interface PendingReviewItem {
  id: string
  item: string
  type: 'ALUMNI_VERIFY' | 'REPORTED_POST' | 'NEW_COMMUNITY'
  submittedBy: string
  submittedDate: string
  status: 'pending' | 'urgent'
}

export const DashboardPage: FC = () => {
  const navigate = useNavigate()

  // Real data placeholders from system records
  const pendingReviews: PendingReviewItem[] = [
    {
      id: 'REV-101',
      item: 'Dang Tran Hoang - Alumni Class 2023 (K15 SE)',
      type: 'ALUMNI_VERIFY',
      submittedBy: 'hoangdt@alumni.fpt.edu.vn',
      submittedDate: '2026-10-10 14:32',
      status: 'pending',
    },
    {
      id: 'REV-102',
      item: 'Nguyen Quoc Dat - Diploma Degree SE160982',
      type: 'ALUMNI_VERIFY',
      submittedBy: 'datnq@fpt.edu.vn',
      submittedDate: '2026-10-10 11:20',
      status: 'pending',
    },
    {
      id: 'REV-103',
      item: 'Post #4829 reported for non-university commercial spam',
      type: 'REPORTED_POST',
      submittedBy: 'Automated Community Filter',
      submittedDate: '2026-10-09 19:45',
      status: 'urgent',
    },
    {
      id: 'REV-104',
      item: 'Proposal: FPT Cloud & DevOps Alumni Chapter (Tokyo)',
      type: 'NEW_COMMUNITY',
      submittedBy: 'minh.tokyo@fpt.jp',
      submittedDate: '2026-10-09 08:15',
      status: 'pending',
    },
  ]

  const reviewColumns: Column<PendingReviewItem>[] = [
    {
      key: 'item',
      header: 'Pending Item',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{item.item}</span>
          <span className="text-[11px] text-slate-500">Submitted by: {item.submittedBy}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Category',
      render: (item) => {
        const types = {
          ALUMNI_VERIFY: { label: 'Alumni Verification', icon: UserCheck, color: 'text-brand-secondary bg-sky-50' },
          REPORTED_POST: { label: 'Moderation Report', icon: AlertTriangle, color: 'text-rose-600 bg-rose-50' },
          NEW_COMMUNITY: { label: 'Community Request', icon: Building2, color: 'text-brand-accent bg-emerald-50' },
        }
        const config = types[item.type]
        const Icon = config.icon
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ${config.color}`}>
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
          </span>
        )
      },
    },
    {
      key: 'submittedDate',
      header: 'Submission Date',
      render: (item) => (
        <span className="inline-flex items-center gap-1 text-slate-500">
          <Clock className="h-3 w-3 text-slate-400" />
          <span>{item.submittedDate}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge status={item.status} label={item.status === 'urgent' ? 'Urgent Review' : 'Pending'} />
      ),
    },
    {
      key: 'action',
      header: 'Action',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (item.type === 'ALUMNI_VERIFY') navigate(ROUTES.ADMIN.ALUMNI_VERIFICATION)
              else if (item.type === 'REPORTED_POST') navigate(ROUTES.ADMIN.REPORTS)
              else navigate(ROUTES.ADMIN.COMMUNITIES)
            }}
            className="h-7 text-xs border-slate-200 hover:border-brand-primary hover:text-brand-primary"
          >
            <Eye className="h-3 w-3 mr-1" />
            <span>Review</span>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Dashboard"
        description="Monitor and manage your university alumni community operations."
        actions={
          <div className="flex items-center gap-2">
            <Link to={ROUTES.ADMIN.ALUMNI_VERIFICATION}>
              <Button className="h-9 rounded-lg bg-brand-primary px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-primary-hover">
                <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                <span>Verify Alumni</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* 2. Overview Metrics (Under Page Header) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value="40,285"
          description="Enrolled students & alumni members"
          icon={<Users className="h-5 w-5" />}
          trend={{ value: '12% this month', isPositive: true }}
          variant="secondary"
        />

        <StatCard
          title="Pending Verification"
          value="18"
          description="Alumni awaiting degree certification"
          icon={<UserCheck className="h-5 w-5" />}
          trend={{ value: 'Requires action', isPositive: false }}
          variant="primary"
        />

        <StatCard
          title="Active Communities"
          value="46"
          description="Campus & academic interest chapters"
          icon={<Building2 className="h-5 w-5" />}
          trend={{ value: '3 new chapters', isPositive: true }}
          variant="accent"
        />

        <StatCard
          title="Reported Content"
          value="4"
          description="Posts or comments under review"
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={{ value: 'Low priority', isPositive: true }}
          variant="neutral"
        />
      </div>

      {/* 3. Pending Reviews (Visual Priority) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Pending Reviews</h2>
            <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-bold text-brand-primary">
              {pendingReviews.length} Tasks
            </span>
          </div>
          <Link
            to={ROUTES.ADMIN.ALUMNI_VERIFICATION}
            className="text-xs font-semibold text-brand-secondary hover:text-brand-primary transition-colors flex items-center gap-1"
          >
            <span>View all verification requests</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <DataTable
          data={pendingReviews}
          columns={reviewColumns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Search review tasks..."
          searchFilter={(item, query) =>
            item.item.toLowerCase().includes(query) || item.submittedBy.toLowerCase().includes(query)
          }
          pageSize={5}
        />
      </div>

      {/* 4. Quick Governance Portals & Management Shortcuts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-4.5 rounded-xl border-slate-200 bg-white hover:border-brand-primary/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-brand-secondary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">User Management</h3>
              <p className="text-xs text-slate-500">Manage student and alumni records across 5 campuses.</p>
            </div>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex justify-end">
            <Link
              to={ROUTES.ADMIN.USERS}
              className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
            >
              <span>Manage Users</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        <Card className="p-4.5 rounded-xl border-slate-200 bg-white hover:border-brand-primary/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-brand-accent">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Community Circles</h3>
              <p className="text-xs text-slate-500">Oversee official academic majors and alumni chapters.</p>
            </div>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex justify-end">
            <Link
              to={ROUTES.ADMIN.COMMUNITIES}
              className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
            >
              <span>Manage Communities</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        <Card className="p-4.5 rounded-xl border-slate-200 bg-white hover:border-brand-primary/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Content Moderation</h3>
              <p className="text-xs text-slate-500">Review reported discussions, job posts, and comments.</p>
            </div>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex justify-end">
            <Link
              to={ROUTES.ADMIN.REPORTS}
              className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1"
            >
              <span>View Moderation Queue</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
