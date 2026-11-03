import { forumApiClient } from '@/services/api/apiClient'
import type { PagedResponse } from '@/types/admin.types'

export interface CommunityEventItem {
  id: string
  creatorId: string
  creatorName: string
  creatorAvatarUrl: string
  title: string
  description: string
  bannerUrl?: string
  location: string
  campus: string
  startTime: string
  endTime: string
  maxAttendees?: number | null
  goingCount: number
  interestedCount: number
  createdAt: string
  myStatus?: string | null
}

export interface CreateEventPayload {
  title: string
  description: string
  bannerUrl?: string
  location: string
  campus?: string
  startTime: string
  endTime: string
  maxAttendees?: number | null
}

export interface GetEventsParams {
  campus?: string
  upcomingOnly?: boolean
  page?: number
  pageSize?: number
}

/**
 * Opportunities & Community Events service connecting to Forum Service & API Gateway.
 */
export const opportunitiesService = {
  /**
   * List upcoming community events, meetups, and workshops.
   * GET /api/v1/events
   */
  async getEvents(params?: GetEventsParams): Promise<PagedResponse<CommunityEventItem>> {
    const res = await forumApiClient.get<PagedResponse<CommunityEventItem>>('/events', {
      params,
    })
    return res.data
  },

  /**
   * Get specific event by ID.
   * GET /api/v1/events/{id}
   */
  async getEventById(id: string): Promise<CommunityEventItem> {
    const res = await forumApiClient.get<CommunityEventItem>(`/events/${id}`)
    return res.data
  },

  /**
   * Create a new community event or meetup.
   * POST /api/v1/events
   */
  async createEvent(payload: CreateEventPayload): Promise<CommunityEventItem> {
    const res = await forumApiClient.post<CommunityEventItem>('/events', payload)
    return res.data
  },

  /**
   * Delete an event (Admin or Creator).
   * DELETE /api/v1/events/{id}
   */
  async deleteEvent(id: string): Promise<void> {
    await forumApiClient.delete(`/events/${id}`)
  },
}
