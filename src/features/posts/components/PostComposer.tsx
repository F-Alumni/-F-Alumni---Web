import { useState, useEffect, useRef, type FC } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Sparkles,
  HelpCircle,
  Briefcase,
  Award,
  Send,
  Loader2,
  AlertCircle,
  ImagePlus,
  X,
  GraduationCap,
  Building2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { postsService } from '@/services/posts'
import { uploadImageViaBackend, validateImageFile } from '@/services/media'
import { useAuthStore } from '@/stores/authStore'
import { normalizeError } from '@/lib/errorHandler'
import { FPT_CAMPUSES } from '@/constants/campuses'

interface PostComposerProps {
  onPostCreated?: (content: string) => void
}

export const PostComposer: FC<PostComposerProps> = ({ onPostCreated }) => {
  const { currentUser } = useAuthStore()
  const [searchParams] = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedType, setSelectedType] = useState<string>('EXPERIENCE')
  const [targetMajor, setTargetMajor] = useState<string>('All')
  const [targetCampus, setTargetCampus] = useState<string>('All')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('compose') === 'true') {
      setIsExpanded(true)
    }
  }, [searchParams])

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Tệp hình ảnh không hợp lệ.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setIsUploadingImage(true)
    setErrorMessage(null)
    try {
      const uploaded = await uploadImageViaBackend(file, '/users/media/upload')
      setImageUrls((prev) => [...prev, uploaded.secureUrl])
      setIsExpanded(true)
    } catch (err) {
      setErrorMessage(normalizeError(err).message || 'Không thể tải ảnh đính kèm lên.')
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    const trimmedContent = content.trim()
    if (!trimmedContent) return

    if (trimmedContent.length < 10) {
      setErrorMessage('Nội dung bài viết phải có ít nhất 10 ký tự.')
      return
    }

    // Determine post title
    let postTitle = title.trim()
    if (!postTitle) {
      const firstLine = trimmedContent.split('\n')[0]?.trim() || ''
      postTitle = firstLine.length >= 5 ? firstLine.slice(0, 150) : `Bài viết từ ${currentUser?.name || 'Thành viên'}`
    }

    // Map UI type to Backend PostType ('Sharing' | 'Question' | 'Recruitment')
    let postType = 'Sharing'
    if (selectedType === 'QUESTION') postType = 'Question'
    else if (selectedType === 'JOB') postType = 'Recruitment'

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await postsService.createPost({
        title: postTitle,
        content: trimmedContent,
        postType,
        major: targetMajor || 'All',
        campus: targetCampus || 'All',
        imageUrls,
      })

      setContent('')
      setTitle('')
      setImageUrls([])
      setTargetMajor('All')
      setTargetCampus('All')
      setIsExpanded(false)
      onPostCreated?.(trimmedContent)
    } catch (err: unknown) {
      setErrorMessage(normalizeError(err).message || 'Không thể đăng bài viết. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const postTypes = [
    { id: 'EXPERIENCE', label: 'Chia sẻ kinh nghiệm', icon: Sparkles, color: 'text-amber-500' },
    { id: 'QUESTION', label: 'Hỏi đáp Q&A', icon: HelpCircle, color: 'text-brand-secondary' },
    { id: 'JOB', label: 'Việc làm & OJT', icon: Briefcase, color: 'text-brand-accent' },
    { id: 'SCHOLARSHIP', label: 'Học bổng', icon: Award, color: 'text-brand-primary' },
  ]

  return (
    <Card id="post-composer" className="overflow-hidden border-slate-200/90 bg-white shadow-sm transition-all scroll-mt-24">
      <div className="p-4">
        {errorMessage && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Top: Avatar & Composer Input */}
        <div className="flex items-start gap-3">
          <Avatar
            src={currentUser?.avatarUrl || undefined}
            fallback={(currentUser?.name || 'ME').slice(0, 2).toUpperCase()}
            size="md"
            isVerified
            isOnline
          />

          <div className="flex-1 space-y-2.5">
            {isExpanded && (
              <>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tiêu đề bài viết..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary/40"
                />

                {/* Target Major & Campus Audience Selectors */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700">
                    <GraduationCap className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                    <span className="font-semibold text-slate-500">Chuyên ngành:</span>
                    <select
                      value={targetMajor}
                      onChange={(e) => setTargetMajor(e.target.value)}
                      aria-label="Chọn chuyên ngành"
                      className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="All">Tất cả sinh viên (All Majors)</option>
                      <option value="SE">Kỹ thuật phần mềm (SE)</option>
                      <option value="AI">Trí tuệ nhân tạo (AI)</option>
                      <option value="IA">An toàn thông tin (IA)</option>
                      <option value="GD">Thiết kế Mỹ thuật số (GD)</option>
                      <option value="BA">Quản trị kinh doanh (BA)</option>
                      <option value="IB">Kinh doanh quốc tế (IB)</option>
                    </select>
                  </div>

                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700">
                    <Building2 className="h-3.5 w-3.5 text-brand-secondary shrink-0" />
                    <span className="font-semibold text-slate-500">Cơ sở:</span>
                    <select
                      value={targetCampus}
                      onChange={(e) => setTargetCampus(e.target.value)}
                      aria-label="Chọn cơ sở"
                      className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="All">Toàn hệ thống FPTU</option>
                      {FPT_CAMPUSES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="Chia sẻ cơ hội việc làm, kinh nghiệm phỏng vấn, hoặc đặt câu hỏi cho cộng đồng cựu sinh viên FPT..."
              rows={isExpanded ? 3 : 2}
              className="w-full resize-none rounded-xl border-0 bg-slate-50/80 p-3 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary/40"
            />

            {/* FO-03: Uploaded Image Previews */}
            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {imageUrls.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className="relative h-20 w-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 group"
                  >
                    <img src={url} alt={`Attachment ${idx + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/75 text-white hover:bg-rose-600 transition-colors"
                      title="Xóa ảnh"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Options Toolbar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          {/* Post Type Chips & Image Upload */}
          <div className="flex flex-wrap items-center gap-1.5">
            {postTypes.map((type) => {
              const Icon = type.icon
              const isSelected = selectedType === type.id
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setSelectedType(type.id)
                    setIsExpanded(true)
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'shadow-sm bg-slate-900 text-white'
                      : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : type.color}`} />
                  <span>{type.label}</span>
                </button>
              )
            })}

            {/* Attach Image Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
              title="Đính kèm hình ảnh minh họa"
            >
              {isUploadingImage ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5 text-emerald-600" />
              )}
              <span>Đính kèm ảnh</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting || isUploadingImage}
              size="sm"
              className="shadow-sm rounded-full bg-brand-primary px-4 text-xs font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Đang đăng...
                </>
              ) : (
                <>
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Đăng bài
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
