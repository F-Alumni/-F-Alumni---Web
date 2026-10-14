import { ROLES, type Role } from './roles'
import { USER_TYPES, type UserType } from './userTypes'
import type { UserSummary } from '@/types/user.types'

export interface DemoUserConfig extends UserSummary {
  badgeLabel: string
  description: string
  defaultPassword?: string
}

export const DEMO_USERS: Record<'ADMIN' | 'MODERATOR' | 'FACULTY' | 'STUDENT' | 'ALUMNI', DemoUserConfig> = {
  ADMIN: {
    id: '813b0e01-dc56-42f7-ac03-2adbc7289020',
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
    defaultPassword: '123456',
  },
  MODERATOR: {
    id: 'b2129e78-bf86-4056-b82a-468525aed9a4',
    name: 'Campus Safety Moderator',
    email: 'moderator@fpt.edu.vn',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    role: ROLES.MODERATOR,
    userType: USER_TYPES.FACULTY,
    campus: 'HOA_LAC',
    department: 'Student Affairs',
    isVerified: true,
    badgeLabel: 'Safety Moderator',
    description: 'Content moderation, policy enforcement, spam takedowns & reports queue',
    defaultPassword: '123456',
  },
  FACULTY: {
    id: '07af6541-d254-4c8e-b113-47ae64cdf5aa',
    name: 'Dr. Nguyen Van Faculty',
    email: 'faculty.se@fpt.edu.vn',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256',
    role: ROLES.USER,
    userType: USER_TYPES.FACULTY,
    campus: 'HOA_LAC',
    department: 'Kỹ thuật phần mềm',
    isVerified: true,
    badgeLabel: 'Faculty Coordinator',
    description: 'Academic community coordination, department announcements & research opportunities',
    defaultPassword: '123456',
  },
  STUDENT: {
    id: '5a9a53f3-0763-4f81-829a-91d90dc26d15',
    name: 'Chí Trung',
    email: 'student.trung@fpt.edu.vn',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256',
    role: ROLES.USER,
    userType: USER_TYPES.STUDENT,
    campus: 'HCM',
    department: 'Kỹ thuật phần mềm',
    studentId: 'SE170123',
    cohort: 'K17',
    isVerified: false,
    badgeLabel: 'Enrolled Student',
    description: 'Undergraduate student exploring academic forums, capstone advice & alumni network',
    defaultPassword: '123456',
  },
  ALUMNI: {
    id: '7d473fb2-66da-4ac4-8217-e7caf9f365d3',
    name: 'Nguyễn Hoàng Nam',
    email: 'alumni.nam@fpt.edu.vn',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256',
    role: ROLES.USER,
    userType: USER_TYPES.ALUMNI,
    campus: 'HOA_LAC',
    department: 'Kỹ thuật phần mềm',
    studentId: 'SE140456',
    cohort: 'K14',
    isVerified: true,
    badgeLabel: 'Verified Alumni',
    description: 'FPT Software Technical Lead offering mentorship and career referral opportunities',
    defaultPassword: '123456',
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
