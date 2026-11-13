import { useState, useEffect, useCallback, type FC } from 'react'
import {
  IconSearch,
  IconUsers,
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
import { alumniService } from '@/services/alumni'
import { chatService } from '@/services/chat'
import { useAuthStore } from '@/stores/authStore'
import { PublicProfileModal } from '@/features/users'
import type { BackendUserSummary } from '@/types/user.types'

export const AlumniPage: FC = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()

  const [alumniList, setAlumniList] = useState<BackendUserSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [campus, setCampus] = useState('ALL')
  const [major, setMajor] = useState('ALL')
  const [roleFilter, setRoleFilter] = useState('Alumni')
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<BackendUserSummary | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const fetchAlumni = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await alumniService.getAlumniDirectory({
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
      await alumniService.blockMember(targetUser.id)
      setAlumniList((prev) => prev.filter((u) => u.id !== targetUser.id))
      setToastMessage(`Đã chặn ${targetUser.fullName}. Tài khoản này sẽ không còn xuất hiện trong kết quả tìm kiếm.`)
      setTimeout(() => setToastMessage(null), 3000)
    } catch (err) {
      console.error('Failed to block user:', err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm animate-in fade-in">
          <IconCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Unified Page Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
            <IconUsers className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Danh bạ Cựu sinh viên FPT</h1>
              <span className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-primary">
                {alumniList.length} thành viên
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kết nối cựu sinh viên & sinh viên theo ngành học, cơ sở, xem hồ sơ công khai và trao đổi trực tiếp 1-1.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <Button
            variant="outline"
            onClick={() => fetchAlumni()}
            title="Làm mới danh sách"
            aria-label="Làm mới"
            className="h-9 w-9 rounded-full border-slate-200/90 text-slate-600 hover:text-brand-primary hover:border-brand-primary/40 p-0 inline-flex items-center justify-center transition-colors"
          >
            <IconRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin text-brand-primary' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 2. Unified Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
        <div className="relative flex-1 min-w-[220px]">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo họ tên, chuyên ngành, khóa (VD: K15, Nguyễn Văn A)..."
            className="w-full h-8.5 rounded-xl border border-slate-200/90 bg-slate-50/70 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {/* Role Filter */}
          <div className="inline-flex h-8.5 items-center gap-1 rounded-xl border border-slate-200/90 bg-slate-50/80 px-2.5 text-xs text-slate-700">
            <IconUserCheck className="h-3.5 w-3.5 text-brand-secondary shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              <option value="Alumni">Cựu sinh viên</option>
              <option value="Student">Sinh viên</option>
              <option value="ALL">Tất cả vai trò</option>
            </select>
          </div>

          {/* Major Filter */}
          <div className="inline-flex h-8.5 items-center gap-1 rounded-xl border border-slate-200/90 bg-slate-50/80 px-2.5 text-xs text-slate-700">
            <IconSchool className="h-3.5 w-3.5 text-brand-secondary shrink-0" />
            <select
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
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

          {/* Campus Filter */}
          <div className="inline-flex h-8.5 items-center gap-1 rounded-xl border border-slate-200/90 bg-slate-50/80 px-2.5 text-xs text-slate-700">
            <IconBuildingCommunity className="h-3.5 w-3.5 text-brand-secondary shrink-0" />
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              <option value="ALL">Tất cả cơ sở</option>
              <option value="Hòa Lạc">Hòa Lạc</option>
              <option value="Hồ Chí Minh">Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Cần Thơ">Cần Thơ</option>
              <option value="Quy Nhơn">Quy Nhơn</option>
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
                    title="Chặn thành viên này"
                    className="text-slate-300 hover:text-rose-500 p-1 cursor-pointer transition-colors"
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
                    <span className="font-medium text-slate-800">{alumni.major || 'Chưa cập nhật ngành'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconBuildingCommunity className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{alumni.campus ? `Campus ${alumni.campus}` : 'Chưa cập nhật cơ sở'}</span>
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
                    title="Đặt lịch cố vấn qua Google Calendar"
                    aria-label="Đặt lịch cố vấn"
                    className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <IconCalendarEvent className="h-4 w-4 text-emerald-600 shrink-0" />
                      Google Calendar
                    </span>
                    <IconExternalLink className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  </a>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedUserForProfile(alumni)}
                  title="Xem hồ sơ chi tiết"
                  aria-label="Xem hồ sơ"
                  className="h-8 w-8 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl p-0 inline-flex items-center justify-center"
                >
                  <IconEye className="h-4 w-4" />
                </Button>

                <Button
                  onClick={() => handleStartChat(alumni)}
                  disabled={actionLoadingId === alumni.id}
                  title="Nhắn tin trực tiếp 1-1"
                  aria-label="Nhắn tin"
                  className="h-8 w-8 bg-brand-secondary hover:bg-brand-secondary/90 text-white rounded-xl p-0 inline-flex items-center justify-center"
                >
                  {actionLoadingId === alumni.id ? (
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <IconMessageCircle className="h-4 w-4" />
                  )}
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
