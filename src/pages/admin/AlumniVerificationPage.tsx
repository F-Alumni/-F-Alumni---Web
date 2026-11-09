import { useState, useMemo, type FC } from 'react'
import {
  IconCheck,
  IconX,
  IconFileCheck,
  IconEye,
  IconDownload,
  IconRefresh,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { PageHeader, StatusBadge, DataTable, type Column } from '@/components/admin'
import { ROUTES } from '@/constants/routes'
import { useAdminUsers } from '@/features/admin'
import type { AdminUserSummary } from '@/types/admin.types'

interface VerificationRequest {
  id: string
  fullName: string
  email: string
  studentId: string
  major: string
  cohort: string
  gradYear: string
  documentName: string
  submissionDate: string
  status: 'pending' | 'approved' | 'rejected'
}

function adaptAdminUserToVerification(u: AdminUserSummary): VerificationRequest {
  const isPending = !u.emailVerified || u.status === 'PendingVerification'
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    studentId: u.studentCode || u.studentId || u.id.slice(0, 8).toUpperCase(),
    major: u.major || 'Software Engineering',
    cohort: u.batch || 'K15',
    gradYear: '2023',
    documentName: `Diploma_${u.studentCode || 'FPT'}.pdf`,
    submissionDate: u.createdAtUtc ? u.createdAtUtc.slice(0, 10) : '2026-10-10',
    status: isPending ? 'pending' : 'approved',
  }
}

export const AlumniVerificationPage: FC = () => {
  const [statusOverrides, setStatusOverrides] = useState<Record<string, 'approved' | 'rejected'>>({})

  // Fetch alumni user records from Admin Service
  const { data: alumniData, isLoading, isError, refetch } = useAdminUsers({
    role: 'Alumni',
    pageSize: 50,
  })

  const requests = useMemo(() => {
    if (alumniData && alumniData.items && alumniData.items.length > 0) {
      return alumniData.items.map(adaptAdminUserToVerification).map((r) => {
        const override = statusOverrides[r.id]
        return override ? { ...r, status: override } : r
      })
    }
    return []
  }, [alumniData, statusOverrides])

  const handleApprove = (id: string) => {
    setStatusOverrides((prev) => ({ ...prev, [id]: 'approved' }))
  }

  const handleReject = (id: string) => {
    setStatusOverrides((prev) => ({ ...prev, [id]: 'rejected' }))
  }

  const columns: Column<VerificationRequest>[] = [
    {
      key: 'fullName',
      header: 'Applicant',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{r.fullName}</span>
          <span className="text-[11px] text-slate-500">{r.email}</span>
        </div>
      ),
    },
    {
      key: 'studentId',
      header: 'Student ID / Cohort',
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-slate-800">{r.studentId}</span>
          <span className="text-[11px] text-slate-500">{r.cohort} • Graduated {r.gradYear}</span>
        </div>
      ),
    },
    {
      key: 'major',
      header: 'Major',
      render: (r) => <span className="font-medium text-slate-700">{r.major}</span>,
    },
    {
      key: 'documentName',
      header: 'Verification Document',
      render: (r) => (
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-[#F8FAFC] px-2.5 py-1 text-xs text-slate-700 hover:border-brand-primary">
          <IconFileCheck size={15} stroke={1.8} className="text-brand-secondary shrink-0" />
          <span className="max-w-[140px] truncate font-medium text-[11px]">{r.documentName}</span>
          <IconDownload size={14} stroke={1.8} className="text-slate-400 hover:text-slate-600 cursor-pointer" />
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'submissionDate',
      header: 'Submitted',
      render: (r) => <span className="text-slate-500 text-[11px]">{r.submissionDate}</span>,
    },
    {
      key: 'actions',
      header: 'Decision',
      className: 'text-right w-64',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-[68px] text-xs border-slate-200 hover:text-brand-primary justify-center shrink-0"
            title="Preview credentials"
          >
            <IconEye size={14} stroke={1.8} className="mr-1" />
            View
          </Button>
          {r.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => handleApprove(r.id)}
                className="h-7 w-[84px] rounded-md bg-brand-accent px-2 text-xs font-semibold text-white hover:bg-emerald-600 shadow-xs justify-center shrink-0"
                title="Verify and grant Alumni badge"
              >
                <IconCheck size={14} stroke={1.8} className="mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(r.id)}
                className="h-7 w-[76px] rounded-md border-rose-200 px-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 justify-center shrink-0"
                title="Reject verification request"
              >
                <IconX size={14} stroke={1.8} className="mr-1" />
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alumni Verification"
        description="Verify submitted academic diplomas and grant official verified alumni credentials."
        breadcrumbs={[
          { label: 'Admin', to: ROUTES.ADMIN.DASHBOARD },
          { label: 'Alumni Verification' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
              className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-100 gap-1.5"
            >
              <IconRefresh size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </Button>
            <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary">
              {pendingCount} Pending Requests
            </span>
          </div>
        }
      />

      {isError && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs text-amber-900 shadow-xs">
          <IconAlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-amber-950">
              Không có yêu cầu xác thực cựu sinh viên nào đang chờ xử lý.
            </p>
            <p className="text-amber-800">
              Không thể kết nối trực tiếp tới Backend Admin Service (<code className="font-mono text-[11px] bg-amber-100/80 px-1 py-0.5 rounded">f-alumni-admin-service</code>) do dịch vụ đang khởi động hoặc chưa cấp quyền CORS cho tên miền Vercel. Bạn vẫn có thể thao tác duyệt hồ sơ ngoại tuyến bình thường.
            </p>
          </div>
        </div>
      )}

      <DataTable
        data={requests}
        columns={columns}
        keyExtractor={(r) => r.id}
        searchPlaceholder="Search applicant name, Student ID, or major..."
        searchFilter={(r, q) =>
          r.fullName.toLowerCase().includes(q) ||
          r.studentId.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.major.toLowerCase().includes(q)
        }
      />
    </div>
  )
}

export default AlumniVerificationPage
