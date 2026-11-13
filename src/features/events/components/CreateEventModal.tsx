import { useState, useRef, type FC, type ChangeEvent } from 'react'
import {
  IconCalendarPlus,
  IconX,
  IconMapPin,
  IconBuildingCommunity,
  IconClock,
  IconUsers,
  IconPhoto,
  IconUpload,
  IconTrash,
  IconAlertCircle,
  IconCheck,
  IconLoader2,
  IconPlus,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  opportunitiesService,
  type CommunityEventItem,
  type CreateEventPayload,
} from '@/services/opportunities'
import {
  validateImageFile,
  uploadImageViaBackend,
  uploadToCloudinary,
} from '@/services/media'
import { normalizeError } from '@/lib/errorHandler'

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newEvent: CommunityEventItem) => void
}

function getDefaultDateTimeStrings() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  const dateStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`
  return {
    startTime: `${dateStr}T09:00`,
    endTime: `${dateStr}T11:30`,
  }
}

export const CreateEventModal: FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const initialTimes = getDefaultDateTimeStrings()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [campus, setCampus] = useState('All')
  const [startDateTime, setStartDateTime] = useState(initialTimes.startTime)
  const [endDateTime, setEndDateTime] = useState(initialTimes.endTime)
  const [maxAttendees, setMaxAttendees] = useState<string>('')
  const [bannerUrl, setBannerUrl] = useState('')

  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successToast, setSuccessToast] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleReset = () => {
    const times = getDefaultDateTimeStrings()
    setTitle('')
    setDescription('')
    setLocation('')
    setCampus('All')
    setStartDateTime(times.startTime)
    setEndDateTime(times.endTime)
    setMaxAttendees('')
    setBannerUrl('')
    setErrorMessage(null)
    setSuccessToast(false)
  }

  const handleClose = () => {
    if (isSubmitting || isUploading) return
    handleReset()
    onClose()
  }

  const handleImageFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Ảnh đính kèm không hợp lệ.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setIsUploading(true)
    setErrorMessage(null)

    try {
      // First try backend upload, fallback to Cloudinary direct upload
      try {
        const result = await uploadImageViaBackend(file, '/users/media/upload')
        setBannerUrl(result.secureUrl)
      } catch {
        const directUrl = await uploadToCloudinary(file)
        setBannerUrl(directUrl)
      }
    } catch (err: unknown) {
      setErrorMessage(
        normalizeError(err).message ||
          'Không thể tải ảnh lên. Bạn cũng có thể dán liên kết ảnh trực tiếp.'
      )
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Validation
    const trimmedTitle = title.trim()
    const trimmedDesc = description.trim()
    const trimmedLocation = location.trim()

    if (!trimmedTitle || trimmedTitle.length < 3) {
      setErrorMessage('Tiêu đề sự kiện phải có ít nhất 3 ký tự.')
      return
    }
    if (trimmedTitle.length > 300) {
      setErrorMessage('Tiêu đề sự kiện không được vượt quá 300 ký tự.')
      return
    }
    if (!trimmedDesc) {
      setErrorMessage('Vui lòng nhập mô tả chi tiết cho sự kiện.')
      return
    }
    if (!trimmedLocation) {
      setErrorMessage('Vui lòng nhập địa điểm tổ chức sự kiện.')
      return
    }
    if (!startDateTime) {
      setErrorMessage('Vui lòng chọn thời gian bắt đầu sự kiện.')
      return
    }
    if (!endDateTime) {
      setErrorMessage('Vui lòng chọn thời gian kết thúc sự kiện.')
      return
    }

    const start = new Date(startDateTime)
    const end = new Date(endDateTime)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setErrorMessage('Định dạng thời gian không hợp lệ.')
      return
    }

    if (end <= start) {
      setErrorMessage('Thời gian kết thúc sự kiện phải sau thời gian bắt đầu.')
      return
    }

    let parsedMaxAttendees: number | null = null
    if (maxAttendees.trim()) {
      const num = parseInt(maxAttendees.trim(), 10)
      if (isNaN(num) || num <= 0) {
        setErrorMessage('Số người tham gia tối đa phải là số nguyên dương.')
        return
      }
      parsedMaxAttendees = num
    }

    const payload: CreateEventPayload = {
      title: trimmedTitle,
      description: trimmedDesc,
      location: trimmedLocation,
      campus: campus || 'All',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      maxAttendees: parsedMaxAttendees,
      bannerUrl: bannerUrl.trim() || undefined,
    }

    setIsSubmitting(true)
    try {
      const created = await opportunitiesService.createEvent(payload)
      setSuccessToast(true)
      setTimeout(() => {
        handleReset()
        onSuccess(created)
        onClose()
      }, 1000)
    } catch (err: unknown) {
      const norm = normalizeError(err)
      setErrorMessage(
        norm.message || 'Có lỗi xảy ra khi tạo sự kiện. Vui lòng thử lại.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const campuses = [
    { value: 'All', label: 'Tất cả cơ sở / Toàn quốc' },
    { value: 'FU-HL', label: 'FU Hòa Lạc (Hà Nội)' },
    { value: 'FU-HCM', label: 'FU TP. Hồ Chí Minh' },
    { value: 'FU-DN', label: 'FU Đà Nẵng' },
    { value: 'FU-CT', label: 'FU Cần Thơ' },
    { value: 'FU-QN', label: 'FU Quy Nhơn' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <IconCalendarPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Tạo sự kiện mới
              </h2>
              <p className="text-xs text-slate-500">
                Tổ chức workshop, tọa đàm hướng nghiệp hoặc meetup cựu sinh viên FPT.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting || isUploading}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors disabled:opacity-50"
            title="Đóng modal"
            aria-label="Đóng"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 animate-in fade-in duration-150">
              <IconAlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="flex-1 font-medium">{errorMessage}</span>
            </div>
          )}

          {successToast && (
            <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 animate-in fade-in duration-150">
              <IconCheck className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">
                Sự kiện đã được tạo thành công! Đang làm mới danh sách...
              </span>
            </div>
          )}

          {/* Tiêu đề sự kiện */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>
                Tiêu đề sự kiện <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                {title.length}/300 ký tự
              </span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: FPT Alumni Tech Talk 2026: Kỷ nguyên AI & Cloud-Native"
              maxLength={300}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Cơ sở Campus & Địa điểm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <IconBuildingCommunity className="h-3.5 w-3.5 text-brand-secondary" />
                <span>Cơ sở trường (Campus)</span>
              </label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs text-slate-800 font-medium focus:border-brand-primary focus:bg-white focus:outline-none transition-colors cursor-pointer"
              >
                {campuses.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <IconMapPin className="h-3.5 w-3.5 text-rose-500" />
                <span>
                  Địa điểm tổ chức <span className="text-rose-500">*</span>
                </span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="VD: Hội trường A, ĐH FPT TP.HCM hoặc Google Meet URL"
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Thời gian bắt đầu & kết thúc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <IconClock className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  Thời gian bắt đầu <span className="text-rose-500">*</span>
                </span>
              </label>
              <input
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs text-slate-800 font-medium focus:border-brand-primary focus:bg-white focus:outline-none transition-colors cursor-pointer"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <IconClock className="h-3.5 w-3.5 text-amber-600" />
                <span>
                  Thời gian kết thúc <span className="text-rose-500">*</span>
                </span>
              </label>
              <input
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/70 px-3 text-xs text-slate-800 font-medium focus:border-brand-primary focus:bg-white focus:outline-none transition-colors cursor-pointer"
                required
              />
            </div>
          </div>

          {/* Giới hạn số người tham gia */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <IconUsers className="h-3.5 w-3.5 text-brand-primary" />
              <span>Số lượng tham gia tối đa (Tùy chọn)</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={maxAttendees}
              onChange={(e) => setMaxAttendees(e.target.value)}
              placeholder="Để trống nếu không giới hạn số lượng tham dự"
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* Mô tả chi tiết */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>
                Mô tả chi tiết sự kiện <span className="text-rose-500">*</span>
              </span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Giới thiệu nội dung sự kiện, lịch trình chi tiết, thông tin các diễn giả khách mời, quyền lợi tham dự..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none transition-colors resize-y min-h-[90px]"
              required
            />
          </div>

          {/* Ảnh bìa sự kiện (Banner URL & File Upload) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <IconPhoto className="h-3.5 w-3.5 text-brand-primary" />
                <span>Ảnh bìa sự kiện (Banner)</span>
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                Tối đa 5MB (JPG, PNG, WebP)
              </span>
            </label>

            {bannerUrl ? (
              <div className="relative rounded-xl border border-slate-200 overflow-hidden group bg-slate-900/5">
                <img
                  src={bannerUrl}
                  alt="Xem trước ảnh bìa sự kiện"
                  className="w-full h-36 object-cover"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setBannerUrl('')}
                    className="h-8 px-2.5 rounded-lg bg-white/95 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-xs shadow-xs border-slate-200"
                  >
                    <IconTrash className="h-3.5 w-3.5 mr-1" />
                    <span>Xóa ảnh</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="Dán URL ảnh bìa hoặc tải lên từ máy tính..."
                  className="flex-1 h-10 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-primary focus:bg-white focus:outline-none transition-colors"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                  id="event-banner-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-10 px-3.5 rounded-xl border-slate-200 text-slate-700 hover:text-brand-primary hover:border-brand-primary/40 inline-flex items-center justify-center gap-1.5 text-xs font-semibold shrink-0"
                >
                  {isUploading ? (
                    <>
                      <IconLoader2 className="h-4 w-4 animate-spin text-brand-primary" />
                      <span>Đang tải...</span>
                    </>
                  ) : (
                    <>
                      <IconUpload className="h-4 w-4 text-brand-primary" />
                      <span>Chọn tệp ảnh</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || isUploading}
              className="h-9 px-4 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="h-9 px-5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                  <span>Đang tạo sự kiện...</span>
                </>
              ) : (
                <>
                  <IconPlus className="h-4 w-4" />
                  <span>Tạo sự kiện</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
