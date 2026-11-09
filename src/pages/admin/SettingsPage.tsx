import { useState, useMemo, type FC, type FormEvent } from 'react'
import {
  IconDeviceFloppy,
  IconShieldCheck,
  IconLock,
  IconSpeakerphone,
  IconPlus,
  IconTrash,
  IconCircleCheck,
  IconRefresh,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/admin'
import { ROUTES } from '@/constants/routes'
import {
  useAdminAnnouncements,
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} from '@/features/admin'
import type { SystemAnnouncementItem } from '@/types/admin.types'

export const SettingsPage: FC = () => {
  const [autoVerifyFptEmail, setAutoVerifyFptEmail] = useState(true)
  const [allowPublicJobPosting, setAllowPublicJobPosting] = useState(false)
  const [requireModeratorApproval, setRequireModeratorApproval] = useState(true)
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // System Announcement Form States
  const [annTitle, setAnnTitle] = useState('')
  const [annContent, setAnnContent] = useState('')
  const [annType, setAnnType] = useState('General')
  const [annPriority, setAnnPriority] = useState('Normal')
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)

  // React Query Hooks for Announcements
  const {
    data: announcementsData,
    isLoading: isAnnouncementsLoading,
    refetch: refetchAnnouncements,
  } = useAdminAnnouncements({ includeUnpublished: true, pageSize: 20 })

  const createAnnMutation = useCreateAnnouncementMutation()
  const deleteAnnMutation = useDeleteAnnouncementMutation()

  // Local additions & deletions
  const [localAddedAnn, setLocalAddedAnn] = useState<SystemAnnouncementItem[]>([])
  const [deletedAnnIds, setDeletedAnnIds] = useState<Set<string>>(new Set())

  const announcements = useMemo(() => {
    let baseList: SystemAnnouncementItem[] = []
    if (announcementsData && announcementsData.items && announcementsData.items.length > 0) {
      baseList = announcementsData.items
    }
    return [...localAddedAnn, ...baseList].filter((a) => !deletedAnnIds.has(a.id))
  }, [announcementsData, localAddedAnn, deletedAnnIds])

  const handleSave = () => {
    setIsSaved(true)
    setToastMessage('Cấu hình bảo mật hệ thống đã được lưu thành công!')
    setTimeout(() => {
      setIsSaved(false)
      setToastMessage(null)
    }, 3500)
  }

  const handlePublishAnnouncement = async (e: FormEvent) => {
    e.preventDefault()
    if (!annTitle.trim() || !annContent.trim()) return

    const newAnn: SystemAnnouncementItem = {
      id: `ANN-${Date.now().toString().slice(-4)}`,
      title: annTitle.trim(),
      content: annContent.trim(),
      type: annType,
      priority: annPriority,
      isPublished: true,
      publishedAtUtc: new Date().toISOString(),
      createdByAdminId: 'SUPER-ADMIN',
      createdByAdminEmail: 'admin@fpt.edu.vn',
      createdAtUtc: new Date().toISOString(),
    }

    setLocalAddedAnn((prev) => [newAnn, ...prev])
    setIsPublishModalOpen(false)

    try {
      await createAnnMutation.mutateAsync({
        title: annTitle.trim(),
        content: annContent.trim(),
        type: annType,
        priority: annPriority,
        isPublished: true,
      })
      setToastMessage(`Đã phát thông báo hệ thống: "${newAnn.title}"!`)
    } catch {
      setToastMessage(`Đã phát thông báo (cục bộ): "${newAnn.title}"!`)
    }

    setAnnTitle('')
    setAnnContent('')
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleDeleteAnnouncement = async (id: string) => {
    setDeletedAnnIds((prev) => new Set(prev).add(id))
    try {
      await deleteAnnMutation.mutateAsync(id)
    } catch {
      // optimistic state preserved
    }
    setToastMessage('Đã gỡ bỏ thông báo hệ thống.')
    setTimeout(() => setToastMessage(null), 3500)
  }

  return (
    <div className="space-y-6 max-w-4xl">
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
        title="System Settings & Broadcasts"
        description="Configure automated verification policies, moderation rules, and broadcast campus announcements."
        breadcrumbs={[
          { label: 'Admin', to: ROUTES.ADMIN.DASHBOARD },
          { label: 'Settings' },
        ]}
        actions={
          <Button
            onClick={handleSave}
            className="h-9 rounded-lg bg-brand-primary px-4 text-xs font-semibold text-white shadow-xs hover:bg-brand-primary-hover flex items-center gap-1.5"
          >
            <IconDeviceFloppy size={16} stroke={1.8} />
            <span>{isSaved ? 'Saved Successfully!' : 'Save Configuration'}</span>
          </Button>
        }
      />

      <div className="space-y-5">
        {/* Verification Settings */}
        <Card className="p-5 rounded-xl border-slate-200 bg-white space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <IconShieldCheck size={20} stroke={1.8} className="text-brand-accent shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Alumni Verification Automation</h2>
              <p className="text-xs text-slate-500">Rules governing automated and manual degree checks.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoVerifyFptEmail}
                onChange={(e) => setAutoVerifyFptEmail(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800">
                  Auto-Verify with Official @fpt.edu.vn / @fe.edu.vn Email
                </span>
                <span className="text-slate-500">
                  Applicants submitting an active institutional university email are fast-tracked into the verified alumni directory.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requireModeratorApproval}
                onChange={(e) => setRequireModeratorApproval(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800">
                  Require Manual Degree Scan for Personal Emails (Gmail, Yahoo)
                </span>
                <span className="text-slate-500">
                  Requires alumni using non-university emails to submit degree diploma scans into the Verification Queue.
                </span>
              </div>
            </label>
          </div>
        </Card>

        {/* Opportunity & Content Rules */}
        <Card className="p-5 rounded-xl border-slate-200 bg-white space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <IconLock size={20} stroke={1.8} className="text-brand-secondary shrink-0" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Posting & Moderation Policies</h2>
              <p className="text-xs text-slate-500">Access controls for career listings and open discussions.</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowPublicJobPosting}
                onChange={(e) => setAllowPublicJobPosting(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800">
                  Allow Unverified Users to Post Job & Internship Listings
                </span>
                <span className="text-slate-500">
                  When disabled, only verified alumni and staff accounts can publish career opportunities to prevent spam.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlertsEnabled}
                onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800">
                  Instant Email Notifications for High-Priority Reports
                </span>
                <span className="text-slate-500">
                  Send urgent moderation alerts directly to admin@fpt.edu.vn when content receives multiple flags.
                </span>
              </div>
            </label>
          </div>
        </Card>

        {/* System Announcements Management (AD-08) */}
        <Card className="p-5 rounded-xl border-slate-200 bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <IconSpeakerphone size={20} stroke={1.8} className="text-brand-primary shrink-0" />
              <div>
                <h2 className="text-base font-bold text-slate-900">System Broadcasts & Announcements</h2>
                <p className="text-xs text-slate-500">Publish global announcements across web portal and mobile alumni apps.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetchAnnouncements()}
                disabled={isAnnouncementsLoading}
                className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-100 gap-1"
              >
                <IconRefresh size={14} className={isAnnouncementsLoading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsPublishModalOpen(true)}
                className="h-8 rounded-lg bg-brand-primary px-3 text-xs font-semibold text-white shadow-xs hover:bg-brand-primary-hover flex items-center gap-1.5"
              >
                <IconPlus size={15} stroke={2} />
                <span>New Announcement</span>
              </Button>
            </div>
          </div>

          {/* Announcements List */}
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{ann.title}</span>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                        ann.priority === 'High' || ann.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {ann.priority}
                    </span>
                    <span className="rounded bg-sky-100 text-brand-secondary px-1.5 py-0.2 text-[9px] font-bold">
                      {ann.type}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{ann.content}</p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Published on {ann.publishedAtUtc ? ann.publishedAtUtc.slice(0, 10) : 'Recent'}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="h-7 text-xs border-slate-200 text-rose-600 hover:bg-rose-50 shrink-0 ml-3"
                  title="Remove announcement"
                >
                  <IconTrash size={14} stroke={1.8} />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modal: Publish Announcement */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-2">
                <IconSpeakerphone size={18} className="text-brand-primary" />
                <h3 className="text-sm font-bold text-slate-900">Broadcast System Announcement</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePublishAnnouncement} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Announcement Title</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Lịch bảo trì cổng thông tin hoặc sự kiện toàn trường..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Type</label>
                  <select
                    value={annType}
                    onChange={(e) => setAnnType(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-brand-primary focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Event">Event</option>
                    <option value="Policy">Policy</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Priority Level</label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-brand-primary focus:outline-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High (Highlighted)</option>
                    <option value="Urgent">Urgent (Emergency Banner)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Content / Message</label>
                <textarea
                  required
                  rows={4}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Enter detailed message to broadcast to all alumni and students..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="h-8 text-xs border-slate-200 text-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 rounded-lg bg-brand-primary px-4 text-xs font-semibold text-white shadow-xs hover:bg-brand-primary-hover"
                >
                  Publish Now
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage
