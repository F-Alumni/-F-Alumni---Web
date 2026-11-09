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

const INITIAL_POSTS: PostItem[] = [
  {
    id: 'demo-1',
    author: {
      name: 'Dr. Marcus Vance',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
      role: 'Principal Architect @ Google',
      major: "SE '16",
      isVerified: true,
      isOnline: true,
    },
    timestamp: '2 hours ago',
    community: '#Software-Engineering',
    type: 'EXPERIENCE',
    title: 'Navigating 2026 New-Grad Distributed Systems Interview Panels',
    content:
      "To FPT students preparing for SE interviews: Here are 3 distributed architecture topics that senior hiring committees often dive deepest into this quarter.\n\nDon't just memorize LeetCode—understand the nature of trade-offs in distributed caches (Redis/Memcached), horizontal partitioning models, and asynchronous event queues (Kafka).",
    attachedCard: {
      type: 'MENTORSHIP',
      title: 'System Design Whiteboard Session with Google Alumni',
      subtitle:
        'This Thursday at 20:00 (Online). Microservices architecture and real-world load handling analysis.',
      actionLabel: 'Register now',
      meta: '38 FPT students registered • Limited to 50 slots',
    },
    likes: 142,
    comments: 28,
  },
  {
    id: 'demo-2',
    author: {
      name: 'Elena Rostova',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
      role: 'Senior Product Designer @ Stripe',
      major: "Digital Design '18",
      isVerified: true,
    },
    timestamp: '4 hours ago',
    community: '#Design-And-Product',
    type: 'JOB',
    title: "Stripe UI/UX Design Summer Intern '26 (OJT & Internship)",
    content:
      'The FinTech UX team at Stripe is officially opening 2 Summer Product Design Intern positions! I will provide an Internal Alumni Referral for FPT 3rd or 4th-year students with a coherent portfolio case study and solid prototyping skills.',
    attachedCard: {
      type: 'JOB_REFERRAL',
      title: 'Stripe UI Design Summer Intern 2026',
      subtitle: 'Hybrid (Singapore / Remote) • Competitive Salary & Relocation Support',
      actionLabel: 'Get Referral',
      meta: '3 FPT Alumni working at Stripe',
    },
    likes: 89,
    comments: 24,
  },
  {
    id: 'demo-3',
    author: {
      name: 'Aiden Patel',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
      role: 'B.S. Biomedical Engineering • VC Analyst',
      major: "Cohort 15 '24",
      isVerified: false,
    },
    timestamp: '6 hours ago',
    community: '#Fintech-Founders',
    type: 'QUESTION',
    title:
      'Q&A: Pivoting from Academic Research to Venture Capital?',
    content:
      "I am in my specialized semester and deciding between pursuing a deep-tech Master's degree or applying to tech venture capital funds. Could alumni shed some light on whether fund partners value practical operational experience or academic degrees more?",
    attachedCard: {
      type: 'TOP_ANSWER',
      title: 'Priya Sharma - Partner @ BlueShift Ventures (Alumni K11)',
      subtitle:
        '"Practical operational experience and deep understanding of runway and unit economics are always prioritized over just a degree. You should join early-stage startups or build products first!"',
      actionLabel: 'View answer',
    },
    likes: 47,
    comments: 18,
  },
]

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
      if (rawItems.length > 0) {
        setPosts(rawItems.map(mapBackendPostToPostItem))
      } else {
        // Fallback to initial seed demo posts filtered by category
        const filtered = INITIAL_POSTS.filter((post) => {
          if (category === 'EXPERIENCES' && post.type !== 'EXPERIENCE') return false
          if (category === 'QUESTIONS' && post.type !== 'QUESTION') return false
          if (category === 'JOBS' && post.type !== 'JOB') return false
          return true
        })
        setPosts(filtered)
      }
    } catch (err) {
      console.warn('Could not load forum posts from backend, using fallback demo posts:', err)
      setPosts(INITIAL_POSTS)
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
