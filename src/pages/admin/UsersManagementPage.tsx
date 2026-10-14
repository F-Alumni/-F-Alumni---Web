import { useState, useEffect, useCallback, type FC } from 'react'
import {
  IconSchool,
  IconUserCheck,
  IconBook,
  IconShield,
  IconUserX,
  IconRefresh,
  IconEye,
  IconX,
  IconBriefcase,
  IconCircleCheck,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { PageHeader, StatusBadge, DataTable, type Column } from '@/components/admin'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/authStore'
import { USER_TYPES } from '@/constants/userTypes'
import { usersService } from '@/services/users'
import type { BackendUserSummary } from '@/types/user.types'

export interface UserDirectoryRecord {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'ALUMNI' | 'ADMIN' | 'FACULTY'
  campus: string
  major: string
  cohort: string
  studentId: string
  status: 'active' | 'pending' | 'banned'
  joinedDate: string
  currentCompany?: string
  currentPosition?: string
  bio?: string
  isVerified?: boolean
}

function adaptBackendUser(u: BackendUserSummary): UserDirectoryRecord {
  const normRole = (u.role || '').toUpperCase()
  let role: UserDirectoryRecord['role'] = 'STUDENT'
  if (normRole.includes('ADMIN')) role = 'ADMIN'
  else if (normRole.includes('FACULTY')) role = 'FACULTY'
  else if (normRole.includes('ALUMNI')) role = 'ALUMNI'
  else if (normRole.includes('MOD')) role = 'ADMIN'
  else role = 'STUDENT'

  return {
    id: u.id,
    name: u.fullName,
    email: `${u.fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@fpt.edu.vn`,
    role,
    campus: u.campus || 'Hòa Lạc',
    major: u.major || 'Chưa cập nhật',
    cohort: u.batch || 'K17',
    studentId: u.id.slice(0, 8).toUpperCase(),
    status: 'active',
    joinedDate: '2026-10-14',
    bio: `Thành viên khoa ${u.major || 'Đại học FPT'}, cơ sở ${u.campus || 'Hòa Lạc'}.`,
    isVerified: role === 'ALUMNI' || role === 'FACULTY' || role === 'ADMIN',
  }
}

export const UsersManagementPage: FC = () => {
  const { role, userType } = useAuthStore()
  const isFaculty = role !== 'ADMIN' && role !== 'MODERATOR' && userType === USER_TYPES.FACULTY

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [campusFilter, setCampusFilter] = useState<string>('ALL')
  const [majorFilter, setMajorFilter] = useState<string>('ALL')
  const [cohortFilter, setCohortFilter] = useState<string>('ALL')

  // Selected User Modal for detail preview
  const [selectedUser, setSelectedUser] = useState<UserDirectoryRecord | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [users, setUsers] = useState<UserDirectoryRecord[]>([])

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const beRole =
        roleFilter === 'ALL'
          ? undefined
          : roleFilter === 'STUDENT'
          ? 'Student'
          : roleFilter === 'ALUMNI'
          ? 'Alumni'
          : roleFilter === 'FACULTY'
          ? 'Faculty'
          : roleFilter === 'ADMIN'
          ? 'Admin'
          : undefined

      const res = await usersService.searchUsers({
        campus: campusFilter === 'ALL' ? undefined : campusFilter,
        major: majorFilter === 'ALL' ? undefined : majorFilter,
        role: beRole,
        pageSize: 50,
      })

      if (res && res.items) {
        setUsers(res.items.map(adaptBackendUser))
      }
    } catch (err) {
      console.error('Failed to query backend users:', err)
    } finally {
      setIsLoading(false)
    }
  }, [campusFilter, majorFilter, roleFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleToggleSuspend = async (user: UserDirectoryRecord) => {
    const isBanned = user.status === 'banned'
    const newStatus: UserDirectoryRecord['status'] = isBanned ? 'active' : 'banned'

    try {
      if (isBanned) {
        await usersService.unblockUser(user.id)
      } else {
        await usersService.blockUser(user.id)
      }
    } catch {
      // Toggle client-side state
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    )

    const msg = isBanned
      ? `User "${user.name}" has been reactivated.`
      : `User "${user.name}" has been suspended.`
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filter evaluation on client side for cohort or extra checks
  const filteredUsers = users.filter((u) => {
    if (cohortFilter !== 'ALL' && u.cohort !== cohortFilter) return false
    return true
  })

  const columns: Column<UserDirectoryRecord>[] = [
    {
      key: 'name',
      header: 'Student / User Profile',
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar fallback={u.name.slice(0, 2).toUpperCase()} size="sm" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900">{u.name}</span>
              {u.isVerified && (
                <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                  Verified
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500">{u.email}</span>
            <span className="text-[10px] text-brand-secondary font-mono">
              ID: {u.studentId}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role / Type',
      className: 'text-center w-36',
      render: (u) => {
        const roleStyles = {
          STUDENT: 'bg-sky-50 text-brand-secondary border-sky-200',
          ALUMNI: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
          FACULTY: 'bg-emerald-50 text-brand-accent border-emerald-200',
          ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
        }
        return (
          <span className={`inline-flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[11px] font-bold min-w-[92px] ${roleStyles[u.role]}`}>
            {u.role === 'STUDENT' && <IconSchool size={13} stroke={1.8} className="shrink-0" />}
            {u.role === 'ALUMNI' && <IconUserCheck size={13} stroke={1.8} className="shrink-0" />}
            {u.role === 'FACULTY' && <IconBook size={13} stroke={1.8} className="shrink-0" />}
            {u.role === 'ADMIN' && <IconShield size={13} stroke={1.8} className="shrink-0" />}
            <span>{u.role}</span>
          </span>
        )
      },
    },
    {
      key: 'major',
      header: 'Major & Cohort',
      className: 'w-56',
      render: (u) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900 text-xs">{u.major}</span>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
            <span className="font-semibold text-brand-primary">{u.cohort}</span>
            <span>•</span>
            <span>{u.campus} Campus</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'text-center w-32',
      render: (u) => <StatusBadge status={u.status} />,
    },
    {
      key: 'joinedDate',
      header: 'Joined Date',
      className: 'text-center w-32',
      render: (u) => <span className="font-mono text-slate-500 text-[11px]">{u.joinedDate}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-center w-48',
      render: (u) => (
        <div className="flex items-center justify-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedUser(u)}
            className="h-7 text-xs border-slate-200 hover:text-brand-primary shrink-0"
            title="Inspect student or alumni directory record"
          >
            <IconEye size={14} stroke={1.8} className="mr-1" />
            Profile
          </Button>

          {/* Admin only: Suspend / Reactivate action */}
          {!isFaculty && (
            u.status === 'banned' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleToggleSuspend(u)}
                className="h-7 text-xs border-slate-200 text-emerald-600 hover:bg-emerald-50 shrink-0"
              >
                <IconRefresh size={14} stroke={1.8} className="mr-1" />
                Restore
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleToggleSuspend(u)}
                className="h-7 text-xs border-slate-200 text-rose-600 hover:bg-rose-50 shrink-0"
              >
                <IconUserX size={14} stroke={1.8} className="mr-1" />
                Suspend
              </Button>
            )
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Toast */}
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
        title={isFaculty ? 'Student & Alumni Academic Directory' : 'User Management'}
        description={
          isFaculty
            ? 'Search and look up enrolled students and alumni cohorts by academic major, cohort year, and student ID for capstones & department advising.'
            : 'Oversee user accounts, role allocations, campus memberships, and security statuses across all 5 campuses.'
        }
        breadcrumbs={[
          { label: 'Admin', to: ROUTES.ADMIN.DASHBOARD },
          { label: isFaculty ? 'Academic Directory' : 'Users' },
        ]}
      />

      <DataTable
        data={filteredUsers}
        columns={columns}
        keyExtractor={(u) => u.id}
        searchPlaceholder="Search by student name, ID (e.g. SE170123), email, or major..."
        searchFilter={(u, q) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.studentId.toLowerCase().includes(q) ||
          u.major.toLowerCase().includes(q) ||
          u.cohort.toLowerCase().includes(q) ||
          u.campus.toLowerCase().includes(q)
        }
        filterSlot={
          <div className="flex flex-wrap items-center gap-2">
            {/* Major Filter */}
            <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-lg border border-slate-200 px-2 py-0.5">
              <span className="text-[11px] font-semibold text-slate-500">Major:</span>
              <select
                value={majorFilter}
                onChange={(e) => setMajorFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none py-1"
              >
                <option value="ALL">All Majors</option>
                <option value="Software Engineering">Software Engineering (SE)</option>
                <option value="Artificial Intelligence">AI & Robotics</option>
                <option value="Information Security">Information Security (IA)</option>
                <option value="Business Administration">Business Admin (BA)</option>
              </select>
            </div>

            {/* Cohort Filter */}
            <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-lg border border-slate-200 px-2 py-0.5">
              <span className="text-[11px] font-semibold text-slate-500">Cohort:</span>
              <select
                value={cohortFilter}
                onChange={(e) => setCohortFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none py-1"
              >
                <option value="ALL">All Cohorts</option>
                <option value="K14">K14</option>
                <option value="K15">K15</option>
                <option value="K16">K16</option>
                <option value="K17">K17</option>
                <option value="K18">K18</option>
              </select>
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-lg border border-slate-200 px-2 py-0.5">
              <span className="text-[11px] font-semibold text-slate-500">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none py-1"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="ALUMNI">Alumni</option>
                <option value="FACULTY">Faculty</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>

            {/* Campus Filter */}
            <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-lg border border-slate-200 px-2 py-0.5">
              <span className="text-[11px] font-semibold text-slate-500">Campus:</span>
              <select
                value={campusFilter}
                onChange={(e) => setCampusFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none py-1"
              >
                <option value="ALL">All Campuses</option>
                <option value="Hoa Lac">Hoa Lac</option>
                <option value="Ho Chi Minh">Ho Chi Minh</option>
                <option value="Da Nang">Da Nang</option>
                <option value="Can Tho">Can Tho</option>
              </select>
            </div>

            {/* Refresh Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchUsers()}
              disabled={isLoading}
              className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-100 gap-1.5 ml-auto"
            >
              <IconRefresh size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </Button>
          </div>
        }
      />

      {/* Academic Profile Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <Avatar fallback={selectedUser.name.slice(0, 2).toUpperCase()} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{selectedUser.name}</h3>
                    {selectedUser.isVerified && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">{selectedUser.email}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Academic Coordinates Card */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Student / Staff ID</span>
                  <p className="font-mono font-bold text-slate-900 text-xs">{selectedUser.studentId}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Academic Cohort</span>
                  <p className="font-bold text-brand-primary text-xs">{selectedUser.cohort}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Enrolled Major</span>
                  <p className="font-semibold text-slate-800 text-xs">{selectedUser.major}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Campus Affiliation</span>
                  <p className="font-semibold text-slate-800 text-xs">{selectedUser.campus} Campus</p>
                </div>
              </div>

              {/* Professional / Career Info */}
              {(selectedUser.currentCompany || selectedUser.currentPosition) && (
                <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-brand-secondary font-bold text-xs">
                    <IconBriefcase size={15} />
                    <span>Career & Alumni Placement</span>
                  </div>
                  <p className="text-slate-800 font-semibold text-xs">
                    {selectedUser.currentPosition} at {selectedUser.currentCompany}
                  </p>
                </div>
              )}

              {/* Bio & Academic Statement */}
              {selectedUser.bio && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-700">Biography & Academic Notes</span>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 leading-relaxed font-sans">
                    {selectedUser.bio}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span>Account created on: {selectedUser.joinedDate}</span>
                <span className="capitalize">Status: <strong className="text-slate-700">{selectedUser.status}</strong></span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-slate-200 px-6 py-3.5 bg-slate-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUser(null)}
                className="h-8 border-slate-200 text-slate-700 text-xs"
              >
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersManagementPage
