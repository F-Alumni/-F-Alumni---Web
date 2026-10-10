import type { CommunityType } from '@/constants/communityTypes'

export type CommunityId = string

export interface CommunitySummary {
  id: CommunityId
  name: string
  slug: string
  type: CommunityType
  memberCount: number
}

export interface Community extends CommunitySummary {
  description: string
  createdAt: string
  updatedAt: string
}
