import { userApiClient } from '@/services/api/apiClient'
import { normalizeError } from '@/lib/errorHandler'

/**
 * Frontend Image & Media Security Policy Constants
 */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB strictly enforced
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const
export const BLOCKED_EXTENSIONS = [
  '.svg',
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.php',
  '.js',
  '.ts',
  '.html',
  '.htm',
  '.dll',
  '.jar',
  '.vbs',
] as const

export interface UploadMediaResult {
  secureUrl: string
  publicId?: string
  format?: string
  bytes?: number
}

export interface FileValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Concurrency guard to prevent duplicate rapid submissions.
 */
let isUploadInProgress = false

/**
 * Inspects magic bytes (file signature) to prevent disguised executable / script files.
 */
export async function verifyImageMagicBytes(file: File): Promise<boolean> {
  try {
    const buffer = await file.slice(0, 12).arrayBuffer()
    const bytes = new Uint8Array(buffer)

    // JPEG: FF D8 FF
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    const isPng =
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47

    // WEBP: RIFF .... WEBP (bytes 0..3 === 'RIFF', bytes 8..11 === 'WEBP')
    const isWebp =
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50

    return isJpeg || isPng || isWebp
  } catch {
    return false
  }
}

/**
 * Validates file constraints (size <= 5MB, allowed formats, extension, MIME, rejects SVG).
 */
export function validateImageFile(file: File): FileValidationResult {
  if (!file) {
    return { isValid: false, error: 'Vui lòng chọn tệp tin hình ảnh.' }
  }

  // 1. File size check (5 MB limit)
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
    return {
      isValid: false,
      error: `Dung lượng tệp (${sizeMb} MB) vượt quá giới hạn cho phép tối đa 5 MB.`,
    }
  }

  if (file.size === 0) {
    return { isValid: false, error: 'Tệp tin rỗng (0 bytes). Vui lòng chọn tệp hợp lệ.' }
  }

  // 2. Extension validation
  const ext = ('.' + file.name.split('.').pop()?.toLowerCase()) as string
  if (BLOCKED_EXTENSIONS.includes(ext as any)) {
    return {
      isValid: false,
      error: 'Định dạng tệp không an toàn hoặc chứa mã thực thi (SVG/EXE/Script bị cấm hoàn toàn).',
    }
  }

  if (!ALLOWED_EXTENSIONS.includes(ext as any)) {
    return {
      isValid: false,
      error: 'Chỉ chấp nhận các định dạng ảnh: JPEG, JPG, PNG, WEBP.',
    }
  }

  // 3. MIME type validation
  if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: 'MIME type của tệp không hợp lệ. Chỉ chấp nhận ảnh JPEG, PNG hoặc WEBP.',
    }
  }

  return { isValid: true }
}

/**
 * Sanitizes and validates that an image URL is from a safe, trusted HTTPS source.
 * Prevents XSS via javascript: or data:text/html URIs.
 */
export function isTrustedImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false

  const trimmed = url.trim()
  if (!trimmed) return false

  // Reject dangerous pseudo-protocols
  const lower = trimmed.toLowerCase()
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:text/') ||
    lower.startsWith('data:application/')
  ) {
    return false
  }

  // Safe local previews
  if (lower.startsWith('blob:')) return true

  // Safe relative paths (e.g. assets)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true

  // Safe absolute URLs
  try {
    const parsed = new URL(trimmed)
    // Enforce HTTPS in production; allow localhost HTTP in development
    if (parsed.protocol === 'https:') return true
    if (parsed.protocol === 'http:' && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
      return true
    }
    return false
  } catch {
    return false
  }
}

/**
 * Safely generates an object URL for preview and tracks it for revocation.
 */
export function createSafePreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Revokes a temporary preview object URL to prevent memory leaks.
 */
export function revokeSafePreviewUrl(previewUrl: string): void {
  if (previewUrl && previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl)
  }
}

/**
 * Secure Backend-Mediated Upload:
 * Frontend -> Backend Upload API (multipart/form-data + JWT) -> Cloudinary (Server-side Secret) -> Frontend.
 *
 * Frontend NEVER holds or transmits the Cloudinary API Secret.
 */
export async function uploadImageViaBackend(
  file: File,
  endpoint: string = '/users/media/upload'
): Promise<UploadMediaResult> {
  // 1. Prevent duplicate simultaneous submissions
  if (isUploadInProgress) {
    throw new Error('Đang có một tệp khác được xử lý tải lên. Vui lòng chờ trong giây lát.')
  }

  // 2. Client-side static validation
  const validation = validateImageFile(file)
  if (!validation.isValid) {
    throw new Error(validation.error || 'Tệp tin không hợp lệ.')
  }

  // 3. Magic bytes signature inspection
  const hasValidMagicBytes = await verifyImageMagicBytes(file)
  if (!hasValidMagicBytes) {
    throw new Error('Chữ ký tệp (File signature) không khớp với ảnh hợp lệ. Tệp có thể đã bị đổi đuôi hoặc hỏng.')
  }

  isUploadInProgress = true

  try {
    const formData = new FormData()
    formData.append('file', file)

    // Send through authenticated userApiClient (JWT Bearer attached automatically)
    const response = await userApiClient.post<any>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    const payload = response.data?.data || response.data
    const secureUrl = payload.secureUrl || payload.avatarUrl || payload.url

    // 4. Validate returned URL from backend
    if (!isTrustedImageUrl(secureUrl)) {
      throw new Error('Đường dẫn ảnh trả về từ máy chủ không đáp ứng tiêu chuẩn an toàn HTTPS.')
    }

    return {
      secureUrl,
      publicId: payload.publicId,
      format: payload.format,
      bytes: payload.bytes || file.size,
    }
  } catch (err: any) {
    // Standardized sanitized error reporting according to HTTP status code
    const status = err.response?.status
    if (status === 400) {
      throw new Error('Yêu cầu không hợp lệ. Vui lòng kiểm tra lại định dạng tệp ảnh.')
    } else if (status === 401) {
      throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.')
    } else if (status === 403) {
      throw new Error('Bạn không có quyền thực hiện tải lên tệp tin.')
    } else if (status === 413) {
      throw new Error('Dung lượng tệp vượt quá giới hạn 5 MB của hệ thống.')
    } else if (status >= 500) {
      throw new Error('Hệ thống máy chủ lưu trữ đang bận hoặc gián đoạn. Vui lòng thử lại sau.')
    }

    const normalized = normalizeError(err)
    throw new Error(normalized.message || 'Không thể tải lên hình ảnh.')
  } finally {
    isUploadInProgress = false
  }
}

/**
 * Backward compatibility alias: uploadToCloudinary now delegates directly
 * to the secure backend-mediated upload mechanism.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const result = await uploadImageViaBackend(file)
  return result.secureUrl
}
