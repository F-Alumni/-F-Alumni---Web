import { forumApiClient } from '@/services/api/apiClient'
import type { PagedResponse } from '@/types/admin.types'

export interface ForumPostItem {
  id: string
  authorId: string
  authorName: string
  authorAvatarUrl: string
  title: string
  content: string
  postType: string // Question, Sharing, Recruitment
  major: string
  campus: string
  isAnswered: boolean
  viewCount: number
  likeCount: number
  commentCount: number
  isPinned: boolean
  createdAt: string
  updatedAt?: string | null
  images: string[]
  tags: string[]
}

export interface GetPostsParams {
  campus?: string
  major?: string
  postType?: string
  search?: string
  isAnswered?: boolean
  sort?: string
  page?: number
  pageSize?: number
}

/**
 * Posts and forum discussions service connecting to Forum Service & API Gateway.
 */
export const postsService = {
  /**
   * FO-05: Get community news feed with filtering and pagination.
   * GET /api/v1/posts
   */
  async getPosts(params?: GetPostsParams): Promise<PagedResponse<ForumPostItem>> {
    const res = await forumApiClient.get<PagedResponse<ForumPostItem>>('/posts', {
      params,
    })
    return res.data
  },

  /**
   * FO-03: Get detailed post by ID.
   * GET /api/v1/posts/{id}
   */
  async getPostById(id: string): Promise<ForumPostItem> {
    const res = await forumApiClient.get<ForumPostItem>(`/posts/${id}`)
    return res.data
  },

  /**
   * FO-04: Delete a post permanently (Admin or Post Author).
   * DELETE /api/v1/posts/{id}
   */
  async deletePost(id: string): Promise<void> {
    await forumApiClient.delete(`/posts/${id}`)
  },

  /**
   * FO-16: Mark a question post as resolved / answered.
   * PATCH /api/v1/posts/{id}/answered?isAnswered=true
   */
  async markAnswered(id: string, isAnswered = true): Promise<void> {
    await forumApiClient.patch(`/posts/${id}/answered`, null, {
      params: { isAnswered },
    })
  },
}
