import axios from 'axios'

export interface AppErrorPayload {
  message: string
  code?: string
  status?: number
  details?: unknown
}

export class AppError extends Error {
  public readonly code?: string
  public readonly status?: number
  public readonly details?: unknown

  constructor({ message, code, status, details }: AppErrorPayload) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
    this.details = details
  }
}

/**
 * Standardizes unknown errors into a consistent AppError structure.
 */
export const normalizeError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; code?: string; title?: string; errors?: Record<string, string[]> }
      | undefined

    let resolvedMessage = data?.message

    // If ProblemDetails contains validation error dictionary, concatenate messages
    if (!resolvedMessage && data?.errors && typeof data.errors === 'object') {
      const fieldErrors = Object.values(data.errors).flat()
      if (fieldErrors.length > 0) {
        resolvedMessage = fieldErrors.join(' ')
      }
    }

    if (!resolvedMessage) {
      resolvedMessage = data?.title ?? error.message ?? 'An unexpected network error occurred.'
    }

    return new AppError({
      message: resolvedMessage,
      status: error.response?.status,
      code: data?.code ?? error.code,
      details: error.response?.data,
    })
  }

  if (error instanceof Error) {
    return new AppError({
      message: error.message,
    })
  }

  return new AppError({
    message: 'An unknown error occurred.',
  })
}
