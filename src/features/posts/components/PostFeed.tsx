import { useMemo, type FC } from 'react'
import { PostCard, type PostItem } from './PostCard'
import type { PostCategoryFilter } from './PostFeedFilters'

interface PostFeedProps {
  category: PostCategoryFilter
  community: string
}

const INITIAL_POSTS: PostItem[] = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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
  {
    id: '4',
    author: {
      name: 'Trần Minh Đức',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
      role: 'Co-founder & CTO @ AgriAI Tech',
      major: 'Software Engineering K11',
      isVerified: true,
    },
    timestamp: '8 hours ago',
    community: '#AI-Robotics-Hub',
    type: 'EXPERIENCE',
    title: 'From FPT Capstone Project to Successful $500k Seed Round Startup',
    content:
      'Chia sẻ với các bạn sinh viên FPT Hòa Lạc đang bước vào kỳ làm Capstone:\n\n1. Hãy tìm một bài toán thực tế có khách hàng sẵn sàng trả tiền, đừng chỉ chọn đề tài làm đồ án để đối phó.\n2. Chọn đồng đội có kỹ năng bổ trợ lẫn nhau: 1 bạn tập trung Product/AI, 1 bạn System Backend, 1 bạn phụ trách Business/Pitching.\n3. Các thầy cô và mạng lưới Cựu SV là kênh phản biện quý giá nhất!',
    images: [
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
    ],
    likes: 215,
    comments: 43,
  },
]

export const PostFeed: FC<PostFeedProps> = ({ category, community }) => {
  const filteredPosts = useMemo(() => {
    return INITIAL_POSTS.filter((post) => {
      // Category filter
      if (category === 'EXPERIENCES' && post.type !== 'EXPERIENCE') return false
      if (category === 'QUESTIONS' && post.type !== 'QUESTION') return false
      if (category === 'JOBS' && post.type !== 'JOB') return false
      if (category === 'INTERNSHIPS' && post.type !== 'INTERNSHIP') return false
      if (category === 'SCHOLARSHIPS' && post.type !== 'SCHOLARSHIP') return false

      // Community filter
      if (community !== 'All Communities') {
        const normalizedComm = community.toLowerCase()
        if (
          normalizedComm.includes('software') &&
          !post.community.toLowerCase().includes('software')
        ) {
          return false
        }
        if (
          normalizedComm.includes('artificial intelligence') &&
          !post.community.toLowerCase().includes('ai')
        ) {
          return false
        }
      }

      return true
    })
  }, [category, community])

  return (
    <div className="space-y-4">
      {filteredPosts.length > 0 ? (
        filteredPosts.map((post) => <PostCard key={post.id} post={post} />)
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
          <p className="text-sm font-semibold text-slate-700">No posts found in this category</p>
          <p className="mt-1 text-xs text-slate-400">
            Be the first to share an experience or ask a question in the community!
          </p>
        </div>
      )}
    </div>
  )
}


