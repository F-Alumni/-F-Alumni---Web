import type { Role } from '@/constants/roles'
import type { UserType } from '@/constants/userTypes'

export type UserId = string

export interface UserSummary {
  id: UserId
  name: string
  email: string
  avatarUrl?: string
  role: Role
  userType: UserType
}

export interface UserProfile extends UserSummary {
  bio?: string
  department?: string
  graduationYear?: number
  createdAt: string
  updatedAt: string
}
