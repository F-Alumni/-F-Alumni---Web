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

export interface EventAttendeeItem {
  id: string
  eventId: string
  userId: string
  fullName: string
  avatarUrl: string
  status: string // 'Going' | 'Interested' | 'NotGoing'
  createdAt: string
}

export type EventRsvpStatus = 'Going' | 'Interested' | 'NotGoing'

export interface RsvpResponse {
  eventId: string
  status: EventRsvpStatus
  message: string
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
   * Join or update RSVP status for an event (Going, Interested, NotGoing).
   * POST /api/v1/events/{id}/rsvp
   */
  async rsvpEvent(id: string, status: EventRsvpStatus): Promise<RsvpResponse> {
    const res = await forumApiClient.post<RsvpResponse>(`/events/${id}/rsvp`, { status })
    return res.data
  },

  /**
   * List all attendees/participants for an event.
   * GET /api/v1/events/{id}/attendees
   */
  async getAttendees(id: string): Promise<EventAttendeeItem[]> {
    const res = await forumApiClient.get<EventAttendeeItem[]>(`/events/${id}/attendees`)
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
