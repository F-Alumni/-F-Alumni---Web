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

export interface PostCommentItem {
  id: string
  postId: string
  authorId: string
  authorName: string
  authorAvatarUrl: string
  content: string
  parentCommentId?: string | null
  isAcceptedAnswer: boolean
  createdAt: string
  updatedAt?: string | null
  replies?: PostCommentItem[]
}

export interface CreateCommentPayload {
  content: string
  parentCommentId?: string | null
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
   * FO-06: Get all top-level comments and nested replies for a post.
   * GET /api/v1/posts/{postId}/comments
   */
  async getComments(postId: string): Promise<PostCommentItem[]> {
    const res = await forumApiClient.get<PostCommentItem[]>(`/posts/${postId}/comments`)
    return res.data
  },

  /**
   * FO-06, FO-07: Add a new comment or threaded reply under a post.
   * POST /api/v1/posts/{postId}/comments
   */
  async addComment(postId: string, payload: CreateCommentPayload): Promise<PostCommentItem> {
    const res = await forumApiClient.post<PostCommentItem>(`/posts/${postId}/comments`, payload)
    return res.data
  },

  /**
   * FO-16: Post author accepts this comment as the official solution (Best Answer - BR-03).
   * POST /api/v1/comments/{commentId}/accept
   */
  async acceptAnswer(commentId: string): Promise<PostCommentItem> {
    const res = await forumApiClient.post<PostCommentItem>(`/comments/${commentId}/accept`)
    return res.data
  },

  /**
   * FO-04: Update an existing post (Post Author or Admin).
   * PUT /api/v1/posts/{id}
   */
  async updatePost(
    id: string,
    payload: CreatePostPayload & { isAnswered?: boolean }
  ): Promise<ForumPostItem> {
    const res = await forumApiClient.put<ForumPostItem>(`/posts/${id}`, {
      title: payload.title.trim(),
      content: payload.content.trim(),
      postType: payload.postType || 'Sharing',
      major: payload.major || 'All',
      campus: payload.campus || 'All',
      isAnswered: payload.isAnswered ?? false,
      imageUrls: payload.imageUrls || [],
      tags: payload.tags || [],
    })
    return res.data
  },

  /**
   * FO-11: Report violating post or comment.
   * POST /api/v1/reports
   */
  async reportPost(
    targetId: string,
    payload: { reason: string; details?: string; targetType?: 'Post' | 'Comment' }
  ): Promise<void> {
    await forumApiClient.post('/reports', {
      targetType: payload.targetType || 'Post',
      targetId,
      reason: payload.details ? `${payload.reason}: ${payload.details}` : payload.reason,
      details: payload.details,
    })
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

  /**
   * FO-10: Get posts created by the currently authenticated user.
   * GET /api/v1/posts/me
   */
  async getMyPosts(page = 1, pageSize = 10): Promise<PagedResponse<ForumPostItem>> {
    const res = await forumApiClient.get<PagedResponse<ForumPostItem>>('/posts/me', {
      params: { page, pageSize },
    })
    return res.data
  },

  /**
   * FO-09: Bookmark or remove a bookmark on a post (toggle).
   * POST /api/v1/posts/{postId}/bookmark
   */
  async toggleBookmark(postId: string): Promise<{ postId: string; isBookmarked: boolean }> {
    const res = await forumApiClient.post<{ postId: string; isBookmarked: boolean }>(`/posts/${postId}/bookmark`)
    return res.data
  },

  /**
   * FO-09: Get all saved/bookmarked posts for the current user.
   * GET /api/v1/bookmarks/me
   */
  async getMyBookmarks(page = 1, pageSize = 10): Promise<PagedResponse<ForumPostItem>> {
    const res = await forumApiClient.get<PagedResponse<ForumPostItem>>('/bookmarks/me', {
      params: { page, pageSize },
    })
    return res.data
  },
}

