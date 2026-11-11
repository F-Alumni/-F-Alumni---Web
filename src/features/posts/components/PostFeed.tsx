import { useState, useEffect, useCallback, type FC } from 'react'
import { PostCard, type PostItem } from './PostCard'
import type { PostCategoryFilter } from './PostFeedFilters'
import { postsService, type ForumPostItem } from '@/services/posts'
import { Loader2 } from 'lucide-react'

interface PostFeedProps {
  category: PostCategoryFilter
  community: string
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
      name: p.authorName || 'FPT Alumni',
      avatar:
        p.authorAvatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      role: p.major ? `Khoa ${p.major}` : 'Thành viên cựu SV',
      major: p.major || 'FPT University',
      isVerified: true,
      isOnline: true,
    },
    timestamp,
    community: p.major ? `#${p.major}` : '#General',
    type,
    title: p.title,
    content: p.content,
    images: p.images && p.images.length > 0 ? p.images : undefined,
    likes: p.likeCount || 0,
    comments: p.commentCount || 0,
  }
}

export const PostFeed: FC<PostFeedProps> = ({ category, community, refreshTrigger }) => {
  const [posts, setPosts] = useState<PostItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      let postType: string | undefined
      if (category === 'QUESTIONS') postType = 'Question'
      else if (category === 'JOBS' || category === 'INTERNSHIPS') postType = 'Recruitment'
      else if (category === 'EXPERIENCES') postType = 'Sharing'

      let major: string | undefined
      if (community && community !== 'All Communities' && community !== 'Tất cả cộng đồng') {
        const commLower = community.toLowerCase()
        if (commLower.includes('software')) major = 'SE'
        else if (commLower.includes('ai') || commLower.includes('intelligence')) major = 'AI'
        else if (commLower.includes('design')) major = 'GD'
        else if (commLower.includes('business')) major = 'IB'
      }

      const res = await postsService.getPosts({
        postType,
        major,
        page: 1,
        pageSize: 30,
      })

      const rawItems = res?.items || []
      setPosts(rawItems.map(mapBackendPostToPostItem))
    } catch (err) {
      console.warn('Could not load forum posts from backend:', err)
      setPosts([])
    } finally {
      setIsLoading(false)
    }
  }, [category, community])

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPosts()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchPosts, refreshTrigger])

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
        <span className="ml-2 text-xs font-semibold text-slate-500">Đang tải bảng tin diễn đàn...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.length > 0 ? (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
          <p className="text-sm font-semibold text-slate-700">Chưa có bài viết nào trong danh mục này</p>
          <p className="mt-1 text-xs text-slate-400">
            Hãy là người đầu tiên chia sẻ kinh nghiệm hoặc đặt câu hỏi cho cộng đồng!
          </p>
        </div>
      )}
    </div>
  )
}
