import { useState, useEffect, useCallback, type FC } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PostCard, type PostItem } from '@/features/posts/components/PostCard'
import { postsService, type ForumPostItem } from '@/services/posts'
import { ROUTES } from '@/constants/routes'
import { normalizeError } from '@/lib/errorHandler'

function mapForumPostToCardItem(p: ForumPostItem): PostItem {
  const pt = (p.postType || '').toLowerCase()
  let type: PostItem['type'] = 'EXPERIENCE'
  if (pt.includes('question')) type = 'QUESTION'
  else if (pt.includes('recruit') || pt.includes('job')) type = 'JOB'
  else if (pt.includes('intern')) type = 'INTERNSHIP'
  else if (pt.includes('scholar')) type = 'SCHOLARSHIP'

  return {
    id: p.id,
    author: {
      id: p.authorId,
      name: p.authorName || 'Thành viên FPT',
      avatar: p.authorAvatarUrl || '',
      role: p.major ? `Khoa ${p.major}` : 'Thành viên cộng đồng',
      major: p.major || 'FPT University',
      isVerified: true,
      isOnline: true,
    },
    timestamp: p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong',
    community: p.major ? `#${p.major}` : '#General',
    campus: p.campus,
    isAnswered: Boolean(p.isAnswered),
    hasLiked: Boolean(p.hasLiked),
    isBookmarked: Boolean(p.isBookmarked),
    type,
    title: p.title,
    content: p.content,
    images: p.images && p.images.length > 0 ? p.images : undefined,
    likes: p.likeCount || 0,
    comments: p.commentCount || 0,
  }
}

export const PostDetailPage: FC = () => {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<PostItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadPost = useCallback(async () => {
    if (!postId) {
      setErrorMsg('Không tìm thấy mã bài viết.')
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const data = await postsService.getPostById(postId)
      setPost(mapForumPostToCardItem(data))
    } catch (err) {
      setErrorMsg(normalizeError(err).message || 'Không thể tải nội dung bài viết.')
      setPost(null)
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    void loadPost()
  }, [loadPost])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(ROUTES.APP.HOME)}
          className="h-9 rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Quay lại Bảng tin
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center bg-white border-slate-200 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
          <span className="text-xs font-medium text-slate-500">Đang tải chi tiết bài viết...</span>
        </Card>
      ) : errorMsg || !post ? (
        <Card className="p-10 text-center bg-white border-rose-200 space-y-3">
          <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
          <p className="text-sm font-semibold text-slate-800">{errorMsg || 'Bài viết không tồn tại hoặc đã bị ẩn.'}</p>
          <div className="flex justify-center gap-2">
            <Button size="sm" variant="outline" onClick={() => void loadPost()}>
              Thử lại
            </Button>
            <Button size="sm" onClick={() => navigate(ROUTES.APP.HOME)}>
              Về trang chủ
            </Button>
          </div>
        </Card>
      ) : (
        <PostCard
          post={post}
          defaultShowComments
          onPostDeleted={() => navigate(ROUTES.APP.HOME)}
          onPostUpdated={(updated) => setPost(updated)}
        />
      )}
    </div>
  )
}

export default PostDetailPage
