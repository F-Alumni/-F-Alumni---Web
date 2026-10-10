/**
 * Centralized User Type Constants.
 */

export const USER_TYPES = {
  STUDENT: 'STUDENT',
  ALUMNI: 'ALUMNI',
  FACULTY: 'FACULTY',
} as const

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES]
