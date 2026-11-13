import { useState, useEffect, useCallback, type FC } from 'react'
import { PostCard, type PostItem } from './PostCard'
import type { PostCategoryFilter, PostSortOption, QuestionStatusFilter } from './PostFeedFilters'
import { postsService, type ForumPostItem } from '@/services/posts'
import { forumHubClient } from '@/services/posts/signalr'
import { normalizeCampusCode } from '@/constants/campuses'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PostFeedProps {
  category: PostCategoryFilter
  community: string
  campus?: string
  searchKeyword?: string
  sortBy?: PostSortOption
  questionStatus?: QuestionStatusFilter
  refreshTrigger?: number
}

function mapBackendPostToPostItem(p: ForumPostItem): PostItem {
  let type: 'EXPERIENCE' | 'QUESTION' | 'JOB' | 'INTERNSHIP' | 'SCHOLARSHIP' = 'EXPERIENCE'
  const pt = (p.postType || '').toLowerCase()
  const textLower = `${p.title} ${p.content}`.toLowerCase()
  if (pt.includes('question')) type = 'QUESTION'
  else if (pt.includes('scholar') || textLower.includes('học bổng') || textLower.includes('scholarship')) type = 'SCHOLARSHIP'
  else if (pt.includes('intern') || textLower.includes('thực tập') || textLower.includes('ojt')) type = 'INTERNSHIP'
  else if (pt.includes('recruit') || pt.includes('job')) type = 'JOB'
  else type = 'EXPERIENCE'

  let timestamp = 'Vừa xong'
  if (p.createdAt) {
    const diffMs = Date.now() - new Date(p.createdAt).getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours >= 24) {
      timestamp = `${Math.floor(diffHours / 24)} ngày trước`
    } else if (diffHours >= 1) {
      timestamp = `${diffHours} giờ trước`
    } else {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      timestamp = diffMins > 0 ? `${diffMins} phút trước` : 'Vừa xong'
    }
  }

  return {
    id: p.id,
    author: {
      id: p.authorId,
      name: p.authorName || 'FPT Alumni',
      avatar: p.authorAvatarUrl || '',
      role: p.major ? `Khoa ${p.major}` : 'Thành viên FPTU',
      major: p.major || 'FPT University',
      isVerified: true,
      isOnline: false,
    },
    timestamp,
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

export const PostFeed: FC<PostFeedProps> = ({
  category,
  community,
  campus = 'ALL',
  searchKeyword = '',
  sortBy = 'latest',
  questionStatus = 'ALL',
  refreshTrigger,
}) => {
  const [posts, setPosts] = useState<PostItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      let postType: string | undefined
      if (category === 'QUESTIONS' || questionStatus !== 'ALL') postType = 'Question'
      else if (category === 'JOBS' || category === 'INTERNSHIPS' || category === 'SCHOLARSHIPS') postType = 'Recruitment'
      else if (category === 'EXPERIENCES') postType = 'Sharing'

      let major: string | undefined
      if (community && community !== 'All Communities' && community !== 'Tất cả cộng đồng') {
        const commLower = community.toLowerCase()
        if (commLower.includes('software') || commLower.includes('(se)')) major = 'SE'
        else if (commLower.includes('ai') || commLower.includes('intelligence')) major = 'AI'
        else if (commLower.includes('assurance') || commLower.includes('(ia)')) major = 'IA'
        else if (commLower.includes('design') || commLower.includes('(gd)')) major = 'GD'
        else if (commLower.includes('international') || commLower.includes('(ib)')) major = 'IB'
        else if (commLower.includes('business') || commLower.includes('(ba)')) major = 'BA'
      }

      const isAnsweredParam =
        questionStatus === 'ANSWERED'
          ? true
          : questionStatus === 'UNANSWERED'
          ? false
          : undefined

      const res = await postsService.getPosts({
        postType,
        major,
        campus: campus && campus !== 'ALL' ? campus : undefined,
        search: searchKeyword.trim() || undefined,
        isAnswered: isAnsweredParam,
        sort: sortBy,
        page: 1,
        pageSize: 30,
      })

      let rawItems = res?.items || []

      if (category === 'SCHOLARSHIPS') {
        rawItems = rawItems.filter((item) => {
          const text = `${item.title} ${item.content} ${item.postType}`.toLowerCase()
          return text.includes('học bổng') || text.includes('scholarship') || text.includes('grant')
        })
      } else if (category === 'INTERNSHIPS') {
        rawItems = rawItems.filter((item) => {
          const text = `${item.title} ${item.content}`.toLowerCase()
          return text.includes('thực tập') || text.includes('ojt') || text.includes('intern')
        })
      }

      if (campus && campus !== 'ALL') {
        const targetCampus = normalizeCampusCode(campus)
        rawItems = rawItems.filter(
          (item) =>
            !item.campus ||
            item.campus === 'All' ||
            normalizeCampusCode(item.campus) === targetCampus ||
            item.campus.toLowerCase().includes(campus.toLowerCase())
        )
      }
      if (searchKeyword.trim()) {
        const q = searchKeyword.trim().toLowerCase()
        rawItems = rawItems.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.content.toLowerCase().includes(q) ||
            (item.authorName || '').toLowerCase().includes(q)
        )
      }
      if (questionStatus === 'ANSWERED') {
        rawItems = rawItems.filter((item) => Boolean(item.isAnswered))
      } else if (questionStatus === 'UNANSWERED') {
        rawItems = rawItems.filter((item) => !item.isAnswered)
      }
      if (sortBy === 'popular') {
        rawItems = [...rawItems].sort(
          (a, b) => (b.likeCount || 0) + (b.commentCount || 0) - ((a.likeCount || 0) + (a.commentCount || 0))
        )
      }

      setPosts(rawItems.map(mapBackendPostToPostItem))
    } catch (err) {
      console.error('Could not load forum posts from backend:', err)
      setErrorMessage('Không thể kết nối máy chủ diễn đàn. Vui lòng thử lại.')
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }, [category, community, campus, searchKeyword, sortBy, questionStatus])

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPosts()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchPosts, refreshTrigger])

  useEffect(() => {
    void forumHubClient.startConnection()
    const unsubPost = forumHubClient.onPostCreated(() => {
      void fetchPosts()
    })
    const unsubReact = forumHubClient.onReactionUpdated(({ postId, likeCount }) => {
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, likes: likeCount } : p)))
    })
    return () => {
      unsubPost()
      unsubReact()
    }
  }, [fetchPosts])

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
        <span className="ml-2 text-xs font-semibold text-slate-500">Đang tải bảng tin diễn đàn...</span>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="rounded-xl border border-rose-200 bg-white px-4 py-10 text-center space-y-3">
        <AlertCircle className="mx-auto h-7 w-7 text-rose-500" />
        <p className="text-sm font-semibold text-rose-700">{errorMessage}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => void fetchPosts()} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Tải lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onPostDeleted={(deletedId) => setPosts((prev) => prev.filter((p) => p.id !== deletedId))}
            onPostUpdated={(updatedPost) =>
              setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)))
            }
          />
        ))
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
          <p className="text-sm font-semibold text-slate-700">Chưa có bài viết nào khớp với bộ lọc hiện tại</p>
          <p className="mt-1 text-xs text-slate-400">
            Hãy thử thay đổi bộ lọc hoặc trở thành người đầu tiên đặt câu hỏi / chia sẻ kinh nghiệm!
          </p>
        </div>
      )}
    </div>
  )
}
