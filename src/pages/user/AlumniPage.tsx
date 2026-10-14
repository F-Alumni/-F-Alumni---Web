import { useState, useEffect, useCallback, type FC } from 'react'
import {
  IconSearch,
  IconUserCheck,
  IconMessageCircle,
  IconSchool,
  IconBuildingCommunity,
  IconCalendar,
  IconLoader2,
  IconRefresh,
  IconCheck,
  IconShieldX,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { ROUTES } from '@/constants/routes'
import { usersService } from '@/services/users'
import { chatService } from '@/services/chat'
import { useAuthStore } from '@/stores/authStore'
import type { BackendUserSummary } from '@/types/user.types'

export const AlumniPage: FC = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()

  const [alumniList, setAlumniList] = useState<BackendUserSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [campus, setCampus] = useState('ALL')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const fetchAlumni = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await usersService.searchUsers({
        role: 'Alumni',
        keyword: keyword || undefined,
        campus: campus === 'ALL' ? undefined : campus,
        pageSize: 50,
      })

      // Filter out self if current user is an alumni
      const items = (res?.items || []).filter((u) => u.id !== currentUser?.id)
      setAlumniList(items)
    } catch (err) {
      console.error('Failed to query alumni list:', err)
    } finally {
      setIsLoading(false)
    }
  }, [keyword, campus, currentUser?.id])

  useEffect(() => {
    fetchAlumni()
  }, [fetchAlumni])

  const handleStartChat = async (targetUser: BackendUserSummary) => {
    setActionLoadingId(targetUser.id)
    try {
      await chatService.createDirectRoom({
        targetUserId: targetUser.id,
        targetUserName: targetUser.fullName,
      })
      navigate(ROUTES.APP.CHAT)
    } catch (err) {
      console.error('Failed to create direct chat:', err)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleBlock = async (targetUser: BackendUserSummary) => {
    try {
      await usersService.blockUser(targetUser.id)
      setAlumniList((prev) => prev.filter((u) => u.id !== targetUser.id))
      setToastMessage(`Blocked ${targetUser.fullName}. They will no longer appear in search.`)
      setTimeout(() => setToastMessage(null), 3000)
    } catch (err) {
      console.error('Failed to block user:', err)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm animate-in fade-in">
          <IconCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-secondary to-[#004e8a] p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white mb-2 backdrop-blur-xs">
            <IconUserCheck className="h-3.5 w-3.5" />
            Verified FPT Alumni Directory
          </div>
          <h1 className="text-2xl font-bold">Connect with Graduates & Industry Mentors</h1>
          <p className="text-sm text-blue-100 max-w-xl mt-1">
            Browse verified FPT Alumni across software engineering, business, and design. Reach out for 1-1 career advice and mentorship.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => fetchAlumni()}
          className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-1.5"
        >
          <IconRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search alumni by name or major..."
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-brand-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Campus:</span>
          <select
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-brand-primary focus:outline-none"
          >
            <option value="ALL">All Campuses</option>
            <option value="Hòa Lạc">Hòa Lạc</option>
            <option value="Hồ Chí Minh">Hồ Chí Minh</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Cần Thơ">Cần Thơ</option>
            <option value="Quy Nhơn">Quy Nhơn</option>
          </select>
        </div>
      </div>

      {/* Alumni Cards Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-brand-secondary" />
        </div>
      ) : alumniList.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
          <IconUserCheck className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No Alumni Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different campus filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alumniList.map((alumni) => (
            <div
              key={alumni.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      fallback={alumni.fullName.slice(0, 2).toUpperCase()}
                      size="md"
                      className="bg-brand-primary/10 text-brand-primary font-bold"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-sm">{alumni.fullName}</h3>
                        <IconUserCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      </div>
                      <span className="text-[11px] font-semibold text-brand-secondary">
                        {alumni.role}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBlock(alumni)}
                    title="Block this user"
                    className="text-slate-300 hover:text-rose-500 p-1"
                  >
                    <IconShieldX className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <IconSchool className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800">{alumni.major || 'Software Engineering'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconBuildingCommunity className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Campus {alumni.campus || 'Hòa Lạc'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconCalendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Batch {alumni.batch || 'K14'}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleStartChat(alumni)}
                disabled={actionLoadingId === alumni.id}
                className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-white rounded-xl gap-1.5 text-xs py-2.5"
              >
                {actionLoadingId === alumni.id ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <IconMessageCircle className="h-4 w-4" />
                )}
                <span>Send Direct Message</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AlumniPage
