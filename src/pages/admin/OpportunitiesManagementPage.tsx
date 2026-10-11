import { useState, type FC } from 'react'
import {
  IconPlus,
  IconBriefcase,
  IconSchool,
  IconBuilding,
  IconMapPin,
  IconEye,
  IconCheck,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { PageHeader, StatusBadge, DataTable, type Column } from '@/components/admin'
import { ROUTES } from '@/constants/routes'

interface OpportunityRecord {
  id: string
  title: string
  company: string
  type: 'JOB' | 'INTERNSHIP' | 'SCHOLARSHIP'
  location: string
  postedBy: string
  applicantsCount: number
  status: 'active' | 'pending' | 'inactive'
  deadline: string
}

export const OpportunitiesManagementPage: FC = () => {
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([
    {
      id: 'OPP-01',
      title: 'Junior React & Node.js Engineer',
      company: 'FPT Software Da Nang',
      type: 'JOB',
      location: 'Da Nang (F-Complex)',
      postedBy: 'Hoang Minh (K12 SE)',
      applicantsCount: 42,
      status: 'active',
      deadline: '2026-11-15',
    },
    {
      id: 'OPP-02',
      title: 'AI Research Assistant (Spring 2026 OJT)',
      company: 'FPT AI Lab',
      type: 'INTERNSHIP',
      location: 'Hanoi (Hoa Lac Campus)',
      postedBy: 'Dr. Le Van Phuc',
      applicantsCount: 18,
      status: 'active',
      deadline: '2026-10-30',
    },
    {
      id: 'OPP-03',
      title: 'FPT Alumni Global Master Fellowship 2026',
      company: 'FPT University Global Alumni Fund',
      type: 'SCHOLARSHIP',
      location: 'Tokyo, Japan',
      postedBy: 'Tokyo Alumni Chapter',
      applicantsCount: 7,
      status: 'pending',
      deadline: '2026-12-01',
    },
  ])

  const columns: Column<OpportunityRecord>[] = [
    {
      key: 'title',
      header: 'Opportunity Title & Company',
      render: (o) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{o.title}</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
            <IconBuilding size={14} stroke={1.8} className="text-slate-400" />
            {o.company}
          </span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (o) => {
        const types = {
          JOB: { label: 'Full-time Job', icon: IconBriefcase, color: 'text-brand-primary bg-orange-50' },
          INTERNSHIP: { label: 'OJT / Internship', icon: IconBuilding, color: 'text-brand-secondary bg-sky-50' },
          SCHOLARSHIP: { label: 'Scholarship', icon: IconSchool, color: 'text-brand-accent bg-emerald-50' },
        }
        const cfg = types[o.type]
        const Icon = cfg.icon
        return (
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${cfg.color}`}>
            <Icon size={14} stroke={1.8} />
            {cfg.label}
          </span>
        )
      },
    },
    {
      key: 'location',
      header: 'Location',
      render: (o) => (
        <span className="inline-flex items-center gap-1 text-slate-600">
          <IconMapPin size={14} stroke={1.8} className="text-slate-400" />
          <span>{o.location}</span>
        </span>
      ),
    },
    {
      key: 'applicantsCount',
      header: 'Applications',
      render: (o) => (
        <span className="font-semibold text-slate-800">{o.applicantsCount} candidates</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (o) => <span className="text-slate-500 text-[11px]">{o.deadline}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (o) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-slate-200 hover:text-brand-primary"
          >
            <IconEye size={14} stroke={1.8} className="mr-1" />
            View
          </Button>
          {o.status === 'pending' && (
            <Button
              size="sm"
              onClick={() =>
                setOpportunities((prev) =>
                  prev.map((item) =>
                    item.id === o.id ? { ...item, status: 'active' } : item
                  )
                )
              }
              className="h-7 rounded-md bg-brand-accent px-2.5 text-xs font-semibold text-white hover:bg-emerald-600"
            >
              <IconCheck size={14} stroke={1.8} className="mr-1" />
              Approve
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunity Management"
        description="Verify and coordinate career listings, OJT internships, and graduate scholarship grants."
        breadcrumbs={[
          { label: 'Admin', to: ROUTES.ADMIN.DASHBOARD },
          { label: 'Opportunity Management' },
        ]}
        actions={
          <Button className="h-9 rounded-lg bg-brand-primary px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-primary-hover">
            <IconPlus size={16} stroke={1.8} className="mr-1.5" />
            <span>Post Opportunity</span>
          </Button>
        }
      />

      <DataTable
        data={opportunities}
        columns={columns}
        keyExtractor={(o) => o.id}
        searchPlaceholder="Search opportunities by title or company..."
        searchFilter={(o, q) =>
          o.title.toLowerCase().includes(q) || o.company.toLowerCase().includes(q)
        }
      />
    </div>
  )
}

export default OpportunitiesManagementPage
