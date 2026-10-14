/**
 * Application environment configuration.
 * Validates and exposes environment variables with type safety.
 */

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5164',
  userServiceBaseUrl: import.meta.env.VITE_USER_SERVICE_BASE_URL || 'http://localhost:5164',
  chatServiceBaseUrl: import.meta.env.VITE_CHAT_SERVICE_BASE_URL || 'http://localhost:5199',
  chatHubUrl: import.meta.env.VITE_CHAT_HUB_URL || 'http://localhost:5199/hubs/chat',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const
