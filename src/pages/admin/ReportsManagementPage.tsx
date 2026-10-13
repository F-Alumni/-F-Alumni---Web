import { useState, type FC } from 'react'
import {
  IconBan,
  IconEye,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconHistory,
  IconShield,
  IconFileText,
  IconCircleCheck,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { PageHeader, StatusBadge, DataTable, type Column } from '@/components/admin'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/authStore'

export type ViolationReason =
  | 'SPAM'
  | 'HARASSMENT'
  | 'INAPPROPRIATE_LANGUAGE'
  | 'ACADEMIC_MISCONDUCT'
  | 'IMPERSONATION'

export type PenaltyAction = 'HIDE_POST' | 'ISSUE_STRIKE' | 'REQUEST_EDIT'

export interface ReportRecord {
  id: string
  reportedTarget: string
  targetType: 'POST' | 'COMMENT' | 'USER_ACCOUNT'
  reportedBy: string
  reason: string
  reasonCode: ViolationReason
  severity: 'urgent' | 'pending'
  status: 'pending' | 'approved' | 'rejected'
  reportedDate: string
  authorName: string
  authorEmail: string
  authorStrikes: number
  contentSnippet: string
  resolutionDetails?: {
    action: PenaltyAction | 'DISMISSED'
    policyReason: string
    moderatorName: string
    resolvedAt: string
    notes: string
  }
}

export const ReportsManagementPage: FC = () => {
  const { currentUser } = useAuthStore()
  const activeModName = currentUser?.name || 'Campus Safety Moderator'

  // Tab: 'queue' (Pending & Review) vs 'history' (Moderation Audit Trail)
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue')

  // Modals state
  const [inspectingReport, setInspectingReport] = useState<ReportRecord | null>(null)
  const [sanctioningReport, setSanctioningReport] = useState<ReportRecord | null>(null)

  // Sanction form inputs
  const [selectedReason, setSelectedReason] = useState<ViolationReason>('SPAM')
  const [selectedPenalty, setSelectedPenalty] = useState<PenaltyAction>('HIDE_POST')
  const [modNotes, setModNotes] = useState<string>('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [reports, setReports] = useState<ReportRecord[]>([
    {
      id: 'REP-801',
      reportedTarget: 'Post #4829 - "Earn easy money crypto investment"',
      targetType: 'POST',
      reportedBy: '5 community members',
      reason: 'Commercial spam & cryptocurrency phishing scam',
      reasonCode: 'SPAM',
      severity: 'urgent',
      status: 'pending',
      reportedDate: '2026-10-12 19:45',
      authorName: 'Spam Bot 99',
      authorEmail: 'promo123@tempmail.org',
      authorStrikes: 2,
      contentSnippet:
        'Join our private telegram channel now to earn guaranteed 500% profit per day! Zero risks with university student loan funds. Link: t.me/fpt_crypto_easy_cash',
    },
    {
      id: 'REP-802',
      reportedTarget: 'User account "FakeAlumni_2024"',
      targetType: 'USER_ACCOUNT',
      reportedBy: 'Alumni Committee',
      reason: 'Impersonating FPT Software executive',
      reasonCode: 'IMPERSONATION',
      severity: 'urgent',
      status: 'pending',
      reportedDate: '2026-10-12 14:10',
      authorName: 'FakeAlumni_2024',
      authorEmail: 'vp_phuc@fakealumni.net',
      authorStrikes: 1,
      contentSnippet:
        'User profile claims to be Vice President of FPT Software Japan and solicits direct wire transfers for "exclusive corporate internships" via direct messages.',
    },
    {
      id: 'REP-803',
      reportedTarget: 'Comment #1902 in SE Academic Community',
      targetType: 'COMMENT',
      reportedBy: 'Maya Lin',
      reason: 'Inappropriate language in academic forum',
      reasonCode: 'INAPPROPRIATE_LANGUAGE',
      severity: 'pending',
      status: 'approved',
      reportedDate: '2026-10-10 10:20',
      authorName: 'Anonymous Student',
      authorEmail: 'student.anon@fpt.edu.vn',
      authorStrikes: 0,
      contentSnippet: 'Offensive remarks and personal insults directed at capstone teammates.',
      resolutionDetails: {
        action: 'HIDE_POST',
        policyReason: 'Inappropriate Language in Academic Forum',
        moderatorName: 'Campus Safety Moderator',
        resolvedAt: '2026-10-10 11:05',
        notes: 'Comment hidden from discussion thread. User issued reminder of community conduct guidelines.',
      },
    },
    {
      id: 'REP-804',
      reportedTarget: 'Post #4790 - "Selling Capstone Source Code PRN232"',
      targetType: 'POST',
      reportedBy: 'Dr. Nguyen Van Faculty',
      reason: 'Academic Misconduct - Selling past exam & capstone project source',
      reasonCode: 'ACADEMIC_MISCONDUCT',
      severity: 'urgent',
      status: 'approved',
      reportedDate: '2026-10-09 09:15',
      authorName: 'K15 Code Trader',
      authorEmail: 'trade.source@gmail.com',
      authorStrikes: 3,
      contentSnippet:
        'Offering full 10/10 grade source code for PRN232 Assignment and Capstone projects. Contact Zalo for pricing.',
      resolutionDetails: {
        action: 'ISSUE_STRIKE',
        policyReason: 'Academic Misconduct & Cheating',
        moderatorName: 'FPT Super Admin',
        resolvedAt: '2026-10-09 10:00',
        notes: 'Account suspended from publishing. Reported to Department Academic Integrity Board.',
      },
    },
  ])

  // Filter queues
  const pendingReports = reports.filter((r) => r.status === 'pending')
  const historyReports = reports.filter((r) => r.status !== 'pending')

  const openSanctionModal = (report: ReportRecord) => {
    setInspectingReport(null)
    setSanctioningReport(report)
    setSelectedReason(report.reasonCode || 'SPAM')
    setSelectedPenalty('HIDE_POST')
    setModNotes('')
  }

  const handleExecuteSanction = () => {
    if (!sanctioningReport) return

    const reasonLabels: Record<ViolationReason, string> = {
      SPAM: 'Commercial Spam & Phishing',
      HARASSMENT: 'Harassment & Targeted Bullying',
      INAPPROPRIATE_LANGUAGE: 'Inappropriate Language in Academic Forum',
      ACADEMIC_MISCONDUCT: 'Academic Misconduct / Cheating',
      IMPERSONATION: 'Impersonation & Fraud',
    }

    const penaltyLabels: Record<PenaltyAction, string> = {
      HIDE_POST: 'Post Hidden & Suppressed',
      ISSUE_STRIKE: 'Formal User Strike Issued',
      REQUEST_EDIT: 'Revision Requested from Author',
    }

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16)

    setReports((prev) =>
      prev.map((r) => {
        if (r.id === sanctioningReport.id) {
          return {
            ...r,
            status: 'approved',
            resolutionDetails: {
              action: selectedPenalty,
              policyReason: reasonLabels[selectedReason],
              moderatorName: activeModName,
              resolvedAt: nowStr,
              notes: modNotes.trim() || `Sanction applied: ${penaltyLabels[selectedPenalty]}.`,
            },
          }
        }
        return r
      })
    )

    setToastMessage(`Sanction executed successfully on ${sanctioningReport.id} (${penaltyLabels[selectedPenalty]}).`)
    setTimeout(() => setToastMessage(null), 4000)
    setSanctioningReport(null)
  }

  const handleDismissReport = (report: ReportRecord) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16)
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === report.id) {
          return {
            ...r,
            status: 'rejected',
            resolutionDetails: {
              action: 'DISMISSED',
              policyReason: 'False Positive / No Violation Found',
              moderatorName: activeModName,
              resolvedAt: nowStr,
              notes: 'Report dismissed following review. Content remains visible.',
            },
          }
        }
        return r
      })
    )

    setInspectingReport(null)
    setToastMessage(`Report ${report.id} dismissed as false positive.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Columns for Pending Queue
  const queueColumns: Column<ReportRecord>[] = [
    {
      key: 'reportedTarget',
      header: 'Reported Subject & Violation',
      render: (r) => (
        <div className="flex flex-col max-w-sm">
          <span className="font-bold text-slate-900 line-clamp-1">{r.reportedTarget}</span>
          <span className="text-[11px] text-rose-600 font-semibold">{r.reason}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Author: {r.authorName}</span>
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
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-slate-800 text-xs font-medium">{r.reportedBy}</span>
          <span className="text-[10px] text-slate-400 font-mono">{r.reportedDate}</span>
        </div>
      ),
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
      key: 'authorStrikes',
      header: 'Author History',
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
            r.authorStrikes > 1
              ? 'bg-rose-100 text-rose-700'
              : r.authorStrikes === 1
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {r.authorStrikes} Previous Strike{r.authorStrikes === 1 ? '' : 's'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInspectingReport(r)}
            className="h-7 text-xs border-slate-200 hover:text-brand-primary"
            title="Preview reported content details"
          >
            <IconEye size={14} stroke={1.8} className="mr-1" />
            Inspect
          </Button>

          <Button
            size="sm"
            onClick={() => openSanctionModal(r)}
            className="h-7 rounded-md bg-rose-600 px-2.5 text-xs font-semibold text-white hover:bg-rose-700"
            title="Choose sanction penalty & policy"
          >
            <IconBan size={14} stroke={1.8} className="mr-1" />
            Sanction
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDismissReport(r)}
            className="h-7 text-xs border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Dismiss report as invalid"
          >
            Dismiss
          </Button>
        </div>
      ),
    },
  ]

  // Columns for History / Audit Trail
  const historyColumns: Column<ReportRecord>[] = [
    {
      key: 'id',
      header: 'Case ID & Target',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold text-slate-900">{r.id}</span>
          <span className="text-xs text-slate-700 font-medium line-clamp-1">{r.reportedTarget}</span>
          <span className="text-[10px] text-slate-400">Author: {r.authorName}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Outcome',
      render: (r) => {
        const isDismissed = r.status === 'rejected'
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
              isDismissed
                ? 'bg-slate-100 text-slate-700'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {isDismissed ? <IconCheck size={12} stroke={2} /> : <IconBan size={12} stroke={2} />}
            {isDismissed ? 'Dismissed' : 'Sanctioned'}
          </span>
        )
      },
    },
    {
      key: 'policyReason',
      header: 'Violation Policy',
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-800">
            {r.resolutionDetails?.policyReason || r.reason}
          </span>
          {r.resolutionDetails?.notes && (
            <span className="text-[11px] text-slate-500 line-clamp-1">
              {r.resolutionDetails.notes}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'moderatorName',
      header: 'Resolved By',
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-slate-800">
            {r.resolutionDetails?.moderatorName || 'Moderator'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {r.resolutionDetails?.resolvedAt || r.reportedDate}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (r) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setInspectingReport(r)}
          className="h-7 text-xs border-slate-200 hover:text-brand-primary"
        >
          <IconEye size={14} stroke={1.8} className="mr-1" />
          View Case
        </Button>
      ),
    },
  ]

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

      {/* Page Header */}
      <PageHeader
        title="Moderation & Safety Reports"
        description="Review community reports, issue policy sanctions, suppress violating content, and audit moderation history."
        breadcrumbs={[
          { label: 'Admin', to: ROUTES.ADMIN.DASHBOARD },
          { label: 'Moderation Reports' },
        ]}
      />

      {/* Tab Controls: Pending Queue vs Moderation History */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
            activeTab === 'queue'
              ? 'bg-brand-primary text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <IconShield size={16} stroke={1.8} />
          <span>Pending Queue ({pendingReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <IconHistory size={16} stroke={1.8} />
          <span>Moderation History & Audit ({historyReports.length})</span>
        </button>
      </div>

      {/* Queue View */}
      {activeTab === 'queue' ? (
        <DataTable
          data={pendingReports}
          columns={queueColumns}
          keyExtractor={(r) => r.id}
          searchPlaceholder="Search reported subjects, violation reasons, or authors..."
          searchFilter={(r, q) =>
            r.reportedTarget.toLowerCase().includes(q) ||
            r.reason.toLowerCase().includes(q) ||
            r.authorName.toLowerCase().includes(q)
          }
          emptyTitle="Moderation queue all clear"
          emptyDescription="There are no pending incident reports awaiting moderator resolution."
        />
      ) : (
        <DataTable
          data={historyReports}
          columns={historyColumns}
          keyExtractor={(r) => r.id}
          searchPlaceholder="Search resolved reports or moderator logs..."
          searchFilter={(r, q) =>
            r.reportedTarget.toLowerCase().includes(q) ||
            r.id.toLowerCase().includes(q) ||
            (r.resolutionDetails?.policyReason || '').toLowerCase().includes(q) ||
            (r.resolutionDetails?.moderatorName || '').toLowerCase().includes(q)
          }
          emptyTitle="No audit records"
          emptyDescription="Past resolved reports and sanction history will appear here."
        />
      )}

      {/* MODAL 1: Detail Preview / Inspection Modal */}
      {inspectingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                  <IconShield size={20} stroke={1.8} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Incident Details Preview</h3>
                  <span className="font-mono text-[11px] text-slate-500">{inspectingReport.id} • {inspectingReport.targetType}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectingReport(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* Reported Reason Box */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                    <IconAlertTriangle size={15} className="text-rose-600" />
                    Reported Violation
                  </span>
                  <StatusBadge
                    status={inspectingReport.severity}
                    label={inspectingReport.severity === 'urgent' ? 'High Priority' : 'Standard'}
                  />
                </div>
                <p className="text-rose-800 font-medium">{inspectingReport.reason}</p>
                <p className="text-[11px] text-rose-600">Reported by: {inspectingReport.reportedBy} on {inspectingReport.reportedDate}</p>
              </div>

              {/* Author Metadata */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Content Author</span>
                  <span className="font-bold text-slate-900 text-xs">{inspectingReport.authorName}</span>
                  <span className="text-[11px] text-slate-500 block truncate">{inspectingReport.authorEmail}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Previous Infractions</span>
                  <span className="font-bold text-slate-900 text-xs">{inspectingReport.authorStrikes} Recorded Strikes</span>
                  <span className="text-[11px] text-slate-500 block">
                    {inspectingReport.authorStrikes >= 2 ? '⚠️ High risk repeat offender' : 'Standard standing'}
                  </span>
                </div>
              </div>

              {/* Offending Content Snapshot */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <IconFileText size={15} className="text-slate-500" />
                  Target Subject & Content Snapshot
                </span>
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
                  <span className="font-bold text-slate-900 block">{inspectingReport.reportedTarget}</span>
                  <div className="rounded-lg bg-slate-50 p-3 text-slate-700 font-sans leading-relaxed border border-slate-100">
                    "{inspectingReport.contentSnippet}"
                  </div>
                </div>
              </div>

              {/* Resolution History if already resolved */}
              {inspectingReport.resolutionDetails && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-1.5">
                  <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                    <IconCircleCheck size={15} className="text-brand-accent" />
                    Historical Moderator Resolution
                  </span>
                  <p className="text-emerald-950 font-medium">{inspectingReport.resolutionDetails.policyReason}</p>
                  <p className="text-xs text-emerald-800">{inspectingReport.resolutionDetails.notes}</p>
                  <p className="text-[10px] text-emerald-600">
                    By {inspectingReport.resolutionDetails.moderatorName} at {inspectingReport.resolutionDetails.resolvedAt}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectingReport(null)}
                className="h-9 border-slate-200 text-slate-700"
              >
                Close Preview
              </Button>

              {inspectingReport.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDismissReport(inspectingReport)}
                    className="h-9 border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    Dismiss Report
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openSanctionModal(inspectingReport)}
                    className="h-9 bg-rose-600 text-white hover:bg-rose-700 font-bold"
                  >
                    <IconBan size={16} stroke={2} className="mr-1.5" />
                    Sanction Content
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Sanction Modal */}
      {sanctioningReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-rose-50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white">
                  <IconBan size={20} stroke={2} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Execute Community Policy Sanction</h3>
                  <span className="text-[11px] text-rose-700 font-semibold">{sanctioningReport.id} • {sanctioningReport.authorName}</span>
                </div>
              </div>
              <button
                onClick={() => setSanctioningReport(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4.5 text-xs">
              {/* Select Policy Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Violation Policy Reason <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'SPAM', label: 'Commercial Spam & Phishing Scam', desc: 'Promoting unverified crypto, financial schemes, or link spam' },
                    { id: 'HARASSMENT', label: 'Harassment & Targeted Bullying', desc: 'Threats, discriminatory remarks, or personal attacks' },
                    { id: 'INAPPROPRIATE_LANGUAGE', label: 'Inappropriate Language in Academic Forum', desc: 'Vulgarity, explicit profanity, or defamatory statements' },
                    { id: 'ACADEMIC_MISCONDUCT', label: 'Academic Misconduct & Exam Cheating', desc: 'Selling assignments, source codes, or exam leaks' },
                    { id: 'IMPERSONATION', label: 'Impersonation of University Personnel', desc: 'Falsely claiming leadership, faculty, or alumni credentials' },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        selectedReason === opt.id
                          ? 'border-rose-500 bg-rose-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="violation_reason"
                        value={opt.id}
                        checked={selectedReason === opt.id}
                        onChange={() => setSelectedReason(opt.id as ViolationReason)}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{opt.label}</span>
                        <span className="text-[10px] text-slate-500">{opt.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Select Penalty */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Penalty / Enforcement Action <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'HIDE_POST', label: 'Hide Post', desc: 'Suppress from feed' },
                    { id: 'ISSUE_STRIKE', label: 'Issue User Strike', desc: 'Formal warning strike' },
                    { id: 'REQUEST_EDIT', label: 'Request Edit', desc: 'Notify author to revise' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPenalty(p.id as PenaltyAction)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedPenalty === p.id
                          ? 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-200'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-bold block text-xs">{p.label}</span>
                      <span className="text-[10px] text-slate-500 leading-tight">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Moderator Justification Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Moderator Audit Justification (Recorded in log)
                </label>
                <textarea
                  value={modNotes}
                  onChange={(e) => setModNotes(e.target.value)}
                  placeholder="Explain why this sanction was applied according to FPT Community Guidelines..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-[#F1F5F9] p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSanctioningReport(null)}
                className="h-9 border-slate-200 text-slate-700"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteSanction}
                className="h-9 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4"
              >
                <IconBan size={16} stroke={2} className="mr-1.5" />
                Confirm Sanction
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsManagementPage
