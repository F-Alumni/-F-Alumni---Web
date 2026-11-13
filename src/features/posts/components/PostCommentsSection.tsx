import { useState, useEffect, useCallback, type FC } from 'react'
import {
  Send,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Award,
  Flag,
  Reply,
  Pencil,
  Trash2,
  Check,
  X,
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/dialog'
import { postsService, type PostCommentItem } from '@/services/posts'
import { forumHubClient } from '@/services/posts/signalr'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import { ReportPostModal } from './ReportPostModal'
import { PublicProfileModal } from '@/features/users'

interface PostCommentsSectionProps {
  postId: string
  postAuthorId?: string
  isQuestion?: boolean
  onCommentAdded?: () => void
}

export const PostCommentsSection: FC<PostCommentsSectionProps> = ({
  postId,
  postAuthorId,
  isQuestion = false,
  onCommentAdded,
}) => {
  const { currentUser } = useAuthStore()

  const [comments, setComments] = useState<PostCommentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newCommentText, setNewCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<PostCommentItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [acceptingCommentId, setAcceptingCommentId] = useState<string | null>(null)
  const [reportingComment, setReportingComment] = useState<PostCommentItem | null>(null)
  const [selectedAuthorComment, setSelectedAuthorComment] = useState<PostCommentItem | null>(null)

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchComments = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await postsService.getComments(postId)
      setComments(data || [])
    } catch (err) {
      console.error('Failed to load comments:', err)
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    void fetchComments()
  }, [fetchComments])

  useEffect(() => {
    void forumHubClient.startConnection().then(() => forumHubClient.joinPostGroup(postId))
    const unsub = forumHubClient.onCommentReceived((incoming) => {
      if (incoming.postId && incoming.postId !== postId) return
      void fetchComments()
    })
    return () => {
      unsub()
      void forumHubClient.leavePostGroup(postId)
    }
  }, [postId, fetchComments])

  const handleAddComment = async () => {
    const trimmed = newCommentText.trim()
    if (!trimmed || isSubmitting) return

    setIsSubmitting(true)
    try {
      await postsService.addComment(postId, {
        content: trimmed,
        parentCommentId: replyingTo?.id,
      })
      setNewCommentText('')
      setReplyingTo(null)
      await fetchComments()
      onCommentAdded?.()
    } catch (err) {
      console.error('Failed to add comment:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAcceptAnswer = async (commentId: string) => {
    setAcceptingCommentId(commentId)
    try {
      await postsService.acceptAnswer(commentId)
      setComments((prev) =>
        prev.map((c) => ({
          ...c,
          isAcceptedAnswer: c.id === commentId,
        }))
      )
    } catch (err) {
      console.error('Failed to accept answer:', err)
    } finally {
      setAcceptingCommentId(null)
    }
  }

  const handleSaveCommentEdit = async (commentId: string) => {
    if (!editContent.trim()) return
    setIsSavingEdit(true)
    try {
      await postsService.updateComment(commentId, editContent.trim())
      setEditingCommentId(null)
      await fetchComments()
    } catch (err) {
      console.error('Failed to update comment:', err)
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleConfirmDeleteComment = async () => {
    if (!deleteTargetId) return
    setIsDeleting(true)
    try {
      await postsService.deleteComment(deleteTargetId)
      setDeleteTargetId(null)
      await fetchComments()
    } catch (err) {
      console.error('Failed to delete comment:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const isPostAuthor = Boolean(currentUser?.id && postAuthorId && currentUser.id === postAuthorId)
  const isAdmin = String(currentUser?.role || '').toUpperCase() === 'ADMIN'

  const renderCommentCard = (comment: PostCommentItem, isReply = false) => {
    const isAccepted = comment.isAcceptedAnswer
    const canModify =
      Boolean(currentUser?.id && comment.authorId && currentUser.id === comment.authorId) || isAdmin
    const isEditing = editingCommentId === comment.id

    return (
      <div key={comment.id} className={isReply ? 'ml-6 sm:ml-9 mt-2' : ''}>
        <div
          className={cn(
            'rounded-xl p-3 transition-colors border',
            isAccepted
              ? 'border-emerald-300 bg-emerald-50/70 shadow-sm'
              : 'border-slate-200/70 bg-white'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <button
              type="button"
              onClick={() => setSelectedAuthorComment(comment)}
              className="flex items-center gap-2 text-left cursor-pointer group"
            >
              <Avatar
                src={comment.authorAvatarUrl}
                fallback={comment.authorName.slice(0, 2).toUpperCase()}
                className="h-7 w-7"
              />
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-brand-primary">
                    {comment.authorName}
                  </span>
                  {isAccepted && (
                    <Badge className="bg-emerald-600 text-white gap-0.5 px-1.5 py-0 text-[10px] font-bold">
                      <CheckCircle2 className="h-3 w-3" />
                      Best Answer
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                    day: 'numeric',
                    month: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </button>

            <div className="flex items-center gap-1">
              {isPostAuthor && isQuestion && !isAccepted && !isReply && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAcceptAnswer(comment.id)}
                  disabled={acceptingCommentId === comment.id}
                  className="h-6 text-[10px] font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1 rounded-lg"
                  title="Chọn bình luận này làm câu trả lời chính xác nhất"
                >
                  {acceptingCommentId === comment.id ? (
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  ) : (
                    <Award className="h-3 w-3 text-emerald-600" />
                  )}
                  <span>Chấp nhận</span>
                </Button>
              )}

              {!isReply && (
                <button
                  type="button"
                  onClick={() => setReplyingTo(comment)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-blue-50 hover:text-brand-secondary transition-colors"
                  title="Trả lời bình luận"
                  aria-label="Trả lời bình luận"
                >
                  <Reply className="h-3.5 w-3.5" />
                </button>
              )}

              {canModify && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCommentId(comment.id)
                      setEditContent(comment.content)
                    }}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="Chỉnh sửa bình luận"
                    aria-label="Chỉnh sửa bình luận"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(comment.id)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Xóa bình luận"
                    aria-label="Xóa bình luận"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setReportingComment(comment)}
                className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                title="Báo cáo bình luận vi phạm"
                aria-label="Báo cáo bình luận vi phạm"
              >
                <Flag className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="mt-2 pl-9 flex items-center gap-2">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-brand-primary focus:outline-none"
              />
              <Button
                type="button"
                size="sm"
                disabled={isSavingEdit}
                onClick={() => void handleSaveCommentEdit(comment.id)}
                className="h-7 px-2 bg-brand-primary text-white"
              >
                {isSavingEdit ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setEditingCommentId(null)}
                className="h-7 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap pl-9">
              {comment.content}
            </p>
          )}
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-1.5">
            {comment.replies.map((reply) => renderCommentCard(reply, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3.5 animate-in fade-in duration-150">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
        <span className="flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-brand-secondary" />
          Bình luận ({comments.length})
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6 text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-brand-primary mr-2" />
          <span className="text-xs">Đang tải bình luận...</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="py-4 text-center text-xs text-slate-500">
          Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ góc nhìn của bạn!
        </div>
      ) : (
        <div className="space-y-2.5">{comments.map((c) => renderCommentCard(c, false))}</div>
      )}

      {replyingTo && (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-1.5 text-[11px] text-brand-secondary">
          <span>
            Đang trả lời <strong>{replyingTo.authorName}</strong>
          </span>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="font-semibold hover:underline"
          >
            Hủy
          </button>
        </div>
      )}

      <div className="pt-2 flex items-start gap-2.5">
        <Avatar
          src={currentUser?.avatarUrl}
          fallback={(currentUser?.name || 'ME').slice(0, 2).toUpperCase()}
          className="h-7 w-7 shrink-0 mt-0.5"
        />

        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleAddComment()
              }
            }}
            placeholder={replyingTo ? `Trả lời ${replyingTo.authorName}...` : 'Viết câu trả lời hoặc thảo luận...'}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-primary focus:outline-none"
          />

          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={!newCommentText.trim() || isSubmitting}
            className="h-9 w-9 shrink-0 rounded-xl bg-brand-primary text-white hover:bg-brand-primary-hover p-0"
            aria-label="Gửi bình luận"
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {reportingComment && (
        <ReportPostModal
          postId={reportingComment.id}
          postTitle={reportingComment.content}
          targetType="Comment"
          isOpen={Boolean(reportingComment)}
          onClose={() => setReportingComment(null)}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDeleteComment}
        title="Xóa bình luận"
        message="Bạn có chắc chắn muốn xóa bình luận này không?"
        confirmText="Xóa"
        variant="danger"
        isLoading={isDeleting}
      />

      {selectedAuthorComment && (
        <PublicProfileModal
          isOpen={Boolean(selectedAuthorComment)}
          onClose={() => setSelectedAuthorComment(null)}
          userId={selectedAuthorComment.authorId}
          initialUser={{
            id: selectedAuthorComment.authorId,
            fullName: selectedAuthorComment.authorName,
            avatarUrl: selectedAuthorComment.authorAvatarUrl,
            role: 'Thành viên FPTU',
            campus: 'FPT University',
            major: 'FPT University',
            batch: null,
          }}
        />
      )}
    </div>
  )
}
