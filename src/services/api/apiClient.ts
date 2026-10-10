import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/app/config/env'
import { normalizeError } from '@/lib/errorHandler'

/**
 * Pre-configured Axios instance for application API services.
 * Base URL is dynamically derived from the environment configuration.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request Interceptor: Attach authentication token if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Structural interceptor ready for auth token attachment
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: unknown) => {
    return Promise.reject(normalizeError(error))
  }
)

// Response Interceptor: Global response handling and error normalization
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: unknown) => {
    const normalized = normalizeError(error)
    return Promise.reject(normalized)
  }
)
