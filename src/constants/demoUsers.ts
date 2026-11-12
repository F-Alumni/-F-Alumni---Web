import { ROLES, type Role } from './roles'
import { USER_TYPES, type UserType } from './userTypes'
import type { UserSummary } from '@/types/user.types'

export interface DemoUserConfig extends UserSummary {
  badgeLabel: string
  description: string
  defaultPassword?: string
}

export const DEMO_USERS: Record<'ADMIN' | 'STUDENT' | 'ALUMNI', DemoUserConfig> = {
  ADMIN: {
    id: 'c82d2f06-ef2a-4159-ab1d-69530948fc8a',
    name: 'FPT System Administrator',
    email: 'admin@fpt.edu.vn',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    role: ROLES.ADMIN,
    userType: USER_TYPES.FACULTY,
    campus: 'HOA_LAC',
    department: 'Information Assurance',
    isVerified: true,
    badgeLabel: 'Super Admin',
    description: 'Quản trị hệ thống, duyệt cựu sinh viên & điều phối nền tảng',
    defaultPassword: 'Password@123',
  },
  STUDENT: {
    id: '3ab95070-0dfd-4ca4-b134-373fff8f6c2e',
    name: 'FPT Student K18',
    email: 'student@fpt.edu.vn',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256',
    role: ROLES.USER,
    userType: USER_TYPES.STUDENT,
    campus: 'HOA_LAC',
    department: 'Software Engineering',
    studentId: 'SE180001',
    cohort: 'K18',
    isVerified: true,
    badgeLabel: 'Sinh viên K18',
    description: 'Học tập, tìm kiếm thực tập OJT và kết nối Mentor Cựu sinh viên',
    defaultPassword: 'Password@123',
  },
  ALUMNI: {
    id: '5d0453bb-f5de-4187-8a8a-3b13b462557a',
    name: 'Nguyễn Văn A (Alumni Senior)',
    email: 'alumni.test@fpt.edu.vn',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    role: ROLES.USER,
    userType: USER_TYPES.ALUMNI,
    campus: 'HCM',
    department: 'Software Engineering',
    studentId: 'SE140001',
    cohort: 'K14',
    isVerified: true,
    badgeLabel: 'Alumni K14',
    description: 'Senior Engineer @ FPT Software, chia sẻ cơ hội việc làm & hướng dẫn capstone',
    defaultPassword: 'Password@123',
  },
}

export const getDemoUserByEmail = (email: string): DemoUserConfig | undefined => {
  const normalized = email.trim().toLowerCase()
  return Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === normalized)
}

export const getDemoUserByRole = (
  role?: Role,
  userType?: UserType
): DemoUserConfig => {
  if (role === ROLES.ADMIN) return DEMO_USERS.ADMIN
  if (userType === USER_TYPES.STUDENT) return DEMO_USERS.STUDENT
  if (userType === USER_TYPES.ALUMNI) return DEMO_USERS.ALUMNI
  return DEMO_USERS.STUDENT
}
