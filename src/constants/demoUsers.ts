import { ROLES, type Role } from './roles'
import { USER_TYPES, type UserType } from './userTypes'
import type { UserSummary } from '@/types/user.types'

export interface DemoUserConfig extends UserSummary {
  badgeLabel: string
  description: string
  defaultPassword?: string
}

export const DEMO_USERS: Record<'ADMIN', DemoUserConfig> = {
  ADMIN: {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'FPT System Administrator',
    email: 'admin@fpt.edu.vn',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    role: ROLES.ADMIN,
    userType: USER_TYPES.FACULTY,
    campus: 'HOA_LAC',
    department: 'Information Assurance',
    isVerified: true,
    badgeLabel: 'Super Admin',
    description: 'System governance, user lifecycle, verifications & platform configuration',
    defaultPassword: 'Password@123',
  },
}

export const getDemoUserByEmail = (email: string): DemoUserConfig | undefined => {
  const normalized = email.trim().toLowerCase()
  return Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === normalized)
}

export const getDemoUserByRole = (
  _role?: Role,
  _userType?: UserType
): DemoUserConfig => {
  return DEMO_USERS.ADMIN
}
