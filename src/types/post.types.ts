import type { PostType } from '@/constants/postTypes'
import type { UserId, UserSummary } from './user.types'

export type PostId = string

export type PostStatus =
  | 'PUBLISHED'
  | 'HIDDEN'
  | 'FLAGGED'
  | 'ARCHIVED'
  | 'active'
  | 'pending'
  | 'rejected'

export interface PostAuthor {
  id: string
  name: string
  email?: string
  avatarUrl?: string
  role?: string
  userType?: string
  isVerified?: boolean
}

export interface PostSummary {
  id: PostId
  title?: string
  authorId: UserId
  type: PostType
  createdAt: string
}

export interface AttachedCard {
  type: 'REFERRAL' | 'CAPSTONE' | 'LINK'
  title: string
  companyOrDept?: string
  linkUrl?: string
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  author: UserSummary | PostAuthor
  content: string
  createdAt: string
  updatedAt?: string
  parentCommentId?: string
  likesCount?: number
}

export interface Post extends PostSummary {
  content: string
  contentSnippet?: string
  author: UserSummary | PostAuthor
  authorName?: string
  authorRole?: string
  communityId?: string
  communityName?: string
  community?: string
  images?: string[]
  tags?: string[]
  attachedCard?: AttachedCard
  likesCount: number
  commentsCount: number
  isLiked?: boolean
  status: PostStatus
  isPinned?: boolean
  pinnedUntil?: string
  updatedAt: string
}

export interface PostRecord {
  id: string
  authorName: string
  authorRole: string
  community: string
  title: string
  contentSnippet: string
  likesCount: number
  commentsCount: number
  status: 'active' | 'pending' | 'rejected' | PostStatus
  createdAt: string
}

export interface PostWithComments extends Post {
  comments: Comment[]
}

export interface GetPostsParams {
  campus?: string
  type?: PostType | 'ALL' | string
  communityId?: string
  authorId?: string
  search?: string
  status?: PostStatus | 'ALL' | string
  page?: number
  limit?: number
}

export interface CreatePostPayload {
  title?: string
  content: string
  type: PostType
  communityId?: string
  images?: string[]
  tags?: string[]
  attachedCard?: AttachedCard
}

export interface UpdatePostVisibilityPayload {
  status: 'HIDDEN' | 'PUBLISHED' | 'active' | 'rejected'
  reason?: string
}

export interface LikePostResponse {
  liked: boolean
  likeCount: number
}

export interface CommentPostPayload {
  content: string
  parentCommentId?: string
}
