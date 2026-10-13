import { ROLES, type Role } from './roles'
import { USER_TYPES, type UserType } from './userTypes'
import type { UserSummary } from '@/types/user.types'

export interface DemoUserConfig extends UserSummary {
  badgeLabel: string
  description: string
}

export const DEMO_USERS: Record<'ADMIN' | 'MODERATOR' | 'FACULTY' | 'STUDENT' | 'ALUMNI', DemoUserConfig> = {
  ADMIN: {
    id: 'USR-ADMIN-01',
    name: 'FPT Super Admin',
    email: 'admin@fpt.edu.vn',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    role: ROLES.ADMIN,
    userType: USER_TYPES.FACULTY,
    campus: 'HOA_LAC',
    department: 'Information Assurance & Administration',
    isVerified: true,
    badgeLabel: 'Super Admin',
    description: 'System governance, user lifecycle, verifications & platform configuration',
  },
  MODERATOR: {
    id: 'USR-MOD-01',
    name: 'Campus Safety Moderator',
    email: 'moderator@fpt.edu.vn',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    role: ROLES.MODERATOR,
    userType: USER_TYPES.FACULTY,
    campus: 'HOA_LAC',
    department: 'Student Affairs & Content Safety',
    isVerified: true,
    badgeLabel: 'Safety Moderator',
    description: 'Content moderation, policy enforcement, spam takedowns & reports queue',
  },
  FACULTY: {
    id: 'USR-FACULTY-01',
    name: 'Dr. Nguyen Van Faculty',
    email: 'faculty.se@fpt.edu.vn',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256',
    role: ROLES.USER,
    userType: USER_TYPES.FACULTY,
    campus: 'HOA_LAC',
    department: 'Software Engineering',
    isVerified: true,
    badgeLabel: 'Faculty Coordinator',
    description: 'Academic community coordination, department announcements & research opportunities',
  },
  STUDENT: {
    id: 'USR-STUDENT-01',
    name: 'Le Hoang Student',
    email: 'student.se@fpt.edu.vn',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256',
    role: ROLES.USER,
    userType: USER_TYPES.STUDENT,
    campus: 'HOA_LAC',
    department: 'Software Engineering',
    studentId: 'SE170123',
    cohort: 'K17',
    isVerified: false,
    badgeLabel: 'Enrolled Student',
    description: 'Undergraduate student exploring academic forums, capstone advice & alumni network',
  },
  ALUMNI: {
    id: 'USR-ALUMNI-01',
    name: 'Tran Minh Alumni',
    email: 'alumni.se@fpt.edu.vn',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256',
    role: ROLES.USER,
    userType: USER_TYPES.ALUMNI,
    campus: 'HOA_LAC',
    department: 'Software Engineering',
    studentId: 'SE140456',
    cohort: 'K14',
    isVerified: true,
    badgeLabel: 'Verified Alumni',
    description: 'FPT Software Technical Lead offering mentorship and career referral opportunities',
  },
}

export const getDemoUserByEmail = (email: string): DemoUserConfig | undefined => {
  const normalized = email.trim().toLowerCase()
  return Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === normalized)
}

export const getDemoUserByRole = (
  role: Role,
  userType?: UserType
): DemoUserConfig => {
  if (role === ROLES.ADMIN) return DEMO_USERS.ADMIN
  if (role === ROLES.MODERATOR) return DEMO_USERS.MODERATOR
  if (userType === USER_TYPES.FACULTY) return DEMO_USERS.FACULTY
  if (userType === USER_TYPES.ALUMNI) return DEMO_USERS.ALUMNI
  return DEMO_USERS.STUDENT
}
