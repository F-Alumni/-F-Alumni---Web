import { useState, type FC } from 'react'
import { IconCheck, IconX, IconFileCheck, IconEye, IconDownload } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { PageHeader, StatusBadge, DataTable, type Column } from '@/components/admin'
import { ROUTES } from '@/constants/routes'

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

export const AlumniVerificationPage: FC = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([
    {
      id: 'VER-001',
      fullName: 'Dang Tran Hoang',
      email: 'hoangdt@alumni.fpt.edu.vn',
      studentId: 'SE150392',
      major: 'Software Engineering (SE)',
      cohort: 'K15',
      gradYear: '2023',
      documentName: 'Bang_Tot_Nghiep_SE150392.pdf',
      submissionDate: '2026-10-10 14:32',
      status: 'pending',
    },
    {
      id: 'VER-002',
      fullName: 'Nguyen Quoc Dat',
      email: 'datnq@fpt.edu.vn',
      studentId: 'SE160982',
      major: 'Artificial Intelligence (AI)',
      cohort: 'K16',
      gradYear: '2024',
      documentName: 'ChungChi_TotNghiep_DatNQ.jpg',
      submissionDate: '2026-10-10 11:20',
      status: 'pending',
    },
    {
      id: 'VER-003',
      fullName: 'Tran Thi Mai Anh',
      email: 'maianh.tran@accenture.com',
      studentId: 'BA140221',
      major: 'International Business (IB)',
      cohort: 'K14',
      gradYear: '2022',
      documentName: 'FPT_Degree_TranThiMaiAnh.pdf',
      submissionDate: '2026-10-09 16:45',
      status: 'approved',
    },
    {
      id: 'VER-004',
      fullName: 'Pham Duc Thang',
      email: 'thang.dev99@gmail.com',
      studentId: 'IA130114',
      major: 'Information Assurance (IA)',
      cohort: 'K13',
      gradYear: '2021',
      documentName: 'Bang_Tam_Thoi_IA.png',
      submissionDate: '2026-10-08 09:12',
      status: 'rejected',
    },
  ])

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    )
  }

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    )
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
            <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary">
              {pendingCount} Pending Requests
            </span>
          </div>
        }
      />

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
