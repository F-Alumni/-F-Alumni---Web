import { useState, type FC, type FormEvent } from 'react'
import {
  IconPlus,
  IconUsers,
  IconWorld,
  IconLock,
  IconPin,
  IconPinned,
  IconX,
  IconCircleCheck,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { PageHeader, StatusBadge, DataTable, type Column } from '@/components/admin'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/authStore'
import { USER_TYPES } from '@/constants/userTypes'

export interface CommunityRecord {
  id: string
  name: string
  category: 'ACADEMIC' | 'CAMPUS_CHAPTER' | 'CAREER' | 'STUDENT_CLUB'
  membersCount: number
  leader: string
  isPrivate: boolean
  status: 'active' | 'archived'
  createdAt: string
  pinnedAnnouncement?: {
    title: string
    body: string
    pinnedBy: string
    duration: string
    expiresAt: string
  }
}

export const CommunitiesManagementPage: FC = () => {
  const { role, userType, currentUser } = useAuthStore()
  const isFaculty = role !== 'ADMIN' && role !== 'MODERATOR' && userType === USER_TYPES.FACULTY

  // Pin Announcement Modal State
  const [pinTargetCommunity, setPinTargetCommunity] = useState<CommunityRecord | null>(null)
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [announcementBody, setAnnouncementBody] = useState('')
  const [pinDuration, setPinDuration] = useState('30 days')
  const [departmentBadge, setDepartmentBadge] = useState('Khoa Kỹ Thuật Phần Mềm (SE)')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [communities, setCommunities] = useState<CommunityRecord[]>([
    {
      id: 'COM-01',
      name: 'Software Engineering (SE) Alumni & Students',
      category: 'ACADEMIC',
      membersCount: 4250,
      leader: 'Nguyen Van A (Admin)',
      isPrivate: false,
      status: 'active',
      createdAt: '2022-01-15',
      pinnedAnnouncement: {
        title: 'Fall 2026 Capstone Project Guidelines & External Jury Schedule',
        body: 'All graduating teams must submit final reports to the department office by Nov 15.',
        pinnedBy: 'Dr. Nguyen Van Faculty',
        duration: 'Until Capstone Defense',
        expiresAt: '2026-11-30',
      },
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

  const handleOpenPinModal = (comm: CommunityRecord) => {
    setPinTargetCommunity(comm)
    if (comm.pinnedAnnouncement) {
      setAnnouncementTitle(comm.pinnedAnnouncement.title)
      setAnnouncementBody(comm.pinnedAnnouncement.body)
      setPinDuration(comm.pinnedAnnouncement.duration)
    } else {
      setAnnouncementTitle('Official Department Notice: ')
      setAnnouncementBody('')
      setPinDuration('30 days')
    }
  }

  const handleSavePinAnnouncement = (e: FormEvent) => {
    e.preventDefault()
    if (!pinTargetCommunity) return

    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === pinTargetCommunity.id) {
          return {
            ...c,
            pinnedAnnouncement: {
              title: announcementTitle.trim(),
              body: announcementBody.trim(),
              pinnedBy: currentUser?.name || 'Faculty Coordinator',
              duration: pinDuration,
              expiresAt: '2026-12-31',
            },
          }
        }
        return c
      })
    )

    setToastMessage(`Department Announcement pinned to "${pinTargetCommunity.name}"!`)
    setTimeout(() => setToastMessage(null), 3500)
    setPinTargetCommunity(null)
  }

  const handleUnpinAnnouncement = (id: string) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinnedAnnouncement: undefined } : c))
    )
    setToastMessage('Announcement unpinned from community.')
    setTimeout(() => setToastMessage(null), 3000)
    setPinTargetCommunity(null)
  }

  const columns: Column<CommunityRecord>[] = [
    {
      key: 'name',
      header: 'Community Circle',
      render: (c) => (
        <div className="flex items-center gap-2.5 max-w-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary font-bold text-xs">
            {c.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-900 line-clamp-1">{c.name}</span>
            <span className="text-[11px] text-slate-500">Lead: {c.leader}</span>
            {c.pinnedAnnouncement && (
              <div className="mt-1 flex items-center gap-1 text-[10px] text-brand-primary font-semibold bg-orange-50 border border-brand-primary/20 rounded-md px-1.5 py-0.5 line-clamp-1">
                <IconPinned size={12} className="shrink-0" />
                <span className="truncate">Pinned: {c.pinnedAnnouncement.title}</span>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (c) => {
        const categories = {
          ACADEMIC: { label: 'Academic Major', color: 'text-brand-secondary bg-sky-50 border-sky-200' },
          CAMPUS_CHAPTER: { label: 'Regional Chapter', color: 'text-brand-primary bg-orange-50 border-orange-200' },
          CAREER: { label: 'Career Industry', color: 'text-brand-accent bg-emerald-50 border-emerald-200' },
          STUDENT_CLUB: { label: 'Student Club', color: 'text-purple-700 bg-purple-50 border-purple-200' },
        }
        const cfg = categories[c.category]
        return (
          <span className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-semibold ${cfg.color}`}>
            {cfg.label}
          </span>
        )
      },
    },
    {
      key: 'membersCount',
      header: 'Members',
      render: (c) => (
        <span className="inline-flex items-center gap-1 font-semibold text-slate-800 text-xs">
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
          {c.isPrivate ? (
            <IconLock size={14} stroke={1.8} className="text-amber-500" />
          ) : (
            <IconWorld size={14} stroke={1.8} className="text-slate-400" />
          )}
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
          {/* Faculty & Admin: Pin Department Announcement Action */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenPinModal(c)}
            className={`h-7 text-xs border transition-colors ${
              c.pinnedAnnouncement
                ? 'border-brand-primary/30 bg-orange-50 text-brand-primary hover:bg-orange-100 font-bold'
                : 'border-slate-200 text-slate-700 hover:text-brand-primary'
            }`}
            title="Pin official departmental announcement to top of community"
          >
            {c.pinnedAnnouncement ? (
              <>
                <IconPinned size={14} stroke={2} className="mr-1 text-brand-primary" />
                <span>Pinned</span>
              </>
            ) : (
              <>
                <IconPin size={14} stroke={1.8} className="mr-1 text-slate-500" />
                <span>Pin Notice</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleStatus(c.id)}
            className={`h-7 text-xs border-slate-200 ${
              c.status === 'active'
                ? 'text-slate-500 hover:text-slate-700'
                : 'text-emerald-600 hover:bg-emerald-50'
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
        title={isFaculty ? 'Academic Communities & Department Hubs' : 'Community Management'}
        description={
          isFaculty
            ? 'Coordinate department student and alumni communities, pin official capstone notices, and publish course updates.'
            : 'Govern academic hubs, global alumni chapters, and student interest circles.'
        }
        breadcrumbs={[
          { label: 'Admin', to: ROUTES.ADMIN.DASHBOARD },
          { label: 'Community Management' },
        ]}
        actions={
          <Button className="h-9 rounded-lg bg-brand-primary px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-primary-hover flex items-center gap-1.5">
            <IconPlus size={16} stroke={2} />
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

      {/* MODAL: Pin Department Announcement (Faculty & Admin) */}
      {pinTargetCommunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-orange-50/70">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white">
                  <IconPin size={20} stroke={2} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pin Department Announcement</h3>
                  <span className="text-[11px] text-slate-500 truncate block max-w-xs">
                    Target: {pinTargetCommunity.name}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPinTargetCommunity(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePinAnnouncement} className="p-6 space-y-4 text-xs">
              {/* Department Affiliation Badge */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Department Affiliation Badge
                </label>
                <input
                  type="text"
                  value={departmentBadge}
                  onChange={(e) => setDepartmentBadge(e.target.value)}
                  placeholder="e.g. Khoa Kỹ Thuật Phần Mềm (SE)"
                  className="w-full rounded-xl border border-slate-200 bg-[#F1F5F9] px-3.5 py-2 text-xs text-slate-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                />
              </div>

              {/* Announcement Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Announcement Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. Capstone Defense Review Dates & Submission Deadline"
                  className="w-full rounded-xl border border-slate-200 bg-[#F1F5F9] px-3.5 py-2 text-xs text-slate-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                />
              </div>

              {/* Pin Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Pin Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '7 days', label: '7 Days' },
                    { id: '30 days', label: '30 Days' },
                    { id: 'Until Capstone Defense', label: 'Until Defense' },
                  ].map((dur) => (
                    <button
                      key={dur.id}
                      type="button"
                      onClick={() => setPinDuration(dur.id)}
                      className={`p-2 rounded-xl border text-center font-semibold transition-all ${
                        pinDuration === dur.id
                          ? 'border-brand-primary bg-orange-50 text-brand-primary ring-2 ring-brand-primary/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Body */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Notice Details & Instructions <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={announcementBody}
                  onChange={(e) => setAnnouncementBody(e.target.value)}
                  placeholder="Official instructions for students and alumni regarding evaluation criteria, links, or contact faculty..."
                  className="w-full rounded-xl border border-slate-200 bg-[#F1F5F9] p-3 text-xs text-slate-900 focus:border-brand-primary focus:bg-white focus:outline-none"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {pinTargetCommunity.pinnedAnnouncement ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnpinAnnouncement(pinTargetCommunity.id)}
                    className="h-9 border-rose-200 text-rose-600 hover:bg-rose-50 text-xs"
                  >
                    Unpin Current Notice
                  </Button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPinTargetCommunity(null)}
                    className="h-9 border-slate-200 text-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold px-4"
                  >
                    <IconPin size={15} stroke={2} className="mr-1.5" />
                    Save & Pin Notice
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommunitiesManagementPage
