import { useState, useEffect, useRef, type FC } from 'react'
import {
  IconHeart,
  IconMessageDots,
  IconBookmark,
  IconShare,
  IconCircleCheck,
  IconDots,
  IconSparkles,
  IconBriefcase,
  IconAward,
  IconHelpCircle,
  IconClock,
  IconFlag,
  IconPencil,
  IconTrash,
  IconCheck,
  IconLoader2,
} from '@tabler/icons-react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PostCommentsSection } from './PostCommentsSection'
import { ReportPostModal } from './ReportPostModal'
import { postsService } from '@/services/posts'
import { useAuthStore } from '@/stores/authStore'
import { PublicProfileModal } from '@/features/users'

export interface PostItem {
  id: string
  author: {
    id?: string
    name: string
    avatar: string
    role: string
    major: string
    isVerified: boolean
    isOnline?: boolean
  }
  timestamp: string
  community: string
  campus?: string
  isAnswered?: boolean
  hasLiked?: boolean
  isBookmarked?: boolean
  type: 'EXPERIENCE' | 'QUESTION' | 'JOB' | 'INTERNSHIP' | 'SCHOLARSHIP'
  title: string
  content: string
  images?: string[]
  likes: number
  comments: number
}

interface PostCardProps {
  post: PostItem
  onPostDeleted?: (postId: string) => void
  onPostUpdated?: (post: PostItem) => void
  initialOpenComments?: boolean
  isTargetPost?: boolean
}

export const PostCard: FC<PostCardProps> = ({
  post,
  onPostDeleted,
  onPostUpdated,
  initialOpenComments = false,
  isTargetPost = false,
}) => {
  const { currentUser } = useAuthStore()
  const cardRef = useRef<HTMLDivElement>(null)

  const [isLiked, setIsLiked] = useState(Boolean(post.hasLiked))
  const [likesCount, setLikesCount] = useState(post.likes)
  const [isSaved, setIsSaved] = useState(Boolean(post.isBookmarked))
  const [isCommentsOpen, setIsCommentsOpen] = useState(Boolean(initialOpenComments))
  const [commentsCount, setCommentsCount] = useState(post.comments)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  // Auto-scroll when deep-linked to this target post
  useEffect(() => {
    if (isTargetPost && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 200)
    }
  }, [isTargetPost])

  // FO-04: Edit & Delete state
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(post.title)
  const [editContent, setEditContent] = useState(post.content)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [displayTitle, setDisplayTitle] = useState(post.title)
  const [displayContent, setDisplayContent] = useState(post.content)
  const [isAnswered, setIsAnswered] = useState(Boolean(post.isAnswered))

  const isOwnerOrAdmin =
    Boolean(currentUser?.id && post.author.id && currentUser.id === post.author.id) ||
    String(currentUser?.role || '').toLowerCase() === 'admin'

  const handleToggleLike = async () => {
    const nextLiked = !isLiked
    setIsLiked(nextLiked)
    setLikesCount(nextLiked ? likesCount + 1 : likesCount - 1)
    try {
      await postsService.toggleReaction(post.id)
    } catch (err) {
      console.error('Failed to toggle reaction:', err)
      setIsLiked(!nextLiked)
      setLikesCount(likesCount)
    }
  }

  const handleToggleBookmark = async () => {
    const nextSaved = !isSaved
    setIsSaved(nextSaved)
    try {
      await postsService.toggleBookmark(post.id)
    } catch (err) {
      console.error('Failed to toggle bookmark:', err)
      setIsSaved(!nextSaved)
    }
  }

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) return
    setIsSavingEdit(true)
    try {
      let postType = 'Sharing'
      if (post.type === 'QUESTION') postType = 'Question'
      else if (post.type === 'JOB' || post.type === 'INTERNSHIP') postType = 'Recruitment'

      await postsService.updatePost(post.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
        postType,
        major: post.author.major || 'All',
        campus: post.campus || 'All',
        isAnswered,
        imageUrls: post.images || [],
      })

      setDisplayTitle(editTitle.trim())
      setDisplayContent(editContent.trim())
      setIsEditing(false)
      onPostUpdated?.({
        ...post,
        title: editTitle.trim(),
        content: editContent.trim(),
        isAnswered,
      })
    } catch (err) {
      console.error('Failed to update post:', err)
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeletePost = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return
    try {
      await postsService.deletePost(post.id)
      onPostDeleted?.(post.id)
    } catch (err) {
      console.error('Failed to delete post:', err)
    }
  }

  const handleToggleAnswered = async () => {
    const next = !isAnswered
    try {
      await postsService.markAnswered(post.id, next)
      setIsAnswered(next)
    } catch (err) {
      console.error('Failed to mark answered:', err)
    }
  }

  const getTypeBadge = () => {
    switch (post.type) {
      case 'EXPERIENCE':
        return (
          <Badge variant="brand-primary" className="p-1.5" title="Share kinh nghiệm" aria-label="Share kinh nghiệm">
            <IconSparkles className="h-3.5 w-3.5" />
          </Badge>
        )
      case 'QUESTION':
        return (
          <div className="flex items-center gap-1">
            {isAnswered ? (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 p-1.5" title="Đã có lời giải" aria-label="Đã có lời giải">
                <IconCircleCheck className="h-3.5 w-3.5 text-emerald-600" />
              </Badge>
            ) : (
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 p-1.5" title="Chưa giải đáp" aria-label="Chưa giải đáp">
                <IconHelpCircle className="h-3.5 w-3.5 text-amber-600" />
              </Badge>
            )}
            <Badge variant="brand-secondary" className="p-1.5" title="Hỏi đáp cộng đồng" aria-label="Hỏi đáp cộng đồng">
              <IconHelpCircle className="h-3.5 w-3.5" />
            </Badge>
          </div>
        )
      case 'JOB':
      case 'INTERNSHIP':
        return (
          <Badge variant="brand-accent" className="p-1.5" title={post.type === 'JOB' ? 'Tuyển dụng' : 'Thực tập / OJT'} aria-label={post.type === 'JOB' ? 'Tuyển dụng' : 'Thực tập / OJT'}>
            <IconBriefcase className="h-3.5 w-3.5" />
          </Badge>
        )
      case 'SCHOLARSHIP':
        return (
          <Badge variant="brand-primary" className="p-1.5" title="Học bổng" aria-label="Học bổng">
            <IconAward className="h-3.5 w-3.5" />
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Card
      ref={cardRef}
      className={cn(
        'overflow-hidden border-slate-200/90 bg-white shadow-sm transition-all hover:border-slate-300',
        isTargetPost && 'ring-2 ring-brand-primary ring-offset-2 border-brand-primary shadow-md'
      )}
    >
      <div className="p-5">
        {/* Header: Author Information & Options */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="cursor-pointer rounded-full focus:outline-none"
              title="Xem hồ sơ tác giả (US-05)"
            >
              <Avatar
                src={post.author.avatar}
                fallback={post.author.name.slice(0, 2)}
                size="md"
                isVerified={post.author.isVerified}
                isOnline={post.author.isOnline}
              />
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="cursor-pointer text-sm font-bold text-slate-900 hover:text-brand-primary text-left"
                >
                  {post.author.name}
                </button>

                {post.author.isVerified && (
                  <span title="Cựu sinh viên đã xác thực" aria-label="Cựu sinh viên đã xác thực" className="inline-flex items-center text-blue-600">
                    <IconCircleCheck className="h-3.5 w-3.5" />
                  </span>
                )}

                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-500">{post.author.major}</span>
              </div>

              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{post.author.role}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <IconClock className="h-3 w-3" />
                  {post.timestamp}
                </span>
                <span>•</span>
                <span className="cursor-pointer rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-brand-secondary hover:underline">
                  {post.community}
                </span>
                {post.campus && post.campus !== 'All' && (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {post.campus}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-2">
            {getTypeBadge()}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                title="Tùy chọn bài viết"
              >
                <IconDots className="h-4 w-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-8 z-30 w-52 rounded-xl border border-slate-200 bg-white p-1 shadow-lg animate-in fade-in zoom-in-95">
                  {isOwnerOrAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false)
                          setIsEditing(true)
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <IconPencil className="h-3.5 w-3.5 text-brand-secondary" />
                        <span>Chỉnh sửa bài viết (FO-04)</span>
                      </button>

                      {post.type === 'QUESTION' && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsMenuOpen(false)
                            void handleToggleAnswered()
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                        >
                          <IconCircleCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{isAnswered ? 'Đánh dấu chưa giải đáp' : 'Đánh dấu đã giải đáp (FO-16)'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false)
                          void handleDeletePost()
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                        <span>Xóa bài viết (FO-04)</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsReportModalOpen(true)
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <IconFlag className="h-3.5 w-3.5" />
                    <span>Báo cáo bài viết (FO-11)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Post Title & Content (with FO-04 Inline Editor) */}
        {isEditing ? (
          <div className="mt-3 space-y-2.5 rounded-xl border border-brand-primary/30 bg-slate-50 p-3.5">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Tiêu đề bài viết..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-brand-primary focus:outline-none"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:border-brand-primary focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditTitle(displayTitle)
                  setEditContent(displayContent)
                  setIsEditing(false)
                }}
                className="h-8 text-xs"
              >
                Hủy
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSavingEdit}
                onClick={handleSaveEdit}
                className="h-8 text-xs bg-brand-primary text-white hover:bg-brand-primary/90 gap-1"
              >
                {isSavingEdit ? <IconLoader2 className="h-3.5 w-3.5 animate-spin" /> : <IconCheck className="h-3.5 w-3.5" />}
                <span>Lưu thay đổi</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            {displayTitle && (
              <h3 className="cursor-pointer text-base font-bold leading-snug text-slate-900 transition-colors hover:text-brand-primary">
                {displayTitle}
              </h3>
            )}

            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {displayContent}
            </p>
          </div>
        )}

        {/* Post Images Gallery */}
        {post.images && post.images.length > 0 && (
          <div className="mt-3.5 overflow-hidden rounded-xl border border-slate-100">
            {post.images.length === 1 ? (
              <img
                src={post.images[0]}
                alt="Post attachment"
                className="max-h-96 w-full object-cover"
              />
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {post.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Attachment ${i + 1}`}
                    className="h-48 w-full object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Toolbar: Like, Comment, Save, Share */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-slate-500">
          <div className="flex items-center gap-4">
            {/* Like / Upvote Button */}
            <button
              type="button"
              onClick={handleToggleLike}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors',
                isLiked
                  ? 'bg-red-50 text-red-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-red-600'
              )}
            >
              <IconHeart className={cn('h-4 w-4', isLiked && 'fill-current text-red-600')} />
              <span>{likesCount}</span>
            </button>

            {/* Comment Button */}
            <button
              type="button"
              onClick={() => setIsCommentsOpen(!isCommentsOpen)}
              title={`${commentsCount} bình luận`}
              aria-label={`${commentsCount} bình luận`}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors',
                isCommentsOpen
                  ? 'bg-blue-100 text-brand-secondary font-bold'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-brand-secondary'
              )}
            >
              <IconMessageDots className="h-4 w-4" />
              <span>{commentsCount}</span>
            </button>

            {/* Quick Answered Toggle for Question Authors & Admins (FO-16) */}
            {post.type === 'QUESTION' && isOwnerOrAdmin && (
              <button
                type="button"
                onClick={handleToggleAnswered}
                className={cn(
                  'inline-flex items-center justify-center rounded-full p-1.5 text-xs font-bold transition-all border',
                  isAnswered
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                )}
                title={isAnswered ? 'Đã giải quyết (Tick xanh - Bấm để gỡ)' : 'Đánh dấu đã giải quyết (FO-16)'}
                aria-label={isAnswered ? 'Đã giải quyết' : 'Đánh dấu đã giải quyết'}
              >
                <IconCircleCheck className={cn('h-4 w-4', isAnswered ? 'text-emerald-600' : 'text-amber-600')} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Save / Bookmark Button (FO-09) */}
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={cn(
                'rounded-full p-2 transition-colors',
                isSaved
                  ? 'bg-slate-100 text-brand-primary'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              )}
              title={isSaved ? 'Đã lưu' : 'Lưu bài viết'}
            >
              <IconBookmark className={cn('h-4 w-4', isSaved && 'fill-current text-brand-primary')} />
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(window.location.href)
              }}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              title="Chia sẻ liên kết"
            >
              <IconShare className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Comments Section */}
      {isCommentsOpen && (
        <PostCommentsSection
          postId={post.id}
          postAuthorId={post.author.id}
          isQuestion={post.type === 'QUESTION'}
          onCommentAdded={() => setCommentsCount((prev) => prev + 1)}
          onAnswerAccepted={() => {
            setIsAnswered(true)
            void postsService.markAnswered(post.id, true)
          }}
        />
      )}

      {/* Report Post Modal */}
      <ReportPostModal
        postId={post.id}
        postTitle={displayTitle}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* US-05: Author Public Profile Modal */}
      <PublicProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userId={post.author.id || post.id}
        initialUser={{
          id: post.author.id || post.id,
          fullName: post.author.name,
          avatarUrl: post.author.avatar,
          role: post.author.role,
          campus: post.campus || post.community,
          major: post.author.major,
          batch: null,
        }}
      />
    </Card>
  )
}



