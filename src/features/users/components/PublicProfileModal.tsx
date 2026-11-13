import { useState, useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconX,
  IconSchool,
  IconBuildingCommunity,
  IconCalendar,
  IconMail,
  IconMessageCircle,
  IconShieldX,
  IconExternalLink,
  IconUserCheck,
  IconLoader2,
  IconCheck,
} from '@tabler/icons-react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/dialog'
import { ROUTES } from '@/constants/routes'
import { formatCampusLabel } from '@/constants/campuses'
import { usersService } from '@/services/users'
import { chatService } from '@/services/chat'
import { useAuthStore } from '@/stores/authStore'
import { normalizeError } from '@/lib/errorHandler'
import type { BackendPublicProfileResponse } from '@/types/user.types'

export interface PublicProfileFallback {
  id?: string
  fullName: string
  avatarUrl?: string | null
  campus?: string | null
  major?: string | null
  batch?: string | null
  bio?: string | null
  googleCalendarUrl?: string | null
  role?: string
  email?: string | null
}

interface PublicProfileModalProps {
  userId?: string | null
  fallback?: PublicProfileFallback | null
  initialUser?: PublicProfileFallback | null
  isOpen: boolean
  onClose: () => void
  onUserBlocked?: (blockedUserId: string) => void
  onBlocked?: (blockedUserId: string) => void
}

/**
 * US-05 & US-11: Public Profile View Modal allowing students and alumni to inspect
 * another member's profile, bio, academic info, book a slot via Google Calendar link,
 * start a 1-1 Direct Chat (CH-01), or block unwanted interactions (US-10).
 */
export const PublicProfileModal: FC<PublicProfileModalProps> = ({
  userId,
  fallback,
  initialUser,
  isOpen,
  onClose,
  onUserBlocked,
  onBlocked,
}) => {
  const effectiveFallback = fallback || initialUser
  const effectiveOnBlocked = onUserBlocked || onBlocked
  const navigate = useNavigate()
  const { currentUser } = useAuthStore()

  const [profile, setProfile] = useState<BackendPublicProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isStartingChat, setIsStartingChat] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  const [confirmBlockOpen, setConfirmBlockOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setNotice(null)

    if (effectiveFallback) {
      setProfile({
        id: userId || effectiveFallback.id || '',
        fullName: effectiveFallback.fullName,
        avatarUrl: effectiveFallback.avatarUrl || null,
        campus: effectiveFallback.campus || null,
        major: effectiveFallback.major || null,
        batch: effectiveFallback.batch || null,
        bio: effectiveFallback.bio || null,
        googleCalendarUrl: effectiveFallback.googleCalendarUrl || null,
        role: effectiveFallback.role || 'Alumni',
        email: effectiveFallback.email || null,
      })
    }

    if (!userId) return

    let isMounted = true
    setIsLoading(true)
    usersService
      .getUserProfile(userId)
      .then((data) => {
        if (isMounted) {
          setProfile(data)
        }
      })
      .catch((err) => {
        console.error('Failed to load user profile:', err)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, userId, effectiveFallback])

  if (!isOpen || !profile) return null

  const isSelf = Boolean(currentUser?.id && profile.id === currentUser.id)

  const handleStartChat = async () => {
    setIsStartingChat(true)
    setErrorMsg(null)
    try {
      const room = await chatService.createDirectRoom({
        targetUserId: profile.id,
        targetUserName: profile.fullName,
      })
      onClose()
      navigate(`${ROUTES.APP.CHAT}?roomId=${encodeURIComponent(room.roomId)}`)
    } catch (err) {
      console.error('Failed to create direct room:', err)
      setErrorMsg(normalizeError(err).message || 'Không thể mở cuộc trò chuyện.')
    } finally {
      setIsStartingChat(false)
    }
  }

  const handleConfirmBlockUser = async () => {
    setIsBlocking(true)
    setErrorMsg(null)
    try {
      await usersService.blockUser(profile.id)
      setConfirmBlockOpen(false)
      setNotice(`Đã chặn tài khoản ${profile.fullName}.`)
      effectiveOnBlocked?.(profile.id)
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (err) {
      console.error('Failed to block user:', err)
      setConfirmBlockOpen(false)
      setErrorMsg(normalizeError(err).message || 'Không thể chặn tài khoản này.')
    } finally {
      setIsBlocking(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Top Banner */}
        <div className="relative h-24 bg-gradient-to-r from-brand-secondary via-[#004e8a] to-brand-primary">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-black/25 p-1.5 text-white hover:bg-black/40 transition-colors"
            title="Đóng"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6">
          <div className="-mt-10 mb-4 flex items-end justify-between">
            <Avatar
              src={profile.avatarUrl || undefined}
              fallback={profile.fullName.slice(0, 2).toUpperCase()}
              size="lg"
              className="h-20 w-20 border-4 border-white bg-brand-primary text-lg font-bold text-white shadow-md"
            />

            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-brand-secondary border border-blue-200">
              <IconUserCheck className="h-3.5 w-3.5 text-emerald-600" />
              {profile.role}
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 py-4 text-xs text-slate-500">
              <IconLoader2 className="h-4 w-4 animate-spin text-brand-primary" />
              <span>Đang tải hồ sơ thành viên...</span>
            </div>
          ) : null}

          {errorMsg && (
            <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
              {errorMsg}
            </div>
          )}

          {notice && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
              <IconCheck className="h-4 w-4 text-emerald-600" />
              <span>{notice}</span>
            </div>
          )}

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">{profile.fullName}</h2>
            {profile.email && (
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <IconMail className="h-3.5 w-3.5 text-slate-400" />
                <span>{profile.email}</span>
              </p>
            )}
          </div>

          {/* Academic Info Badges */}
          <div className="mt-4 grid grid-cols-3 gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
            <div className="space-y-0.5">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400">
                <IconSchool className="h-3 w-3 text-brand-primary" />
                Chuyên ngành
              </span>
              <p className="font-semibold text-slate-800 truncate">
                {profile.major || 'Chưa cập nhật'}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400">
                <IconBuildingCommunity className="h-3 w-3 text-brand-secondary" />
                Cơ sở (Campus)
              </span>
              <p className="font-semibold text-slate-800 truncate">
                {profile.campus ? formatCampusLabel(profile.campus) : 'Chưa cập nhật'}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400">
                <IconCalendar className="h-3 w-3 text-emerald-600" />
                Khóa / Năm
              </span>
              <p className="font-semibold text-slate-800 truncate">{profile.batch || 'Chưa cập nhật'}</p>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-4 space-y-1.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Giới thiệu bản thân
            </h3>
            <p className="rounded-xl border border-slate-100 bg-white p-3 text-xs leading-relaxed text-slate-700">
              {profile.bio ||
                'Chưa có thông tin giới thiệu chi tiết. Hãy kết nối trực tiếp qua tin nhắn để trao đổi kinh nghiệm học tập và nghề nghiệp.'}
            </p>
          </div>

          {/* Google Calendar Booking Link */}
          {profile.googleCalendarUrl && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <IconCalendar className="h-4 w-4 text-emerald-600 shrink-0" />
                  Lịch hẹn tư vấn / Google Calendar
                </span>
                <p className="text-[11px] text-emerald-700 truncate">
                  {profile.googleCalendarUrl}
                </p>
              </div>
              <a
                href={
                  profile.googleCalendarUrl.startsWith('http')
                    ? profile.googleCalendarUrl
                    : `https://${profile.googleCalendarUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <span>Đặt lịch hẹn</span>
                <IconExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          {/* Action Buttons */}
          {!isSelf && (
            <div className="mt-5 flex items-center gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                onClick={handleStartChat}
                disabled={isStartingChat}
                className="flex-1 rounded-xl bg-brand-secondary hover:bg-brand-secondary/90 text-xs font-bold text-white gap-1.5 h-10"
              >
                {isStartingChat ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <IconMessageCircle className="h-4 w-4" />
                )}
                <span>Nhắn tin trực tiếp</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmBlockOpen(true)}
                disabled={isBlocking}
                className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold gap-1.5 h-10 px-3.5"
                title="Chặn tài khoản này"
              >
                <IconShieldX className="h-4 w-4" />
                <span>Chặn</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmBlockOpen}
        onClose={() => !isBlocking && setConfirmBlockOpen(false)}
        onConfirm={handleConfirmBlockUser}
        title="Chặn người dùng"
        message={`Bạn có chắc chắn muốn chặn tài khoản ${profile.fullName}?`}
        confirmText="Chặn tài khoản"
        isLoading={isBlocking}
      />
    </div>
  )
}
