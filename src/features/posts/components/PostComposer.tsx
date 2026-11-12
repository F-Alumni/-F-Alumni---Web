import { useState, useEffect, type FC } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Sparkles,
  HelpCircle,
  Briefcase,
  Award,
  Send,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { postsService } from '@/services/posts'
import { useAuthStore } from '@/stores/authStore'
import { normalizeError } from '@/lib/errorHandler'

interface PostComposerProps {
  onPostCreated?: (content: string) => void
}

export const PostComposer: FC<PostComposerProps> = ({ onPostCreated }) => {
  const { currentUser } = useAuthStore()
  const [searchParams] = useSearchParams()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedType, setSelectedType] = useState<string>('EXPERIENCE')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('compose') === 'true') {
      setIsExpanded(true)
    }
  }, [searchParams])

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
        major: currentUser?.department || 'All',
        campus: currentUser?.campus || 'All',
      })

      setContent('')
      setTitle('')
      setIsExpanded(false)
      onPostCreated?.(trimmedContent)
    } catch (err: unknown) {
      setErrorMessage(normalizeError(err).message || 'Không thể đăng bài viết. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const postTypes = [
    { id: 'EXPERIENCE', label: 'Experiences', icon: Sparkles, color: 'text-amber-500' },
    { id: 'QUESTION', label: 'Q&A', icon: HelpCircle, color: 'text-brand-secondary' },
    { id: 'JOB', label: 'Jobs & OJT', icon: Briefcase, color: 'text-brand-accent' },
    { id: 'SCHOLARSHIP', label: 'Scholarships', icon: Award, color: 'text-brand-primary' },
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
            src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
            fallback={(currentUser?.name || 'ME').slice(0, 2).toUpperCase()}
            size="md"
            isVerified
            isOnline
          />

          <div className="flex-1 space-y-2">
            {isExpanded && (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề bài viết..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary/40"
              />
            )}

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="Chia sẻ cơ hội việc làm, kinh nghiệm phỏng vấn, hoặc đặt câu hỏi cho cộng đồng cựu sinh viên FPT..."
              rows={isExpanded ? 3 : 2}
              className="w-full resize-none rounded-xl border-0 bg-slate-50/80 p-3 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary/40"
            />
          </div>
        </div>

        {/* Bottom Options Toolbar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          {/* Post Type Chips */}
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
                      ? 'shadow-xs bg-slate-900 text-white'
                      : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : type.color}`} />
                  <span>{type.label}</span>
                </button>
              )
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              size="sm"
              className="shadow-xs rounded-full bg-brand-primary px-4 text-xs font-semibold text-white hover:bg-brand-primary-hover disabled:opacity-40"
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
