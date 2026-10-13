/**
 * Base API response interfaces.
 */

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

export interface ApiErrorResponse {
  message: string
  code?: string
  errors?: Record<string, string[]>
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
  success?: boolean
}

