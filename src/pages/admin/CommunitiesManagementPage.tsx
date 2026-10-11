import { useState, type FC } from 'react'
import { IconPlus, IconUsers, IconWorld, IconLock } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { PageHeader, StatusBadge, DataTable, type Column } from '@/components/admin'
import { ROUTES } from '@/constants/routes'

interface CommunityRecord {
  id: string
  name: string
  category: 'ACADEMIC' | 'CAMPUS_CHAPTER' | 'CAREER' | 'STUDENT_CLUB'
  membersCount: number
  leader: string
  isPrivate: boolean
  status: 'active' | 'archived'
  createdAt: string
}

export const CommunitiesManagementPage: FC = () => {
  const [communities, setCommunities] = useState<CommunityRecord[]>([
    {
      id: 'COM-01',
      name: 'Software Engineering (SE) Alumni',
      category: 'ACADEMIC',
      membersCount: 4250,
      leader: 'Nguyen Van A (Admin)',
      isPrivate: false,
      status: 'active',
      createdAt: '2022-01-15',
    },
    {
      id: 'COM-02',
      name: 'FPT Alumni Tokyo Chapter',
      category: 'CAMPUS_CHAPTER',
      membersCount: 890,
      leader: 'Minh Hoang (K12)',
      isPrivate: true,
      status: 'active',
      createdAt: '2023-04-10',
    },
    {
      id: 'COM-03',
      name: 'AI & Machine Learning Innovators',
      category: 'CAREER',
      membersCount: 1680,
      leader: 'Dr. Le Van Phuc',
      isPrivate: false,
      status: 'active',
      createdAt: '2022-11-20',
    },
    {
      id: 'COM-04',
      name: 'Capstones Archive Spring 2024',
      category: 'ACADEMIC',
      membersCount: 340,
      leader: 'Faculty Academic Board',
      isPrivate: false,
      status: 'archived',
      createdAt: '2024-02-01',
    },
  ])

  const toggleStatus = (id: string) => {
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'active' ? 'archived' : 'active' }
          : c
      )
    )
  }

  const columns: Column<CommunityRecord>[] = [
    {
      key: 'name',
      header: 'Community Circle',
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary font-bold text-xs">
            {c.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">{c.name}</span>
            <span className="text-[11px] text-slate-500">Lead: {c.leader}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (c) => {
        const categories = {
          ACADEMIC: { label: 'Academic Major', color: 'text-brand-secondary bg-sky-50' },
          CAMPUS_CHAPTER: { label: 'Regional Chapter', color: 'text-brand-primary bg-orange-50' },
          CAREER: { label: 'Career Industry', color: 'text-brand-accent bg-emerald-50' },
          STUDENT_CLUB: { label: 'Student Club', color: 'text-purple-700 bg-purple-50' },
        }
        const cfg = categories[c.category]
        return (
          <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold ${cfg.color}`}>
            {cfg.label}
          </span>
        )
      },
    },
    {
      key: 'membersCount',
      header: 'Members',
      render: (c) => (
        <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
          <IconUsers size={14} stroke={1.8} className="text-slate-400" />
          <span>{c.membersCount.toLocaleString()}</span>
        </span>
      ),
    },
    {
      key: 'privacy',
      header: 'Visibility',
      render: (c) => (
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
          {c.isPrivate ? <IconLock size={14} stroke={1.8} className="text-amber-500" /> : <IconWorld size={14} stroke={1.8} className="text-slate-400" />}
          <span>{c.isPrivate ? 'Private' : 'Public'}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs border-slate-200 hover:text-brand-primary"
          >
            Manage
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleStatus(c.id)}
            className={`h-7 text-xs border-slate-200 ${
              c.status === 'active' ? 'text-slate-500 hover:text-slate-700' : 'text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            {c.status === 'active' ? 'Archive' : 'Restore'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Community Management"
        description="Govern academic hubs, global alumni chapters, and student interest circles."
        breadcrumbs={[
          { label: 'Admin', to: ROUTES.ADMIN.DASHBOARD },
          { label: 'Community Management' },
        ]}
        actions={
          <Button className="h-9 rounded-lg bg-brand-primary px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-primary-hover">
            <IconPlus size={16} stroke={1.8} className="mr-1.5" />
            <span>Create Community</span>
          </Button>
        }
      />

      <DataTable
        data={communities}
        columns={columns}
        keyExtractor={(c) => c.id}
        searchPlaceholder="Search communities by name or leader..."
        searchFilter={(c, q) =>
          c.name.toLowerCase().includes(q) || c.leader.toLowerCase().includes(q)
        }
      />
    </div>
  )
}

export default CommunitiesManagementPage
