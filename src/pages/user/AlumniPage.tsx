import { useState, useEffect, useCallback, type FC } from 'react'
import {
  IconSearch,
  IconUserCheck,
  IconMessageCircle,
  IconSchool,
  IconBuildingCommunity,
  IconCalendar,
  IconCalendarEvent,
  IconExternalLink,
  IconEye,
  IconLoader2,
  IconRefresh,
  IconCheck,
  IconShieldX,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { ROUTES } from '@/constants/routes'
import { FPT_CAMPUSES, formatCampusLabel } from '@/constants/campuses'
import { usersService } from '@/services/users'
import { chatService } from '@/services/chat'
import { useAuthStore } from '@/stores/authStore'
import { PublicProfileModal } from '@/features/users'
import { normalizeError } from '@/lib/errorHandler'
import type { BackendUserSummary } from '@/types/user.types'

export const AlumniPage: FC = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()

  const [alumniList, setAlumniList] = useState<BackendUserSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [campus, setCampus] = useState('ALL')
  const [major, setMajor] = useState('ALL')
  const [roleFilter, setRoleFilter] = useState('Alumni')
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<BackendUserSummary | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const fetchAlumni = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const res = await usersService.searchUsers({
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        keyword: keyword || undefined,
        campus: campus === 'ALL' ? undefined : campus,
        major: major === 'ALL' ? undefined : major,
        pageSize: 50,
      })

      // Filter out self if current user is in the list
      const items = (res?.items || []).filter((u) => u.id !== currentUser?.id)
      setAlumniList(items)
    } catch (err) {
      console.error('Failed to query alumni list:', err)
      setErrorMessage(normalizeError(err).message || 'Không thể tải danh bạ thành viên.')
      setAlumniList([])
    } finally {
      setIsLoading(false)
    }
  }, [keyword, campus, major, roleFilter, currentUser?.id])

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchAlumni()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchAlumni])

  const handleStartChat = async (targetUser: BackendUserSummary) => {
    setActionLoadingId(targetUser.id)
    setErrorMessage(null)
    try {
      const room = await chatService.createDirectRoom({
        targetUserId: targetUser.id,
        targetUserName: targetUser.fullName,
      })
      navigate(`${ROUTES.APP.CHAT}?roomId=${encodeURIComponent(room.roomId)}`)
    } catch (err) {
      console.error('Failed to create direct chat:', err)
      setErrorMessage(normalizeError(err).message || 'Không thể mở cuộc trò chuyện 1-1.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleBlock = async (targetUser: BackendUserSummary) => {
    try {
      await usersService.blockUser(targetUser.id)
      setAlumniList((prev) => prev.filter((u) => u.id !== targetUser.id))
      setToastMessage(`Đã chặn ${targetUser.fullName}. Tài khoản này sẽ không còn xuất hiện trong kết quả tìm kiếm.`)
      setTimeout(() => setToastMessage(null), 3000)
    } catch (err) {
      console.error('Failed to block user:', err)
      setErrorMessage(normalizeError(err).message || 'Không thể chặn người dùng này.')
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
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white mb-2 backdrop-blur-sm">
            <IconUserCheck className="h-3.5 w-3.5" />
            Danh bạ Cựu sinh viên & Sinh viên FPT University
          </div>
          <h1 className="text-2xl font-bold">Kết nối Cựu sinh viên & Cố vấn chuyên môn</h1>
          <p className="text-sm text-blue-100 max-w-xl mt-1">
            Tìm kiếm cựu sinh viên FPT theo ngành học, cơ sở và khóa học. Xem hồ sơ công khai, đặt lịch hẹn cố vấn qua Google Calendar hoặc nhắn tin trực tiếp 1-1.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => fetchAlumni()}
          className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-1.5"
        >
          <IconRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          <span>{errorMessage}</span>
          <Button size="sm" variant="outline" onClick={() => void fetchAlumni()} className="h-7 border-rose-200 text-rose-700">
            Thử lại
          </Button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 min-w-0">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo họ tên, chuyên ngành, khóa (VD: K15, Nguyễn Văn A)..."
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-brand-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Vai trò:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-brand-primary focus:outline-none"
            >
              <option value="Alumni">Cựu sinh viên (Alumni)</option>
              <option value="Student">Sinh viên (Student)</option>
              <option value="ALL">Tất cả thành viên</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Ngành:</span>
            <select
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-brand-primary focus:outline-none"
            >
              <option value="ALL">Tất cả chuyên ngành</option>
              <option value="Software Engineering">Kỹ thuật phần mềm (SE)</option>
              <option value="Artificial Intelligence">Trí tuệ nhân tạo (AI)</option>
              <option value="Information Assurance">An toàn thông tin (IA)</option>
              <option value="Graphic Design">Thiết kế Mỹ thuật số (GD)</option>
              <option value="Business Administration">Quản trị kinh doanh (BA)</option>
              <option value="International Business">Kinh doanh quốc tế (IB)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Cơ sở:</span>
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-brand-primary focus:outline-none"
            >
              <option value="ALL">Tất cả cơ sở</option>
              {FPT_CAMPUSES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.shortLabel}
                </option>
              ))}
            </select>
          </div>
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
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy thành viên phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hãy thử thay đổi từ khóa tìm kiếm, chuyên ngành hoặc bộ lọc cơ sở đào tạo.
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
                  <button
                    type="button"
                    onClick={() => setSelectedUserForProfile(alumni)}
                    className="flex items-center gap-3 text-left group cursor-pointer"
                  >
                    <Avatar
                      src={alumni.avatarUrl || undefined}
                      fallback={alumni.fullName.slice(0, 2).toUpperCase()}
                      size="md"
                      className="bg-brand-primary/10 text-brand-primary font-bold group-hover:ring-2 group-hover:ring-brand-primary/30 transition-all"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-sm group-hover:text-brand-primary transition-colors">
                          {alumni.fullName}
                        </h3>
                        <IconUserCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      </div>
                      <span className="text-[11px] font-semibold text-brand-secondary">
                        {alumni.role}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleBlock(alumni)}
                    title="Chặn người dùng này"
                    className="text-slate-300 hover:text-rose-500 p-1 cursor-pointer"
                  >
                    <IconShieldX className="h-4 w-4" />
                  </button>
                </div>

                {alumni.bio && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {alumni.bio}
                  </p>
                )}

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <IconSchool className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800">{alumni.major || 'Chưa cập nhật chuyên ngành'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconBuildingCommunity className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{alumni.campus ? formatCampusLabel(alumni.campus) : 'Chưa cập nhật cơ sở'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconCalendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{alumni.batch ? `Khóa ${alumni.batch}` : 'Chưa cập nhật khóa'}</span>
                  </div>
                </div>

                {alumni.googleCalendarUrl && (
                  <a
                    href={alumni.googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <IconCalendarEvent className="h-4 w-4 text-emerald-600 shrink-0" />
                      Đặt lịch cố vấn Google Calendar
                    </span>
                    <IconExternalLink className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedUserForProfile(alumni)}
                  className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl gap-1.5 text-xs py-2.5"
                >
                  <IconEye className="h-4 w-4" />
                  <span>Xem hồ sơ</span>
                </Button>

                <Button
                  onClick={() => handleStartChat(alumni)}
                  disabled={actionLoadingId === alumni.id}
                  className="flex-1 bg-brand-secondary hover:bg-brand-secondary/90 text-white rounded-xl gap-1.5 text-xs py-2.5"
                >
                  {actionLoadingId === alumni.id ? (
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <IconMessageCircle className="h-4 w-4" />
                  )}
                  <span>Nhắn tin 1-1</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* US-05: Public Profile Modal */}
      {selectedUserForProfile && (
        <PublicProfileModal
          isOpen={Boolean(selectedUserForProfile)}
          onClose={() => setSelectedUserForProfile(null)}
          userId={selectedUserForProfile.id}
          initialUser={selectedUserForProfile}
          onBlocked={(blockedId) => {
            setAlumniList((prev) => prev.filter((u) => u.id !== blockedId))
            setToastMessage('Đã chặn người dùng thành công.')
            setTimeout(() => setToastMessage(null), 3000)
          }}
        />
      )}
    </div>
  )
}

export default AlumniPage
