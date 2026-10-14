import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/app/config/env'
import { normalizeError } from '@/lib/errorHandler'

/**
 * Checks whether an endpoint is public and should NOT carry an Authorization Bearer header.
 * Crucial to prevent UserService TokenRevocationMiddleware 401 rejections on login/register
 * when a revoked token is still in localStorage.
 */
const isPublicEndpoint = (url?: string): boolean => {
  if (!url) return false
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/verify-email',
    '/api/auth/resend-verification',
    '/api/auth/google-login',
  ]
  return publicPaths.some((p) => url.includes(p))
}

const attachAuthInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (!isPublicEndpoint(config.url)) {
        const token = localStorage.getItem('access_token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    },
    (error: unknown) => Promise.reject(normalizeError(error))
  )

  instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(normalizeError(error))
  )
}

/**
 * Pre-configured Axios instance for UserService (Auth, Profile, Users).
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.userServiceBaseUrl || env.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
attachAuthInterceptor(apiClient)

/**
 * Pre-configured Axios instance for ChatService (Rooms, Messages).
 */
export const chatApiClient: AxiosInstance = axios.create({
  baseURL: env.chatServiceBaseUrl || 'http://localhost:5199',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})
attachAuthInterceptor(chatApiClient)
