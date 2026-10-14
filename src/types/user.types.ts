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

export interface BackendUserSummary {
  id: string
  fullName: string
  avatarUrl: string | null
  campus: string | null
  major: string | null
  batch: string | null
  role: string
}

export interface BackendPrivacySetting {
  showEmail: boolean
  showCampus: boolean
  showMajor: boolean
  showBatch: boolean
  showBio: boolean
  showGoogleCalendar: boolean
}

export interface BackendMyProfileResponse {
  id: string
  email: string
  fullName: string
  avatarUrl: string | null
  campus: string | null
  major: string | null
  batch: string | null
  bio: string | null
  googleCalendarUrl: string | null
  role: string
  isEmailVerified: boolean
  createdAt: string
  privacySetting: BackendPrivacySetting
}

export interface BackendPublicProfileResponse {
  id: string
  fullName: string
  avatarUrl: string | null
  campus: string | null
  major: string | null
  batch: string | null
  bio: string | null
  googleCalendarUrl: string | null
  role: string
  email: string | null
}

export interface UpdateProfilePayload {
  fullName: string
  avatarUrl?: string | null
  campus?: string | null
  major?: string | null
  batch?: string | null
  bio?: string | null
  googleCalendarUrl?: string | null
}

export interface BackendBlockedUser {
  blockedUserId: string
  fullName: string
  avatarUrl: string | null
  blockedAt: string
}

export interface BackendPagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
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
  googleCalendarUrl?: string
  createdAt: string
  updatedAt?: string
  privacySetting?: BackendPrivacySetting
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
  pageSize?: number
  search?: string
  keyword?: string
  role?: Role | 'ALL' | string
  campus?: CampusCode | string | 'ALL'
  status?: UserStatus | 'ALL' | string
  userType?: UserType | 'ALL' | string
  major?: string
}

export interface UpdateUserStatusPayload {
  status: 'ACTIVE' | 'BANNED' | 'SUSPENDED' | 'active' | 'banned'
  reason?: string
}

export interface SearchDirectoryParams {
  query?: string
  keyword?: string
  campus?: CampusCode | string
  department?: string
  major?: string
  cohort?: string
  userType?: UserType
  role?: string
  page?: number
  limit?: number
  pageSize?: number
}

export interface DirectoryUser extends UserSummary {
  bio?: string
  major?: string
  currentCompany?: string
  currentPosition?: string
}
