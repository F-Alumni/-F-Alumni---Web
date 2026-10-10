import type { PostType } from '@/constants/postTypes'
import type { UserId } from './user.types'

export type PostId = string

export interface PostSummary {
  id: PostId
  title: string
  authorId: UserId
  type: PostType
  createdAt: string
}

export interface Post extends PostSummary {
  content: string
  communityId?: string
  tags?: string[]
  updatedAt: string
}
