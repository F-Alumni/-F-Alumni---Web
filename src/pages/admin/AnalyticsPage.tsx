import { useState, type FC } from 'react'
import {
  IconUsers,
  IconSchool,
  IconTrendingUp,
  IconAward,
  IconDownload,
  IconRefresh,
  IconShield,
  IconCircleCheck,
} from '@tabler/icons-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader, StatCard } from '@/components/admin'
import { ROUTES } from '@/constants/routes'
import {
  useAdminDashboardSummary,
  useRecentAuditLogs,
} from '@/features/admin'
import { adminService } from '@/services/admin'

export const AnalyticsPage: FC = () => {
  const [isExporting, setIsExporting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const {
    data: summary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useAdminDashboardSummary()

  const {
    data: auditLogs,
    isLoading: isLogsLoading,
    refetch: refetchLogs,
  } = useRecentAuditLogs(10)

  const handleExportAuditLogs = async () => {
    try {
      setIsExporting(true)
      await adminService.exportAuditLogs()
      setToastMessage('Đã tải xuống file kiểm toán hệ thống fpt_audit_logs.csv.')
      setTimeout(() => setToastMessage(null), 3500)
    } catch {
      setToastMessage('Lỗi khi xuất file báo cáo audit logs.')
      setTimeout(() => setToastMessage(null), 3500)
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefresh = () => {
    refetchSummary()
    refetchLogs()
  }

  const totalUsersDisplay = summary?.totalUsers !== undefined ? summary.totalUsers.toLocaleString() : '0'
  const activeUsersDisplay = summary?.activeUsers !== undefined ? summary.activeUsers.toLocaleString() : '0'
  const pendingReportsDisplay = summary?.pendingReports !== undefined ? summary.pendingReports.toString() : '0'
  const auditLogsCountDisplay = summary?.totalAuditLogsCount !== undefined ? summary.totalAuditLogsCount.toLocaleString() : '0'

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <IconCircleCheck size={16} stroke={2} className="text-brand-accent shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600 font-bold ml-4">
            ×
          </button>
        </div>
      )}

      <PageHeader
        title="Analytics & Growth Reports"
        description="Data analytics on student engagement, alumni verification coverage, and security audit trail."
        breadcrumbs={[
          { label: 'Admin', to: ROUTES.ADMIN.DASHBOARD },
          { label: 'Analytics' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isSummaryLoading || isLogsLoading}
              className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-100 gap-1.5"
            >
              <IconRefresh size={14} className={isSummaryLoading || isLogsLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportAuditLogs}
              disabled={isExporting}
              className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-100 gap-1.5"
            >
              <IconDownload size={14} className={isExporting ? 'animate-bounce' : ''} />
              <span>{isExporting ? 'Exporting...' : 'Export Audit Logs (CSV)'}</span>
            </Button>
          </div>
        }
      />

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total User Accounts"
          value={totalUsersDisplay}
          description="Registered accounts in system"
          icon={<IconSchool size={20} stroke={1.8} />}
          variant="secondary"
          isLoading={isSummaryLoading}
        />
        <StatCard
          title="Active Students & Alumni"
          value={activeUsersDisplay}
          description="Verified active platform accounts"
          icon={<IconAward size={20} stroke={1.8} />}
          variant="accent"
          isLoading={isSummaryLoading}
        />
        <StatCard
          title="Pending Moderation"
          value={pendingReportsDisplay}
          description="Safety reports awaiting review"
          icon={<IconTrendingUp size={20} stroke={1.8} />}
          variant="primary"
          isLoading={isSummaryLoading}
        />
        <StatCard
          title="Audit Trail Logs"
          value={auditLogsCountDisplay}
          description="Recorded governance security events"
          icon={<IconUsers size={20} stroke={1.8} />}
          variant="neutral"
          isLoading={isSummaryLoading}
        />
      </div>

      {/* Security Audit Trail Logs Table (from Admin Service) */}
      <Card className="p-5 rounded-xl border-slate-200 bg-white">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <IconShield size={18} stroke={1.8} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Security Audit Trail</h3>
              <p className="text-xs text-slate-500">Real-time log of administrative decisions, account suspensions, and content moderation.</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Backend Admin Service
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-[#F8FAFC]">
                <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Timestamp</th>
                <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Action</th>
                <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Target</th>
                <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Admin Email</th>
                <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs && auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 font-sans">
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {log.createdAtUtc ? log.createdAtUtc.slice(0, 19).replace('T', ' ') : 'Just now'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {log.targetEntity} #{log.targetId.slice(0, 8)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {log.adminEmail || log.adminUserId.slice(0, 8)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-sans text-xs">
                      {log.details || 'Standard administrative operation.'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="font-sans">
                  <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                    No recent audit log entries returned from Admin Service.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default AnalyticsPage
