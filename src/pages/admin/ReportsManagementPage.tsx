import { useState, type FC } from 'react'
import { IconBan, IconEye } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { PageHeader, StatusBadge, DataTable, type Column } from '@/components/admin'
import { ROUTES } from '@/constants/routes'

interface ReportRecord {
  id: string
  reportedTarget: string
  targetType: 'POST' | 'COMMENT' | 'USER_ACCOUNT'
  reportedBy: string
  reason: string
  severity: 'urgent' | 'pending'
  status: 'pending' | 'approved' | 'rejected'
  reportedDate: string
}

export const ReportsManagementPage: FC = () => {
  const [reports, setReports] = useState<ReportRecord[]>([
    {
      id: 'REP-801',
      reportedTarget: 'Post #4829 - "Earn easy money crypto..."',
      targetType: 'POST',
      reportedBy: '5 community members',
      reason: 'Commercial spam & phishing scam',
      severity: 'urgent',
      status: 'pending',
      reportedDate: '2026-10-09 19:45',
    },
    {
      id: 'REP-802',
      reportedTarget: 'User account "FakeAlumni_2024"',
      targetType: 'USER_ACCOUNT',
      reportedBy: 'Alumni Committee',
      reason: 'Impersonating FPT Software executive',
      severity: 'urgent',
      status: 'pending',
      reportedDate: '2026-10-09 14:10',
    },
    {
      id: 'REP-803',
      reportedTarget: 'Comment #1902 in SE Community',
      targetType: 'COMMENT',
      reportedBy: 'Maya Lin',
      reason: 'Inappropriate language in academic forum',
      severity: 'pending',
      status: 'approved',
      reportedDate: '2026-10-07 10:20',
    },
  ])

  const handleResolve = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    )
  }

  const handleDismiss = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    )
  }

  const columns: Column<ReportRecord>[] = [
    {
      key: 'reportedTarget',
      header: 'Reported Subject & Reason',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{r.reportedTarget}</span>
          <span className="text-[11px] text-rose-600 font-medium">Reason: {r.reason}</span>
        </div>
      ),
    },
    {
      key: 'targetType',
      header: 'Type',
      render: (r) => (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
          {r.targetType.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'reportedBy',
      header: 'Reported By',
      render: (r) => <span className="text-slate-600 text-[11px]">{r.reportedBy}</span>,
    },
    {
      key: 'severity',
      header: 'Priority',
      render: (r) => (
        <StatusBadge
          status={r.severity}
          label={r.severity === 'urgent' ? 'High Priority' : 'Standard'}
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <StatusBadge
          status={r.status}
          label={
            r.status === 'pending'
              ? 'Under Investigation'
              : r.status === 'approved'
              ? 'Sanctioned / Removed'
              : 'Dismissed'
          }
        />
      ),
    },
    {
      key: 'reportedDate',
      header: 'Date',
      render: (r) => <span className="text-slate-500 text-[11px]">{r.reportedDate}</span>,
    },
    {
      key: 'actions',
      header: 'Action',
      className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-slate-200 hover:text-brand-primary"
          >
            <IconEye size={14} stroke={1.8} className="mr-1" />
            Inspect
          </Button>
          {r.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => handleResolve(r.id)}
                className="h-7 rounded-md bg-rose-600 px-2.5 text-xs font-semibold text-white hover:bg-rose-700"
                title="Remove content or sanction user"
              >
                <IconBan size={14} stroke={1.8} className="mr-1" />
                Sanction
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDismiss(r.id)}
                className="h-7 text-xs border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Dismiss
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderation & Reports"
        description="Review community reports, handle spam incidents, and safeguard university network guidelines."
        breadcrumbs={[
          { label: 'Admin', to: ROUTES.ADMIN.DASHBOARD },
          { label: 'Moderation Reports' },
        ]}
      />

      <DataTable
        data={reports}
        columns={columns}
        keyExtractor={(r) => r.id}
        searchPlaceholder="Search reported subjects, reasons, or reporters..."
        searchFilter={(r, q) =>
          r.reportedTarget.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q)
        }
      />
    </div>
  )
}

export default ReportsManagementPage
