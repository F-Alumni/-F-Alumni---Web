import { useState, type FC } from 'react'
import { AlertTriangle, X, ShieldAlert, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { postsService } from '@/services/posts'

interface ReportPostModalProps {
  postId: string
  postTitle?: string
  targetType?: 'Post' | 'Comment'
  isOpen: boolean
  onClose: () => void
}

const REPORT_REASONS = [
  { id: 'SPAM', label: 'Spam thương mại & Quảng cáo lừa đảo' },
  { id: 'HARASSMENT', label: 'Quấy rối, xúc phạm cá nhân hoặc đe dọa' },
  { id: 'INAPPROPRIATE_LANGUAGE', label: 'Ngôn từ không phù hợp trong môi trường đại học' },
  { id: 'ACADEMIC_MISCONDUCT', label: 'Gian lận học tập, mua bán đồ án hoặc rò rỉ đề thi' },
  { id: 'IMPERSONATION', label: 'Mạo danh giảng viên hoặc cựu sinh viên FPT' },
]

export const ReportPostModal: FC<ReportPostModalProps> = ({
  postId,
  postTitle,
  targetType = 'Post',
  isOpen,
  onClose,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('SPAM')
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await postsService.reportPost(postId, {
        targetType,
        reason: selectedReason,
        details: details.trim() || undefined,
      })
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        onClose()
      }, 1800)
    } catch (err) {
      console.error('Report submission failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50 px-5 py-3.5">
          <div className="flex items-center gap-2 text-rose-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Báo cáo bài viết vi phạm</h3>
              <p className="text-[11px] text-rose-700 font-medium">Bảo vệ an toàn cộng đồng FPT Alumni</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
                <Check className="h-6 w-6 stroke-[2.5]" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Báo cáo đã được ghi nhận</h4>
              <p className="mt-1 text-xs text-slate-500 max-w-xs">
                Cảm ơn bạn đã đóng góp xây dựng môi trường học thuật văn minh. Đội ngũ kiểm duyệt sẽ xử lý trong thời gian sớm nhất.
              </p>
            </div>
          ) : (
            <>
              {postTitle && (
                <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-200">
                  <span className="font-bold text-slate-800">Bài viết: </span>
                  <span className="line-clamp-1 italic">"{postTitle}"</span>
                </div>
              )}

              {/* Reason Radios */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800">
                  Lý do báo cáo vi phạm <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        selectedReason === r.id
                          ? 'border-rose-400 bg-rose-50/50 text-rose-950 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="report_reason"
                        value={r.id}
                        checked={selectedReason === r.id}
                        onChange={() => setSelectedReason(r.id)}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Details Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Thông tin bổ sung (tùy chọn)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Mô tả cụ thể hành vi vi phạm để hỗ trợ Admin xử lý..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button size="sm" variant="outline" onClick={onClose} disabled={isSubmitting} className="h-8 text-xs">
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="h-8 text-xs bg-rose-600 text-white hover:bg-rose-700 gap-1.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  <span>Gửi báo cáo</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
