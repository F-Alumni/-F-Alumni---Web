import type { Role } from '@/constants/roles'
import type { UserType } from '@/constants/userTypes'

export type UserId = string

export type CampusCode = 'HOA_LAC' | 'DA_NANG' | 'HCM' | 'CAN_THO' | 'QUY_NHON'

export type UserStatus =
  | 'ACTIVE'
  | 'BANNED'
  | 'SUSPENDED'
  | 'PENDING'
  | 'active'
  | 'pending'
  | 'banned'

export interface UserSummary {
  id: UserId
  name: string
  email: string
  avatarUrl?: string
  role: Role
  userType: UserType
  campus?: CampusCode | string
  isVerified?: boolean
  department?: string
  studentId?: string
  cohort?: string
}

export interface UserProfile extends UserSummary {
  bio?: string
  graduationYear?: number
  phone?: string
  linkedinUrl?: string
  githubUrl?: string
  currentCompany?: string
  currentPosition?: string
  industry?: string
  skills?: string[]
  createdAt: string
  updatedAt: string
}

export interface UserRecord extends UserSummary {
  major?: string
  status: UserStatus
  joinedDate?: string
  createdAt?: string
  lastLoginAt?: string
}

export interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: Role | 'ALL' | string
  campus?: CampusCode | string | 'ALL'
  status?: UserStatus | 'ALL' | string
  userType?: UserType | 'ALL' | string
}

export interface UpdateUserStatusPayload {
  status: 'ACTIVE' | 'BANNED' | 'SUSPENDED' | 'active' | 'banned'
  reason?: string
}

export interface SearchDirectoryParams {
  query?: string
  campus?: CampusCode | string
  department?: string
  major?: string
  cohort?: string
  userType?: UserType
  page?: number
  limit?: number
}

export interface DirectoryUser extends UserSummary {
  bio?: string
  major?: string
  currentCompany?: string
  currentPosition?: string
}
