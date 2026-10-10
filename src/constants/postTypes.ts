/**
 * Centralized Post Type Constants.
 */

export const POST_TYPES = {
  GENERAL: 'GENERAL',
  QUESTION: 'QUESTION',
  EXPERIENCE: 'EXPERIENCE',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
} as const

export type PostType = (typeof POST_TYPES)[keyof typeof POST_TYPES]
