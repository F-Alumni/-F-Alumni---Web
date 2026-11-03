import { forumApiClient } from '@/services/api/apiClient'

export interface ForumCategoryItem {
  id: string
  name: string
  slug: string
  description: string
}

/**
 * Communities & Discussion Categories service connecting to Forum Service & API Gateway.
 */
export const communitiesService = {
  /**
   * Get all forum discussion categories (Software Engineering, AI, Security, Career, Life).
   * GET /api/v1/categories
   */
  async getCategories(): Promise<ForumCategoryItem[]> {
    const res = await forumApiClient.get<ForumCategoryItem[]>('/categories')
    return res.data
  },
}
