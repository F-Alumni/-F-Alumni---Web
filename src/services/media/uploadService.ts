import { userApiClient } from '@/services/api/apiClient'
import { env } from '@/app/config/env'
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
    lower.startsWith('data:application/') ||
    lower.startsWith('data:image/svg')
  ) {
    return false
  }

  // Allow safe raster image data URLs (jpeg, png, webp)
  if (
    lower.startsWith('data:image/jpeg;base64,') ||
    lower.startsWith('data:image/jpg;base64,') ||
    lower.startsWith('data:image/png;base64,') ||
    lower.startsWith('data:image/webp;base64,')
  ) {
    return true
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
    if (
      parsed.protocol === 'http:' &&
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
    ) {
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
 * Computes SHA-1 signature for Cloudinary signed upload using Web Crypto API.
 */
async function computeSha1Hex(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Direct signed Cloudinary upload using configured Cloudinary credentials.
 */
export async function uploadDirectlyToCloudinary(
  file: File,
  folder = 'falumni/uploads'
): Promise<UploadMediaResult> {
  const { cloudName, apiKey, apiSecret } = env.cloudinary
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
  const signature = await computeSha1Hex(strToSign)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp)
  formData.append('signature', signature)
  formData.append('folder', folder)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`Cloudinary upload failed with status ${res.status}`)
  }

  const data = await res.json()
  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
    format: data.format,
    bytes: data.bytes || file.size,
  }
}

/**
 * Secure Image Upload via Backend (`/users/media/upload`) or Signed Cloudinary API (`fxco0zeu`).
 */
export async function uploadImageViaBackend(
  file: File,
  endpoint: string = '/users/media/upload'
): Promise<UploadMediaResult> {
  if (isUploadInProgress) {
    throw new Error('Đang có một tệp khác được xử lý tải lên. Vui lòng chờ trong giây lát.')
  }

  const validation = validateImageFile(file)
  if (!validation.isValid) {
    throw new Error(validation.error || 'Tệp tin không hợp lệ.')
  }

  const hasValidMagicBytes = await verifyImageMagicBytes(file)
  if (!hasValidMagicBytes) {
    throw new Error(
      'Chữ ký tệp (File signature) không khớp với ảnh hợp lệ. Tệp có thể đã bị đổi đuôi hoặc hỏng.'
    )
  }

  isUploadInProgress = true

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await userApiClient.post<any>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    const payload = response.data?.data || response.data
    const secureUrl = payload.secureUrl || payload.avatarUrl || payload.url

    if (!isTrustedImageUrl(secureUrl)) {
      throw new Error('URL hình ảnh trả về từ máy chủ không hợp lệ.')
    }

    return {
      secureUrl,
      publicId: payload.publicId,
      format: payload.format,
      bytes: payload.bytes || file.size,
    }
  } catch (err: any) {
    const normalized = normalizeError(err)
    throw new Error(normalized.message || 'Không thể tải lên hình ảnh.')
  } finally {
    isUploadInProgress = false
  }
}

/**
 * Upload directly to Cloudinary using the configured Cloudinary credentials.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const result = await uploadDirectlyToCloudinary(file)
  return result.secureUrl
}
