import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import { env } from '@/app/config/env'
import { normalizeError } from '@/lib/errorHandler'

/**
 * Checks whether an endpoint is public and should NOT carry an Authorization Bearer header.
 */
const isPublicEndpoint = (url?: string): boolean => {
  if (!url) return false
  const publicPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/auth/resend-verification',
    '/auth/google',
    '/auth/refresh-token',
  ]
  return publicPaths.some((p) => url.includes(p))
}

const attachAuthInterceptor = (instance: AxiosInstance) => {
  // Request Interceptor: Attach JWT Bearer Token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (!isPublicEndpoint(config.url)) {
        const token =
          localStorage.getItem('access_token') ||
          localStorage.getItem('accessToken')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    },
    (error: unknown) => Promise.reject(normalizeError(error))
  )

  // Response Interceptor: Auto Refresh Token on 401
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !isPublicEndpoint(originalRequest.url)
      ) {
        originalRequest._retry = true
        try {
          const refreshToken =
            localStorage.getItem('refresh_token') ||
            localStorage.getItem('refreshToken')

          if (!refreshToken) {
            throw new Error('Phiên đăng nhập đã hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.')
          }

          // Request new access token from Auth/User service
          const refreshRes = await axios.post(
            `${env.userServiceBaseUrl || env.apiBaseUrl}/auth/refresh-token`,
            { refreshToken }
          )

          const data = refreshRes.data?.data || refreshRes.data
          const newAccessToken = data?.accessToken || data?.token
          const newRefreshToken = data?.refreshToken

          if (newAccessToken) {
            localStorage.setItem('access_token', newAccessToken)
            localStorage.setItem('accessToken', newAccessToken)
            if (newRefreshToken) {
              localStorage.setItem('refresh_token', newRefreshToken)
              localStorage.setItem('refreshToken', newRefreshToken)
            }

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return instance(originalRequest)
          }
        } catch (refreshErr) {
          // Token renewal failed - clean up credentials
          localStorage.removeItem('access_token')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('refreshToken')
          return Promise.reject(normalizeError(refreshErr))
        }
      }
      return Promise.reject(normalizeError(error))
    }
  )
}

/**
 * 1. Central API Gateway client (port 5000).
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
attachAuthInterceptor(apiClient)

/**
 * 2. Dedicated Admin Service client (port 5005).
 */
export const adminApiClient: AxiosInstance = axios.create({
  baseURL: env.adminServiceBaseUrl || env.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
attachAuthInterceptor(adminApiClient)

/**
 * 3. Dedicated User Service client (port 5001).
 */
export const userApiClient: AxiosInstance = axios.create({
  baseURL: env.userServiceBaseUrl || env.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
attachAuthInterceptor(userApiClient)

/**
 * 4. Dedicated Forum Service client (port 5003).
 */
export const forumApiClient: AxiosInstance = axios.create({
  baseURL: env.forumServiceBaseUrl || env.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
attachAuthInterceptor(forumApiClient)

/**
 * 5. Dedicated Chat Service client (port 5002).
 */
export const chatApiClient: AxiosInstance = axios.create({
  baseURL: env.chatServiceBaseUrl || env.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
attachAuthInterceptor(chatApiClient)

/**
 * 6. Dedicated AI Service client (port 5004).
 */
export const aiApiClient: AxiosInstance = axios.create({
  baseURL: env.aiServiceBaseUrl || env.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
attachAuthInterceptor(aiApiClient)
