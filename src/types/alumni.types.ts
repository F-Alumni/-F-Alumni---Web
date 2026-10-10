import type { UserId, UserSummary } from './user.types'

export type AlumniVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED'

export interface AlumniProfile {
  userId: UserId
  user?: UserSummary
  graduationYear: number
  major: string
  currentCompany?: string
  currentPosition?: string
  industry?: string
  verificationStatus: AlumniVerificationStatus
  linkedinUrl?: string
}
