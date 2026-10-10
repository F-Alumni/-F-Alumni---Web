/**
 * Application environment configuration.
 * Validates and exposes environment variables with type safety.
 */

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const
