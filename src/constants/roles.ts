/**
 * Centralized Role Constants.
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  MODERATOR: 'MODERATOR',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]
