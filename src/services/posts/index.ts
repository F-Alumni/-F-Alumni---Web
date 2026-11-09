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
  hasLiked?: boolean
  isBookmarked?: boolean
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

export interface CreatePostPayload {
  title: string
  content: string
  postType?: string // Question, Sharing, Recruitment
  major?: string // SE, AI, IA, etc.
  campus?: string // FU-HCM, FU-HL, etc.
  imageUrls?: string[]
  tags?: string[]
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
   * FO-01, FO-02, FO-03: Create a new post in the forum.
   * POST /api/v1/posts
   */
  async createPost(payload: CreatePostPayload): Promise<ForumPostItem> {
    const res = await forumApiClient.post<ForumPostItem>('/posts', {
      title: payload.title.trim(),
      content: payload.content.trim(),
      postType: payload.postType || 'Sharing',
      major: payload.major || 'All',
      campus: payload.campus || 'All',
      imageUrls: payload.imageUrls || [],
      tags: payload.tags || [],
    })
    return res.data
  },

  /**
   * FO-08: Like or unlike a post (toggle).
   * POST /api/v1/posts/{id}/react
   */
  async toggleReaction(postId: string): Promise<{ postId: string; isLiked: boolean }> {
    const res = await forumApiClient.post<{ postId: string; isLiked: boolean }>(`/posts/${postId}/react`)
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
