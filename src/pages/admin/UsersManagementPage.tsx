import { useState, type FC } from 'react'
import { UserCheck, Shield, Filter, UserX, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { PageHeader, StatusBadge, DataTable, type Column } from '@/components/admin'
import { ROUTES } from '@/constants/routes'

interface UserRecord {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'ALUMNI' | 'ADMIN' | 'FACULTY'
  campus: string
  major: string
  status: 'active' | 'pending' | 'banned'
  joinedDate: string
}

export const UsersManagementPage: FC = () => {
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [campusFilter, setCampusFilter] = useState<string>('ALL')

  const initialUsers: UserRecord[] = [
    {
      id: 'USR-001',
      name: 'Maya Lin',
      email: 'linm@fpt.edu.vn',
      role: 'STUDENT',
      campus: 'Hoa Lac',
      major: 'Software Engineering',
      status: 'active',
      joinedDate: '2023-09-15',
    },
    {
      id: 'USR-002',
      name: 'Minh Hoang',
      email: 'hoang.minh@alumni.fpt.edu.vn',
      role: 'ALUMNI',
      campus: 'Ho Chi Minh',
      major: 'AI & Robotics',
      status: 'active',
      joinedDate: '2020-08-10',
    },
    {
      id: 'USR-003',
      name: 'Dang Tran Hoang',
      email: 'hoangdt@alumni.fpt.edu.vn',
      role: 'ALUMNI',
      campus: 'Da Nang',
      major: 'Software Engineering',
      status: 'pending',
      joinedDate: '2026-10-08',
    },
    {
      id: 'USR-004',
      name: 'Dr. Le Van Phuc',
      email: 'phuclv@fe.edu.vn',
      role: 'FACULTY',
      campus: 'Hoa Lac',
      major: 'Information Security',
      status: 'active',
      joinedDate: '2019-01-20',
    },
    {
      id: 'USR-005',
      name: 'Spam Account Test',
      email: 'promo123@tempmail.org',
      role: 'STUDENT',
      campus: 'Can Tho',
      major: 'Business Admin',
      status: 'banned',
      joinedDate: '2026-10-01',
    },
  ]

  const filteredUsers = initialUsers.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false
    if (campusFilter !== 'ALL' && u.campus !== campusFilter) return false
    return true
  })

  const columns: Column<UserRecord>[] = [
    {
      key: 'name',
      header: 'User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar fallback={u.name.slice(0, 2).toUpperCase()} size="sm" />
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">{u.name}</span>
            <span className="text-[11px] text-slate-500">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      className: 'text-center w-36',
      render: (u) => {
        const roleStyles = {
          STUDENT: 'bg-sky-50 text-brand-secondary border-sky-200',
          ALUMNI: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
          FACULTY: 'bg-emerald-50 text-brand-accent border-emerald-200',
          ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
        }
        return (
          <span className={`inline-flex items-center justify-center gap-1 rounded-md border px-2.5 py-0.5 text-[11px] font-bold min-w-[84px] ${roleStyles[u.role]}`}>
            {u.role === 'ADMIN' && <Shield className="h-3 w-3" />}
            {u.role === 'ALUMNI' && <UserCheck className="h-3 w-3" />}
            <span>{u.role}</span>
          </span>
        )
      },
    },
    {
      key: 'campus',
      header: 'Campus / Major',
      className: 'w-60',
      render: (u) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-800">{u.campus} Campus</span>
          <span className="text-[11px] text-slate-400">{u.major}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'text-center w-36',
      render: (u) => <StatusBadge status={u.status} />,
    },
    {
      key: 'joinedDate',
      header: 'Joined Date',
      className: 'text-center w-36',
      render: (u) => <span className="font-mono text-slate-500 text-[11px]">{u.joinedDate}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-center w-56',
      render: (u) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-[72px] text-xs border-slate-200 hover:text-brand-primary justify-center shrink-0"
            title="Inspect record"
          >
            Details
          </Button>
          {u.status === 'banned' ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-[96px] text-xs border-slate-200 text-emerald-600 hover:bg-emerald-50 justify-center shrink-0"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reactivate
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-[96px] text-xs border-slate-200 text-rose-600 hover:bg-rose-50 justify-center shrink-0"
            >
              <UserX className="h-3 w-3 mr-1" />
              Suspend
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Oversee user accounts, role allocations, campus memberships, and security statuses."
        breadcrumbs={[
          { label: 'Admin', to: ROUTES.ADMIN.DASHBOARD },
          { label: 'User Management' },
        ]}
      />

      <DataTable
        data={filteredUsers}
        columns={columns}
        keyExtractor={(u) => u.id}
        searchPlaceholder="Search by name, email or campus..."
        searchFilter={(u, q) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.campus.toLowerCase().includes(q)
        }
        filterSlot={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              <span>Role:</span>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-[#F1F5F9] px-2.5 text-xs text-slate-700 focus:border-brand-primary focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="ALUMNI">Alumni</option>
              <option value="FACULTY">Faculty</option>
              <option value="ADMIN">Admins</option>
            </select>

            <select
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-[#F1F5F9] px-2.5 text-xs text-slate-700 focus:border-brand-primary focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Campuses</option>
              <option value="Hoa Lac">Hoa Lac</option>
              <option value="Ho Chi Minh">Ho Chi Minh</option>
              <option value="Da Nang">Da Nang</option>
              <option value="Can Tho">Can Tho</option>
            </select>
          </div>
        }
      />
    </div>
  )
}

export default UsersManagementPage
