import { useState, useEffect, useCallback, useRef, type FC } from 'react'
import {
  IconMail,
  IconSchool,
  IconBuildingCommunity,
  IconCalendar,
  IconCalendarEvent,
  IconExternalLink,
  IconShieldCheck,
  IconEdit,
  IconCheck,
  IconLock,
  IconKey,
  IconShieldX,
  IconLoader2,
  IconAlertCircle,
  IconFileText,
  IconBookmark,
  IconTrash,
  IconHeart,
  IconMessage,
  IconCamera,
} from '@tabler/icons-react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { ConfirmDialog } from '@/components/ui/dialog'
import { FPT_CAMPUSES, formatCampusLabel, normalizeCampusCode } from '@/constants/campuses'
import { usersService } from '@/services/users'
import { authService } from '@/services/auth'
import { postsService, type ForumPostItem } from '@/services/posts'
import { useAuthStore } from '@/stores/authStore'
import { normalizeError } from '@/lib/errorHandler'
import { uploadImageViaBackend, validateImageFile } from '@/services/media'
import type {
  BackendMyProfileResponse,
  BackendPrivacySetting,
  BackendBlockedUser,
} from '@/types/user.types'

export const ProfilePage: FC = () => {
  const { currentUser, updateCurrentUser } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<'info' | 'settings' | 'my_posts' | 'bookmarks'>(
    initialTab === 'settings' || initialTab === 'my_posts' || initialTab === 'bookmarks' ? initialTab : 'info'
  )
  const [profile, setProfile] = useState<BackendMyProfileResponse | null>(null)
  const [privacy, setPrivacy] = useState<BackendPrivacySetting | null>(null)
  const [blockedUsers, setBlockedUsers] = useState<BackendBlockedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // US-07: Change password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // FO-10 & FO-09: User posts and bookmarks
  const [myPosts, setMyPosts] = useState<ForumPostItem[]>([])
  const [bookmarks, setBookmarks] = useState<ForumPostItem[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false)
  const [confirmDeletePostId, setConfirmDeletePostId] = useState<string | null>(null)
  const [isDeletingPost, setIsDeletingPost] = useState(false)

  // Edit form state
  const [fullName, setFullName] = useState('')
  const [campus, setCampus] = useState('')
  const [major, setMajor] = useState('')
  const [batch, setBatch] = useState('')
  const [bio, setBio] = useState('')
  const [googleCalendarUrl, setGoogleCalendarUrl] = useState('')

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'settings' || tabParam === 'my_posts' || tabParam === 'bookmarks' || tabParam === 'info') {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  const handleTabChange = (tab: 'info' | 'settings' | 'my_posts' | 'bookmarks') => {
    setActiveTab(tab)
    if (tab === 'info') {
      setSearchParams({})
    } else {
      setSearchParams({ tab })
    }
  }

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Tệp tin hình ảnh không hợp lệ.')
      if (avatarInputRef.current) avatarInputRef.current.value = ''
      return
    }

    setIsUploadingAvatar(true)
    setErrorMessage(null)

    try {
      // 1. Upload via secure Backend-Mediated Upload
      const uploadRes = await uploadImageViaBackend(file, '/users/media/upload')
      const uploadedUrl = uploadRes.secureUrl

      // 2. Persist avatar URL to user profile
      const updated = await usersService.updateAvatar(uploadedUrl)
      setProfile(updated)
      updateCurrentUser({ avatarUrl: uploadedUrl })
      setToastMessage('Ảnh đại diện đã được cập nhật thành công!')
      setTimeout(() => setToastMessage(null), 3000)
    } catch (err: unknown) {
      setErrorMessage(normalizeError(err).message || 'Không thể tải lên ảnh đại diện.')
    } finally {
      setIsUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  useEffect(() => {
    let isMounted = true
    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const [data, blocked] = await Promise.all([
          usersService.getMe(),
          usersService.getBlockedUsers().catch(() => []),
        ])
        if (isMounted) {
          setProfile(data)
          setPrivacy(data.privacySetting)
          setBlockedUsers(blocked)
          setFullName(data.fullName || '')
          setCampus(normalizeCampusCode(data.campus) || 'FU-HL')
          setMajor(data.major || '')
          setBatch(data.batch || '')
          setBio(data.bio || '')
          setGoogleCalendarUrl(data.googleCalendarUrl || '')
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(normalizeError(err).message)
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadProfile()
    return () => {
      isMounted = false
    }
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMessage(null)

    try {
      const updated = await usersService.updateMe({
        fullName: fullName.trim(),
        campus: campus || null,
        major: major || null,
        batch: batch || null,
        bio: bio || null,
        googleCalendarUrl: googleCalendarUrl || null,
      })

      setProfile(updated)
      updateCurrentUser({
        name: updated.fullName,
        campus: updated.campus || undefined,
        department: updated.major || undefined,
        cohort: updated.batch || undefined,
      })
      setIsEditing(false)
      setToastMessage('Cập nhật hồ sơ cá nhân thành công!')
      setTimeout(() => setToastMessage(null), 3000)
    } catch (err) {
      setErrorMessage(normalizeError(err).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (newPassword.length < 8) {
      setErrorMessage('Mật khẩu mới phải có ít nhất 8 ký tự.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.')
      return
    }

    setIsChangingPassword(true)
    try {
      await authService.changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setToastMessage('Đổi mật khẩu thành công!')
      setTimeout(() => setToastMessage(null), 3000)
    } catch (err) {
      setErrorMessage(normalizeError(err).message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleUnblockUser = async (blockedUserId: string) => {
    try {
      await usersService.unblockUser(blockedUserId)
      setBlockedUsers((prev) => prev.filter((b) => b.blockedUserId !== blockedUserId))
      setToastMessage('Đã bỏ chặn người dùng.')
      setTimeout(() => setToastMessage(null), 2500)
    } catch (err) {
      setErrorMessage(normalizeError(err).message)
    }
  }

  const handleTogglePrivacy = async (field: keyof BackendPrivacySetting) => {
    if (!privacy) return
    const updatedSettings = {
      ...privacy,
      [field]: !privacy[field],
    }

    try {
      const saved = await usersService.updatePrivacySettings(updatedSettings)
      setPrivacy(saved)
      setToastMessage('Đã cập nhật cài đặt quyền riêng tư!')
      setTimeout(() => setToastMessage(null), 2500)
    } catch (err) {
      setErrorMessage(normalizeError(err).message)
    }
  }

  // FO-10: Load user's own posts
  const loadMyPosts = useCallback(async () => {
    setIsLoadingPosts(true)
    try {
      const res = await postsService.getMyPosts(1, 20)
      setMyPosts(res.items || [])
    } catch (err) {
      console.error('Failed to load my posts:', err)
    } finally {
      setIsLoadingPosts(false)
    }
  }, [])

  // FO-09: Load bookmarked posts
  const loadBookmarks = useCallback(async () => {
    setIsLoadingBookmarks(true)
    try {
      const res = await postsService.getMyBookmarks(1, 20)
      setBookmarks(res.items || [])
    } catch (err) {
      console.error('Failed to load bookmarks:', err)
    } finally {
      setIsLoadingBookmarks(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'my_posts') {
      void loadMyPosts()
    } else if (activeTab === 'bookmarks') {
      void loadBookmarks()
    }
  }, [activeTab, loadMyPosts, loadBookmarks])

  const handleConfirmDeletePost = async () => {
    if (!confirmDeletePostId) return
    setIsDeletingPost(true)
    try {
      await postsService.deletePost(confirmDeletePostId)
      setMyPosts((prev) => prev.filter((p) => p.id !== confirmDeletePostId))
      setToastMessage('Đã xóa bài viết thành công!')
      setTimeout(() => setToastMessage(null), 3000)
      setConfirmDeletePostId(null)
    } catch (err) {
      setErrorMessage(normalizeError(err).message)
    } finally {
      setIsDeletingPost(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-brand-secondary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm animate-in fade-in">
          <IconCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 shadow-sm animate-in fade-in">
          <IconAlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar
                src={profile?.avatarUrl || currentUser?.avatarUrl}
                fallback={(profile?.fullName || currentUser?.name || 'U').slice(0, 2).toUpperCase()}
                size="lg"
                className="h-20 w-20 text-xl font-bold bg-brand-primary text-white ring-2 ring-slate-100"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-brand-secondary text-white shadow-md transition-all hover:bg-brand-secondary-hover hover:scale-105 active:scale-95 disabled:opacity-50"
                title="Thay đổi ảnh đại diện (Tối đa 5MB: JPG, PNG, WEBP)"
              >
                {isUploadingAvatar ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <IconCamera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarFileSelect}
                disabled={isUploadingAvatar}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">{profile?.fullName}</h1>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-brand-secondary shrink-0">
                  {profile?.role}
                </span>
                {profile?.isEmailVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 shrink-0">
                    <IconShieldCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5 min-w-0">
                <IconMail className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="truncate">{profile?.email}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Thành viên từ {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '2026'}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              if (activeTab !== 'info') handleTabChange('info')
              setIsEditing(!isEditing)
            }}
            className="border-slate-200 gap-1.5 shrink-0"
          >
            <IconEdit className="h-4 w-4" />
            <span>{isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa hồ sơ'}</span>
          </Button>
        </div>

        {/* Bio Section */}
        {profile?.bio && !isEditing && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Giới thiệu bản thân</h3>
            <p className="text-sm text-slate-700 leading-relaxed break-words">{profile.bio}</p>
          </div>
        )}

        {/* Google Calendar Booking Link */}
        {profile?.googleCalendarUrl && !isEditing && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <IconCalendarEvent className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800">Lịch hẹn cố vấn Google Calendar</p>
                <p className="text-xs text-slate-500 truncate">{profile.googleCalendarUrl}</p>
              </div>
            </div>
            <a
              href={profile.googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors self-start sm:self-auto shrink-0"
            >
              <span>Mở lịch hẹn Google Calendar</span>
              <IconExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => handleTabChange('info')}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap shrink-0 ${
            activeTab === 'info'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Hồ sơ & Học vấn
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('settings')}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap shrink-0 ${
            activeTab === 'settings'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Bảo mật & Riêng tư
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('my_posts')}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'my_posts'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <IconFileText className="h-4 w-4" />
          <span>Bài viết của tôi</span>
          {myPosts.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-bold">
              {myPosts.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('bookmarks')}
          className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'bookmarks'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <IconBookmark className="h-4 w-4" />
          <span>Bài viết đã lưu</span>
          {bookmarks.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-bold">
              {bookmarks.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'info' && (
        <>
          {/* Edit Profile Form */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Cập nhật thông tin hồ sơ</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cơ sở (Campus)</label>
                  <select
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none"
                  >
                    {FPT_CAMPUSES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chuyên ngành (Major)</label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="VD: Software Engineering"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Khóa (Batch / Cohort)</label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="VD: K17"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Liên kết đặt lịch Google Calendar (Tùy chọn)
                  </label>
                  <input
                    type="url"
                    value={googleCalendarUrl}
                    onChange={(e) => setGoogleCalendarUrl(e.target.value)}
                    placeholder="https://calendar.google.com/calendar/appointments/schedules/..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giới thiệu bản thân (Bio)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Chia sẻ kinh nghiệm làm việc, định hướng nghề nghiệp hoặc lĩnh vực có thể cố vấn..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-brand-primary text-white hover:bg-brand-primary/90"
                >
                  {isSaving ? <IconLoader2 className="h-4 w-4 animate-spin mr-1" /> : <IconCheck className="h-4 w-4 mr-1" />}
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          ) : (
            /* Academic Details Grid */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
                  <IconBuildingCommunity className="h-4 w-4 text-brand-secondary" />
                  <span>Cơ sở (Campus)</span>
                </div>
                <p className="text-base font-bold text-slate-900">
                  {profile?.campus ? formatCampusLabel(profile.campus) : 'Chưa cập nhật'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
                  <IconSchool className="h-4 w-4 text-brand-primary" />
                  <span>Chuyên ngành</span>
                </div>
                <p className="text-base font-bold text-slate-900">{profile?.major || 'Chưa cập nhật'}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
                  <IconCalendar className="h-4 w-4 text-emerald-600" />
                  <span>Khóa (Cohort)</span>
                </div>
                <p className="text-base font-bold text-slate-900">{profile?.batch || 'Chưa cập nhật'}</p>
              </div>
            </div>
          )}
        </>
      )}

      {(activeTab === 'info' || activeTab === 'settings') && (
        <>
          {/* Privacy Controls Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <IconLock className="h-5 w-5 text-brand-secondary shrink-0" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Cài đặt Quyền riêng tư & Hiển thị</h2>
                <p className="text-xs text-slate-500">Kiểm soát những thông tin hiển thị trên hồ sơ công khai của bạn</p>
              </div>
            </div>

            {privacy && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">Hiển thị địa chỉ Email</span>
                  <input
                    type="checkbox"
                    checked={privacy.showEmail}
                    onChange={() => handleTogglePrivacy('showEmail')}
                    className="h-4 w-4 rounded text-brand-secondary focus:ring-brand-secondary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">Hiển thị Cơ sở (Campus)</span>
                  <input
                    type="checkbox"
                    checked={privacy.showCampus}
                    onChange={() => handleTogglePrivacy('showCampus')}
                    className="h-4 w-4 rounded text-brand-secondary focus:ring-brand-secondary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">Hiển thị Chuyên ngành</span>
                  <input
                    type="checkbox"
                    checked={privacy.showMajor}
                    onChange={() => handleTogglePrivacy('showMajor')}
                    className="h-4 w-4 rounded text-brand-secondary focus:ring-brand-secondary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">Hiển thị Khóa (Batch)</span>
                  <input
                    type="checkbox"
                    checked={privacy.showBatch}
                    onChange={() => handleTogglePrivacy('showBatch')}
                    className="h-4 w-4 rounded text-brand-secondary focus:ring-brand-secondary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">Hiển thị Giới thiệu (Bio)</span>
                  <input
                    type="checkbox"
                    checked={privacy.showBio}
                    onChange={() => handleTogglePrivacy('showBio')}
                    className="h-4 w-4 rounded text-brand-secondary focus:ring-brand-secondary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">Hiển thị Lịch Google Calendar</span>
                  <input
                    type="checkbox"
                    checked={privacy.showGoogleCalendar}
                    onChange={() => handleTogglePrivacy('showGoogleCalendar')}
                    className="h-4 w-4 rounded text-brand-secondary focus:ring-brand-secondary cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Change Password Section */}
          <form onSubmit={handleChangePassword} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <IconKey className="h-5 w-5 text-brand-primary shrink-0" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Đổi mật khẩu bảo mật</h2>
                <p className="text-xs text-slate-500">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản FPT Alumni của bạn</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Ít nhất 8 ký tự"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isChangingPassword}
                className="bg-brand-secondary hover:bg-brand-secondary/90 text-white rounded-xl text-xs"
              >
                {isChangingPassword ? <IconLoader2 className="h-4 w-4 animate-spin mr-1.5" /> : <IconKey className="h-4 w-4 mr-1.5" />}
                Cập nhật mật khẩu
              </Button>
            </div>
          </form>

          {/* Blocked Users Management */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <IconShieldX className="h-5 w-5 text-rose-500 shrink-0" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Danh sách tài khoản đã chặn</h2>
                <p className="text-xs text-slate-500">Những người dùng bị chặn sẽ không thể nhắn tin hoặc thấy bạn trong tìm kiếm</p>
              </div>
            </div>

            {blockedUsers.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">Bạn chưa chặn tài khoản nào.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {blockedUsers.map((item) => (
                  <div key={item.blockedUserId} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar
                        src={item.avatarUrl || undefined}
                        fallback={(item.fullName || 'U').slice(0, 2).toUpperCase()}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">{item.fullName}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {[item.email, item.campus ? formatCampusLabel(item.campus) : null]
                            .filter(Boolean)
                            .join(' • ') || `Đã chặn ngày ${new Date(item.blockedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblockUser(item.blockedUserId)}
                      className="text-xs border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0"
                    >
                      Bỏ chặn
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab: My Posts */}
      {activeTab === 'my_posts' && (
        <div className="space-y-4">
          {isLoadingPosts ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <IconLoader2 className="h-5 w-5 animate-spin" />
              <span>Đang tải bài viết của bạn...</span>
            </div>
          ) : myPosts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
              <IconFileText className="h-12 w-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">Bạn chưa đăng bài viết nào</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hãy chia sẻ kinh nghiệm học tập hoặc đặt câu hỏi trên Diễn đàn để kết nối với cựu sinh viên FPT.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-primary">
                          {post.postType}
                        </span>
                        <span className="text-xs text-slate-400">• {new Date(post.createdAt).toLocaleDateString()}</span>
                        {post.campus && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {formatCampusLabel(post.campus)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 break-words">{post.title}</h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => setConfirmDeletePostId(post.id)}
                      className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                      title="Xóa bài viết của tôi"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{post.content}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <IconHeart className="h-3.5 w-3.5 text-red-500" />
                      {post.likeCount} lượt thích
                    </span>
                    <span className="flex items-center gap-1">
                      <IconMessage className="h-3.5 w-3.5 text-blue-500" />
                      {post.commentCount} bình luận
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          {isLoadingBookmarks ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <IconLoader2 className="h-5 w-5 animate-spin" />
              <span>Đang tải bài viết đã lưu...</span>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
              <IconBookmark className="h-12 w-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">Chưa có bài viết nào được lưu</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Khi lướt Bảng tin Diễn đàn, bấm biểu tượng Bookmark trên bất kỳ bài viết nào để lưu lại đọc sau.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bookmarks.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-brand-secondary/10 px-2.5 py-0.5 text-[11px] font-bold text-brand-secondary">
                          {post.postType}
                        </span>
                        <span className="text-xs text-slate-400">• Đăng bởi {post.authorName}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{post.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{post.content}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <IconHeart className="h-3.5 w-3.5 text-red-500" />
                      {post.likeCount} lượt thích
                    </span>
                    <span className="flex items-center gap-1">
                      <IconMessage className="h-3.5 w-3.5 text-blue-500" />
                      {post.commentCount} bình luận
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <ConfirmDialog
        isOpen={Boolean(confirmDeletePostId)}
        onClose={() => !isDeletingPost && setConfirmDeletePostId(null)}
        onConfirm={handleConfirmDeletePost}
        title="Xóa bài viết"
        message="Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác."
        confirmText="Xóa bài viết"
        isLoading={isDeletingPost}
      />
    </div>
  )
}

export default ProfilePage
