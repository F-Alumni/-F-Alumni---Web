import type { OpportunityType } from '@/constants/opportunityTypes'
import type { UserId } from './user.types'

export type OpportunityId = string

export interface OpportunitySummary {
  id: OpportunityId
  title: string
  organization: string
  type: OpportunityType
  location?: string
  deadline?: string
  postedById: UserId
  createdAt: string
}

export interface Opportunity extends OpportunitySummary {
  description: string
  requirements?: string[]
  applicationUrl?: string
  updatedAt: string
}
