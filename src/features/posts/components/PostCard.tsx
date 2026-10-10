import { useState, type FC } from 'react'
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  CheckCircle2,
  MoreHorizontal,
  ExternalLink,
  Calendar,
  Sparkles,
  Briefcase,
  Award,
  HelpCircle,
  Clock,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface PostItem {
  id: string
  author: {
    name: string
    avatar: string
    role: string
    major: string
    isVerified: boolean
    isOnline?: boolean
  }
  timestamp: string
  community: string
  type: 'EXPERIENCE' | 'QUESTION' | 'JOB' | 'INTERNSHIP' | 'SCHOLARSHIP'
  title: string
  content: string
  images?: string[]
  likes: number
  comments: number
  attachedCard?: {
    type: 'MENTORSHIP' | 'JOB_REFERRAL' | 'TOP_ANSWER'
    title: string
    subtitle: string
    actionLabel: string
    meta?: string
  }
}

interface PostCardProps {
  post: PostItem
}

export const PostCard: FC<PostCardProps> = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [isSaved, setIsSaved] = useState(false)

  const handleToggleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
  }

  const getTypeBadge = () => {
    switch (post.type) {
      case 'EXPERIENCE':
        return (
          <Badge variant="brand-primary" className="gap-1 text-[11px] font-semibold">
            <Sparkles className="h-3 w-3" />
            Share kinh nghiệm
          </Badge>
        )
      case 'QUESTION':
        return (
          <Badge variant="brand-secondary" className="gap-1 text-[11px] font-semibold">
            <HelpCircle className="h-3 w-3" />
            Hỏi đáp cộng đồng
          </Badge>
        )
      case 'JOB':
      case 'INTERNSHIP':
        return (
          <Badge variant="brand-accent" className="gap-1 text-[11px] font-semibold">
            <Briefcase className="h-3 w-3" />
            {post.type === 'JOB' ? 'Tuyển dụng' : 'Thực tập / OJT'}
          </Badge>
        )
      case 'SCHOLARSHIP':
        return (
          <Badge variant="brand-primary" className="gap-1 text-[11px] font-semibold">
            <Award className="h-3 w-3" />
            Học bổng
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Card className="overflow-hidden border-slate-200/90 bg-white shadow-sm transition-all hover:border-slate-300">
      <div className="p-5">
        {/* Header: Author Information & Options */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={post.author.avatar}
              fallback={post.author.name.slice(0, 2)}
              size="md"
              isVerified={post.author.isVerified}
              isOnline={post.author.isOnline}
            />

            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="cursor-pointer text-sm font-bold text-slate-900 hover:text-brand-primary">
                  {post.author.name}
                </span>

                {post.author.isVerified && (
                  <Badge variant="verified" className="gap-0.5 px-1.5 py-0 text-[10px]">
                    <CheckCircle2 className="inline h-3 w-3 text-blue-600" />
                    Verified Alumni
                  </Badge>
                )}

                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-slate-500">{post.author.major}</span>
              </div>

              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">{post.author.role}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  {post.timestamp}
                </span>
                <span>•</span>
                <span className="cursor-pointer rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-brand-secondary hover:underline">
                  {post.community}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getTypeBadge()}
            <button
              type="button"
              className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              title="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Post Title & Content */}
        <div className="mt-2 space-y-2">
          {post.title && (
            <h3 className="cursor-pointer text-base font-bold leading-snug text-slate-900 transition-colors hover:text-brand-primary">
              {post.title}
            </h3>
          )}

          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {post.content}
          </p>
        </div>

        {/* Attached Custom Cards (from Stitch design) */}
        {post.attachedCard && (
          <div className="mt-3.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition-colors hover:bg-slate-100/70">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                {post.attachedCard.type === 'MENTORSHIP' && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-primary">
                    <Calendar className="h-3.5 w-3.5" />
                    Alumni Mentorship Office Hours
                  </div>
                )}

                {post.attachedCard.type === 'JOB_REFERRAL' && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-accent">
                    <Briefcase className="h-3.5 w-3.5" />
                    Internship Opportunities & Internal Referrals
                  </div>
                )}

                {post.attachedCard.type === 'TOP_ANSWER' && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-secondary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Top Answer from Alumni
                  </div>
                )}

                <h4 className="text-sm font-bold text-slate-900">{post.attachedCard.title}</h4>
                <p className="text-xs text-slate-600">{post.attachedCard.subtitle}</p>

                {post.attachedCard.meta && (
                  <p className="pt-1 text-[11px] font-medium text-slate-400">
                    {post.attachedCard.meta}
                  </p>
                )}
              </div>

              <Button
                variant={post.attachedCard.type === 'JOB_REFERRAL' ? 'default' : 'secondary'}
                size="sm"
                className="shadow-xs shrink-0 rounded-full text-xs font-semibold"
              >
                {post.attachedCard.actionLabel}
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>
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
              <Heart className={cn('h-4 w-4', isLiked && 'fill-current text-red-600')} />
              <span>{likesCount}</span>
            </button>

            {/* Comment Button */}
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-brand-secondary"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments} comments</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Save / Bookmark Button */}
            <button
              type="button"
              onClick={() => setIsSaved(!isSaved)}
              className={cn(
                'rounded-full p-2 transition-colors',
                isSaved
                  ? 'bg-slate-100 text-brand-primary'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              )}
              title={isSaved ? 'Saved' : 'Save post'}
            >
              <Bookmark className={cn('h-4 w-4', isSaved && 'fill-current text-brand-primary')} />
            </button>

            {/* Share Button */}
            <button
              type="button"
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}



