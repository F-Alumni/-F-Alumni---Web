import { useState, useEffect, type FC } from 'react'
import {
  IconMail,
  IconSchool,
  IconBuildingCommunity,
  IconCalendar,
  IconShieldCheck,
  IconEdit,
  IconCheck,
  IconLock,
  IconLoader2,
  IconAlertCircle,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { usersService } from '@/services/users'
import { useAuthStore } from '@/stores/authStore'
import { normalizeError } from '@/lib/errorHandler'
import type { BackendMyProfileResponse, BackendPrivacySetting } from '@/types/user.types'

export const ProfilePage: FC = () => {
  const { currentUser, updateCurrentUser } = useAuthStore()

  const [profile, setProfile] = useState<BackendMyProfileResponse | null>(null)
  const [privacy, setPrivacy] = useState<BackendPrivacySetting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Edit form state
  const [fullName, setFullName] = useState('')
  const [campus, setCampus] = useState('')
  const [major, setMajor] = useState('')
  const [batch, setBatch] = useState('')
  const [bio, setBio] = useState('')
  const [googleCalendarUrl, setGoogleCalendarUrl] = useState('')

  useEffect(() => {
    let isMounted = true
    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const data = await usersService.getMe()
        if (isMounted) {
          setProfile(data)
          setPrivacy(data.privacySetting)
          setFullName(data.fullName || '')
          setCampus(data.campus || '')
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
      setToastMessage('Profile updated successfully!')
      setTimeout(() => setToastMessage(null), 3000)
    } catch (err) {
      setErrorMessage(normalizeError(err).message)
    } finally {
      setIsSaving(false)
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
      setToastMessage('Privacy settings updated!')
      setTimeout(() => setToastMessage(null), 2500)
    } catch (err) {
      setErrorMessage(normalizeError(err).message)
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
            <Avatar
              fallback={(profile?.fullName || currentUser?.name || 'U').slice(0, 2).toUpperCase()}
              size="lg"
              className="h-20 w-20 text-xl font-bold bg-brand-primary text-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{profile?.fullName}</h1>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-brand-secondary">
                  {profile?.role}
                </span>
                {profile?.isEmailVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    <IconShieldCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                <IconMail className="h-4 w-4 text-slate-400" />
                {profile?.email}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '2026'}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="border-slate-200 gap-1.5"
          >
            <IconEdit className="h-4 w-4" />
            <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
          </Button>
        </div>

        {/* Bio Section */}
        {profile?.bio && !isEditing && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About / Bio</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Edit Profile Form */}
      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Update Profile Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Campus</label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none"
              >
                <option value="Hòa Lạc">Hòa Lạc</option>
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Quy Nhơn">Quy Nhơn</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Major / Discipline</label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g. Kỹ thuật phần mềm"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cohort / Batch</label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="e.g. K17"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Google Calendar Link (Optional)</label>
              <input
                type="text"
                value={googleCalendarUrl}
                onChange={(e) => setGoogleCalendarUrl(e.target.value)}
                placeholder="https://calendar.google.com/..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / Introduction</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell the alumni community about your interests and expertise..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              {isSaving ? <IconLoader2 className="h-4 w-4 animate-spin mr-1" /> : <IconCheck className="h-4 w-4 mr-1" />}
              Save Changes
            </Button>
          </div>
        </form>
      ) : (
        /* Academic Details Grid */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
              <IconBuildingCommunity className="h-4 w-4 text-brand-secondary" />
              <span>Campus</span>
            </div>
            <p className="text-base font-bold text-slate-900">{profile?.campus || 'Not specified'}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
              <IconSchool className="h-4 w-4 text-brand-primary" />
              <span>Major</span>
            </div>
            <p className="text-base font-bold text-slate-900">{profile?.major || 'Not specified'}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase">
              <IconCalendar className="h-4 w-4 text-emerald-600" />
              <span>Batch / Cohort</span>
            </div>
            <p className="text-base font-bold text-slate-900">{profile?.batch || 'Not specified'}</p>
          </div>
        </div>
      )}

      {/* Privacy Controls Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <IconLock className="h-5 w-5 text-brand-secondary" />
          <div>
            <h2 className="text-base font-bold text-slate-900">Privacy & Visibility Preferences</h2>
            <p className="text-xs text-slate-500">Control what information other university members see on your public profile</p>
          </div>
        </div>

        {privacy && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-sm font-medium text-slate-700">Display Email Address</span>
              <input
                type="checkbox"
                checked={privacy.showEmail}
                onChange={() => handleTogglePrivacy('showEmail')}
                className="h-4 w-4 rounded text-brand-secondary focus:ring-brand-secondary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-sm font-medium text-slate-700">Display Campus</span>
              <input
                type="checkbox"
                checked={privacy.showCampus}
                onChange={() => handleTogglePrivacy('showCampus')}
                className="h-4 w-4 rounded text-brand-secondary focus:ring-brand-secondary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-sm font-medium text-slate-700">Display Major</span>
              <input
                type="checkbox"
                checked={privacy.showMajor}
                onChange={() => handleTogglePrivacy('showMajor')}
                className="h-4 w-4 rounded text-brand-secondary focus:ring-brand-secondary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-sm font-medium text-slate-700">Display Cohort / Batch</span>
              <input
                type="checkbox"
                checked={privacy.showBatch}
                onChange={() => handleTogglePrivacy('showBatch')}
                className="h-4 w-4 rounded text-brand-secondary focus:ring-brand-secondary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-sm font-medium text-slate-700">Display Bio</span>
              <input
                type="checkbox"
                checked={privacy.showBio}
                onChange={() => handleTogglePrivacy('showBio')}
                className="h-4 w-4 rounded text-brand-secondary focus:ring-brand-secondary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-sm font-medium text-slate-700">Display Google Calendar</span>
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
    </div>
  )
}

export default ProfilePage
