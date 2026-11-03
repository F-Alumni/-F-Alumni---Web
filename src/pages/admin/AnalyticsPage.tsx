import { useState, type FC } from 'react'
import {
  IconUsers,
  IconSchool,
  IconTrendingUp,
  IconAward,
  IconBuildingCommunity,
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

  const campusStats = [
    { campus: 'FPT Hoa Lac (Hanoi)', students: 16500, alumni: 12400, verifiedRate: '88%' },
    { campus: 'FPT TP. Ho Chi Minh', students: 14200, alumni: 11100, verifiedRate: '86%' },
    { campus: 'FPT Da Nang', students: 5800, alumni: 4300, verifiedRate: '84%' },
    { campus: 'FPT Can Tho', students: 4100, alumni: 2800, verifiedRate: '79%' },
    { campus: 'FPT Quy Nhon (AI Hub)', students: 2300, alumni: 1150, verifiedRate: '82%' },
  ]

  const majorDistribution = [
    { major: 'Software Engineering (SE)', percentage: 38, count: '15,308' },
    { major: 'Artificial Intelligence (AI)', percentage: 18, count: '7,251' },
    { major: 'Information Assurance (IA)', percentage: 14, count: '5,639' },
    { major: 'Business Administration (BA)', percentage: 16, count: '6,445' },
    { major: 'Graphic Design & Media', percentage: 14, count: '5,639' },
  ]

  const totalUsersDisplay = summary?.totalUsers ? summary.totalUsers.toLocaleString() : '40,285'
  const activeUsersDisplay = summary?.activeUsers ? summary.activeUsers.toLocaleString() : '38,120'
  const pendingReportsDisplay = summary?.pendingReports !== undefined ? summary.pendingReports.toString() : '2'
  const auditLogsCountDisplay = summary?.totalAuditLogsCount ? summary.totalAuditLogsCount.toLocaleString() : '12,890'

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
          description="Cumulative across all 5 campuses"
          icon={<IconSchool size={20} stroke={1.8} />}
          trend={{ value: '14.2% YoY', isPositive: true }}
          variant="secondary"
        />
        <StatCard
          title="Active Students & Alumni"
          value={activeUsersDisplay}
          description="Verified active platform accounts"
          icon={<IconAward size={20} stroke={1.8} />}
          trend={{ value: '3.1% this quarter', isPositive: true }}
          variant="accent"
        />
        <StatCard
          title="Pending Moderation"
          value={pendingReportsDisplay}
          description="Safety reports awaiting review"
          icon={<IconTrendingUp size={20} stroke={1.8} />}
          trend={{ value: 'Realtime Queue', isPositive: false }}
          variant="primary"
        />
        <StatCard
          title="Audit Trail Logs"
          value={auditLogsCountDisplay}
          description="Recorded governance security events"
          icon={<IconUsers size={20} stroke={1.8} />}
          trend={{ value: 'Immutable Trail', isPositive: true }}
          variant="neutral"
        />
      </div>

      {/* Campus Breakdown Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 rounded-xl border-slate-200 bg-white lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Campus Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of students and verified alumni per campus.</p>
            </div>
            <span className="rounded-full bg-brand-secondary/10 px-2.5 py-1 text-xs font-bold text-brand-secondary">
              5 Campuses
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC]">
                  <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Campus</th>
                  <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Students</th>
                  <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Alumni</th>
                  <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right">Verification Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campusStats.map((c) => (
                  <tr key={c.campus} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                      <IconBuildingCommunity size={16} stroke={1.8} className="text-brand-secondary shrink-0" />
                      <span>{c.campus}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{c.students.toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-600">{c.alumni.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-bold text-brand-accent">{c.verifiedRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Academic Major Share */}
        <Card className="p-5 rounded-xl border-slate-200 bg-white">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Major Breakdown</h3>
            <p className="text-xs text-slate-500">Student & Alumni share by field of study.</p>
          </div>

          <div className="space-y-4">
            {majorDistribution.map((m) => (
              <div key={m.major} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">{m.major}</span>
                  <span className="font-bold text-slate-900">{m.percentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all duration-500"
                    style={{ width: `${m.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
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
