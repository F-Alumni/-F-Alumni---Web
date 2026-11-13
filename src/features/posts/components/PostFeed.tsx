import { useState, useEffect, useCallback, type FC } from 'react'
import { PostCard, type PostItem } from './PostCard'
import type { PostCategoryFilter, PostSortOption, QuestionStatusFilter } from './PostFeedFilters'
import { postsService, type ForumPostItem } from '@/services/posts'
import { IconLoader2 } from '@tabler/icons-react'

interface PostFeedProps {
  targetPostId?: string
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
  if (pt.includes('question')) type = 'QUESTION'
  else if (pt.includes('recruit') || pt.includes('job')) type = 'JOB'
  else if (pt.includes('intern')) type = 'INTERNSHIP'
  else if (pt.includes('scholar')) type = 'SCHOLARSHIP'
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
      role: p.major ? `Khoa ${p.major}` : 'Thành viên cựu SV',
      major: p.major || 'FPT University',
      isVerified: true,
      isOnline: true,
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
  targetPostId,
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

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      let postType: string | undefined
      if (category === 'QUESTIONS' || questionStatus !== 'ALL') postType = 'Question'
      else if (category === 'JOBS') postType = 'Recruitment'
      else if (category === 'EXPERIENCES') postType = 'Sharing'

      let major: string | undefined
      if (
        community &&
        community !== 'ALL' &&
        community !== 'All' &&
        community !== 'All Communities' &&
        community !== 'Tất cả cộng đồng' &&
        community !== 'Tất cả chuyên ngành'
      ) {
        const commLower = community.toLowerCase()
        if (community === 'SE' || commLower.includes('software') || commLower.includes('(se)')) major = 'SE'
        else if (community === 'AI' || commLower.includes('ai') || commLower.includes('intelligence')) major = 'AI'
        else if (community === 'IA' || commLower.includes('assurance') || commLower.includes('(ia)')) major = 'IA'
        else if (community === 'GD' || commLower.includes('design') || commLower.includes('(gd)')) major = 'GD'
        else if (community === 'IB' || commLower.includes('international') || commLower.includes('(ib)')) major = 'IB'
        else if (community === 'BA' || commLower.includes('business') || commLower.includes('(ba)')) major = 'BA'
        else major = community
      }

      const isAnsweredParam =
        questionStatus === 'ANSWERED'
          ? true
          : questionStatus === 'UNANSWERED'
          ? false
          : undefined

      let campusParam: string | undefined
      if (campus && campus !== 'ALL' && campus !== 'All' && campus !== 'Tất cả cơ sở') {
        if (campus === 'Hòa Lạc' || campus === 'FU-HL') campusParam = 'FU-HL'
        else if (campus === 'Hồ Chí Minh' || campus === 'TP. HCM' || campus === 'FU-HCM') campusParam = 'FU-HCM'
        else if (campus === 'Đà Nẵng' || campus === 'FU-DN') campusParam = 'FU-DN'
        else if (campus === 'Cần Thơ' || campus === 'FU-CT') campusParam = 'FU-CT'
        else if (campus === 'Quy Nhơn' || campus === 'FU-QN') campusParam = 'FU-QN'
        else campusParam = campus
      }

      const res = await postsService.getPosts({
        postType,
        major,
        campus: campusParam,
        search: searchKeyword.trim() || undefined,
        isAnswered: isAnsweredParam,
        sort: sortBy,
        page: 1,
        pageSize: 30,
      })

      let rawItems = res?.items || []

      // If deep linking to a specific post ID, ensure it is fetched and placed first
      if (targetPostId) {
        const foundIndex = rawItems.findIndex((p) => p.id === targetPostId)
        if (foundIndex > 0) {
          const removed = rawItems.splice(foundIndex, 1)
          if (removed[0]) {
            rawItems.unshift(removed[0])
          }
        } else if (foundIndex === -1) {
          try {
            const singlePost = await postsService.getPostById(targetPostId)
            if (singlePost) {
              rawItems.unshift(singlePost)
            }
          } catch (fetchErr) {
            console.warn(`Could not fetch target post ${targetPostId}:`, fetchErr)
          }
        }
      }

      // Client-side filter/sort reinforcement so UI filters always respond accurately
      if (campus && campus !== 'ALL') {
        rawItems = rawItems.filter(
          (item) => !item.campus || item.campus === 'All' || item.campus.toLowerCase().includes(campus.toLowerCase())
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
      console.warn('Could not load forum posts from backend:', err)
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }, [category, community, campus, searchKeyword, sortBy, questionStatus, targetPostId])

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPosts()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchPosts, refreshTrigger])

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-white">
        <IconLoader2 className="h-6 w-6 animate-spin text-brand-primary" />
        <span className="ml-2 text-xs font-semibold text-slate-500">Đang tải bảng tin diễn đàn...</span>
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
            isTargetPost={post.id === targetPostId}
            initialOpenComments={post.id === targetPostId}
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
