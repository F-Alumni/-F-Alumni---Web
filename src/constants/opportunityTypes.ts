/**
 * Centralized Opportunity Type Constants.
 */

export const OPPORTUNITY_TYPES = {
  JOB: 'JOB',
  INTERNSHIP: 'INTERNSHIP',
  SCHOLARSHIP: 'SCHOLARSHIP',
} as const

export type OpportunityType = (typeof OPPORTUNITY_TYPES)[keyof typeof OPPORTUNITY_TYPES]
