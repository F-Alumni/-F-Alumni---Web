import { useState, useRef, type FC, type FormEvent, type ChangeEvent } from 'react'
import {
  IconSpeakerphone,
  IconPlus,
  IconTrash,
  IconCircleCheck,
  IconRefresh,
  IconBrain,
  IconUpload,
  IconFileText,
  IconDatabase,
  IconAlertCircle,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/dialog'
import { PageHeader } from '@/components/admin'
import { ROUTES } from '@/constants/routes'
import { aiService } from '@/services/ai'
import {
  useAdminAnnouncements,
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} from '@/features/admin'

export interface UploadedRagRecord {
  fileName: string
  totalFilesProcessed: number
  totalChunksCreated: number
  uploadedAt: string
}

export const SettingsPage: FC = () => {
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4500)
  }

  // Unified AI RAG Knowledge Base State
  const ragInputRef = useRef<HTMLInputElement>(null)
  const [isIngestingRag, setIsIngestingRag] = useState(false)
  const [ragSummary, setRagSummary] = useState<{
    totalFilesProcessed: number
    totalChunksCreated: number
    ingestedFiles: string[]
    lastIndexed: string | null
  }>({
    totalFilesProcessed: 0,
    totalChunksCreated: 0,
    ingestedFiles: [],
    lastIndexed: null,
  })
  const [uploadedHistory, setUploadedHistory] = useState<UploadedRagRecord[]>([])

  // Announcements State
  const [annTitle, setAnnTitle] = useState('')
  const [annContent, setAnnContent] = useState('')
  const [annType, setAnnType] = useState('General')
  const [annPriority, setAnnPriority] = useState('Normal')
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [deleteAnnId, setDeleteAnnId] = useState<string | null>(null)

  const {
    data: announcementsData,
    isLoading: isAnnouncementsLoading,
    refetch: refetchAnnouncements,
  } = useAdminAnnouncements({ includeUnpublished: true, pageSize: 20 })

  const createAnnMutation = useCreateAnnouncementMutation()
  const deleteAnnMutation = useDeleteAnnouncementMutation()
  const announcements = announcementsData?.items || []

  const handleReindexRag = async () => {
    setIsIngestingRag(true)
    try {
      const res = await aiService.ingestRag({ forceReindex: true })
      setRagSummary({
        totalFilesProcessed: res.totalFilesProcessed,
        totalChunksCreated: res.totalChunksCreated,
        ingestedFiles: res.ingestedFiles || [],
        lastIndexed: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      })
      showToast(
        'success',
        res.message ||
          `Đã tái lập chỉ mục ${res.totalFilesProcessed} tài liệu (${res.totalChunksCreated} chunks) thành công.`
      )
    } catch {
      showToast('error', 'Không thể tái lập chỉ mục RAG trên AI Service. Vui lòng thử lại.')
    } finally {
      setIsIngestingRag(false)
    }
  }

  const handleUploadKnowledgeFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsIngestingRag(true)
    try {
      const res = await aiService.uploadRagDocument(file)
      setRagSummary({
        totalFilesProcessed: res.totalFilesProcessed,
        totalChunksCreated: res.totalChunksCreated,
        ingestedFiles: res.ingestedFiles || [],
        lastIndexed: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      })
      setUploadedHistory((prev) => [
        {
          fileName: file.name,
          totalFilesProcessed: res.totalFilesProcessed,
          totalChunksCreated: res.totalChunksCreated,
          uploadedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ])
      showToast(
        'success',
        res.message || `Đã tải lên & vector hóa tài liệu "${file.name}" (${res.totalChunksCreated} chunks).`
      )
    } catch {
      showToast('error', `Tải lên tài liệu "${file.name}" thất bại. Chỉ hỗ trợ .docx, .md, .txt (<= 15MB).`)
    } finally {
      setIsIngestingRag(false)
      if (ragInputRef.current) ragInputRef.current.value = ''
    }
  }

  const handlePublishAnnouncement = async (e: FormEvent) => {
    e.preventDefault()
    if (!annTitle.trim() || !annContent.trim()) return

    try {
      await createAnnMutation.mutateAsync({
        title: annTitle.trim(),
        content: annContent.trim(),
        type: annType,
        priority: annPriority,
        isPublished: true,
      })
      setIsPublishModalOpen(false)
      setAnnTitle('')
      setAnnContent('')
      void refetchAnnouncements()
      showToast('success', `Đã phát hành thông báo hệ thống "${annTitle.trim()}".`)
    } catch {
      showToast('error', 'Không thể tạo thông báo hệ thống trên máy chủ.')
    }
  }

  const handleConfirmDeleteAnnouncement = async () => {
    if (!deleteAnnId) return
    try {
      await deleteAnnMutation.mutateAsync(deleteAnnId)
      void refetchAnnouncements()
      showToast('success', 'Đã xóa thông báo hệ thống.')
    } catch {
      showToast('error', 'Không thể xóa thông báo hệ thống.')
    } finally {
      setDeleteAnnId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {toast && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-sm animate-in fade-in ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <IconCircleCheck size={16} stroke={2} className="text-brand-accent shrink-0" />
            ) : (
              <IconAlertCircle size={16} stroke={2} className="text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 font-bold ml-4">
            ×
          </button>
        </div>
      )}

      <PageHeader
        title="System Broadcasts & AI Knowledge"
        description="Manage AI RAG knowledge base ingestion and publish platform-wide system announcements."
        breadcrumbs={[
          { label: 'Admin', to: ROUTES.ADMIN.DASHBOARD },
          { label: 'Settings' },
        ]}
      />

      <div className="space-y-5">
        {/* Unified AI Knowledge Base & RAG Ingestion */}
        <Card className="p-5 rounded-xl border-slate-200 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                <IconBrain size={20} stroke={1.8} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">AI Knowledge Base & Document RAG</h2>
                <p className="text-xs text-slate-500">
                  Upload quy chế học vụ, tài liệu OJT (.docx, .md, .txt) để nạp trực tiếp vào AI Service.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void handleReindexRag()}
                disabled={isIngestingRag}
                className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-100 gap-1.5"
              >
                <IconRefresh size={14} className={isIngestingRag ? 'animate-spin text-brand-primary' : ''} />
                <span>{isIngestingRag ? 'Đang xử lý...' : 'Re-index All'}</span>
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => ragInputRef.current?.click()}
                disabled={isIngestingRag}
                className="h-8 rounded-lg bg-brand-secondary px-3 text-xs font-semibold text-white shadow-sm hover:bg-brand-secondary/90 flex items-center gap-1.5"
              >
                <IconUpload size={14} stroke={2} />
                <span>Upload Tài liệu</span>
              </Button>
              <input
                ref={ragInputRef}
                type="file"
                accept=".docx,.md,.txt"
                className="hidden"
                onChange={(e) => void handleUploadKnowledgeFile(e)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Processed Files
              </span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {ragSummary.totalFilesProcessed > 0 ? ragSummary.totalFilesProcessed : 'Chưa chạy re-index'}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Vector Chunks
              </span>
              <p className="text-lg font-bold text-brand-secondary mt-0.5">
                {ragSummary.totalChunksCreated > 0 ? ragSummary.totalChunksCreated : '—'}
              </p>
            </div>
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Last Synced
              </span>
              <p className="text-sm font-semibold text-slate-700 mt-1">
                {ragSummary.lastIndexed || 'Nhấn Re-index All để kiểm tra'}
              </p>
            </div>
          </div>

          {(ragSummary.ingestedFiles.length > 0 || uploadedHistory.length > 0) && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <IconDatabase size={15} className="text-brand-secondary" />
                <span>Tài liệu vừa nạp trong phiên ({ragSummary.ingestedFiles.length || uploadedHistory.length})</span>
              </div>

              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
                {ragSummary.ingestedFiles.map((fileName) => (
                  <div key={fileName} className="flex items-center justify-between px-3 py-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <IconFileText size={16} className="text-brand-primary shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{fileName}</span>
                    </div>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Indexed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* System Announcements Management */}
        <Card className="p-5 rounded-xl border-slate-200 bg-white space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <IconSpeakerphone size={20} stroke={1.8} className="text-brand-primary shrink-0" />
              <div>
                <h2 className="text-base font-bold text-slate-900">System Broadcasts & Announcements</h2>
                <p className="text-xs text-slate-500">Publish global announcements across web portal and mobile apps.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => void refetchAnnouncements()}
                disabled={isAnnouncementsLoading}
                className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-100 gap-1"
              >
                <IconRefresh size={14} className={isAnnouncementsLoading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsPublishModalOpen(true)}
                className="h-8 rounded-lg bg-brand-primary px-3 text-xs font-semibold text-white shadow-sm hover:bg-brand-primary-hover flex items-center gap-1.5"
              >
                <IconPlus size={15} stroke={2} />
                <span>New Announcement</span>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                Chưa có thông báo hệ thống nào. Nhấn "New Announcement" để phát hành.
              </p>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{ann.title}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          ann.priority === 'High' || ann.priority === 'Urgent'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {ann.priority}
                      </span>
                      <span className="rounded bg-sky-100 text-brand-secondary px-1.5 py-0.5 text-[9px] font-bold">
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
                    onClick={() => setDeleteAnnId(ann.id)}
                    className="h-7 text-xs border-slate-200 text-rose-600 hover:bg-rose-50 shrink-0 ml-3"
                    title="Remove announcement"
                    aria-label="Remove announcement"
                  >
                    <IconTrash size={14} stroke={1.8} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Modal: Publish Announcement */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
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
                aria-label="Close modal"
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
                  placeholder="Ví dụ: Lịch bảo trì hệ thống hoặc sự kiện toàn trường..."
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
                  placeholder="Nhập nội dung thông báo phát hành..."
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
                  disabled={createAnnMutation.isPending}
                  className="h-8 rounded-lg bg-brand-primary px-4 text-xs font-semibold text-white shadow-sm hover:bg-brand-primary-hover"
                >
                  {createAnnMutation.isPending ? 'Publishing...' : 'Publish Now'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteAnnId)}
        onClose={() => setDeleteAnnId(null)}
        onConfirm={() => void handleConfirmDeleteAnnouncement()}
        title="Xác nhận xóa thông báo"
        message="Bạn có chắc chắn muốn xóa thông báo hệ thống này không?"
        confirmText="Xóa thông báo"
        variant="danger"
        isLoading={deleteAnnMutation.isPending}
      />
    </div>
  )
}

export default SettingsPage
