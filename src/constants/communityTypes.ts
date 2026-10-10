/**
 * Centralized Community Type Constants.
 */

export const COMMUNITY_TYPES = {
  ACADEMIC_MAJOR: 'ACADEMIC_MAJOR',
  GENERAL: 'GENERAL',
  SPECIAL_INTEREST: 'SPECIAL_INTEREST',
} as const

export type CommunityType = (typeof COMMUNITY_TYPES)[keyof typeof COMMUNITY_TYPES]
