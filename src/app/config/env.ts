/**
 * Application environment configuration.
 * Validates and exposes environment variables with type safety.
 * Supports both API Gateway (port 5000) and direct microservice endpoints (Cloud Render & Localhost).
 */

const defaultApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

export const env = {
  // Central API Gateway entrypoint (Reverse Proxy routing to all services)
  apiBaseUrl: defaultApiBaseUrl,

  // Deployed / Local Microservices base URLs (default to central gateway if not individually overridden)
  adminServiceBaseUrl:
    import.meta.env.VITE_ADMIN_SERVICE_URL ||
    import.meta.env.VITE_ADMIN_SERVICE_BASE_URL ||
    defaultApiBaseUrl,

  userServiceBaseUrl:
    import.meta.env.VITE_USER_SERVICE_URL ||
    import.meta.env.VITE_USER_SERVICE_BASE_URL ||
    defaultApiBaseUrl,

  forumServiceBaseUrl:
    import.meta.env.VITE_FORUM_SERVICE_URL ||
    import.meta.env.VITE_FORUM_SERVICE_BASE_URL ||
    defaultApiBaseUrl,

  chatServiceBaseUrl:
    import.meta.env.VITE_CHAT_SERVICE_URL ||
    import.meta.env.VITE_CHAT_SERVICE_BASE_URL ||
    defaultApiBaseUrl,

  aiServiceBaseUrl:
    import.meta.env.VITE_AI_SERVICE_URL ||
    import.meta.env.VITE_AI_SERVICE_BASE_URL ||
    defaultApiBaseUrl,

  // Real-time WebSockets SignalR Hubs
  chatHubUrl: import.meta.env.VITE_CHAT_HUB_URL || 'http://localhost:5000/hubs/chat',
  forumHubUrl: import.meta.env.VITE_FORUM_HUB_URL || 'http://localhost:5000/hubs/forum',

  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const
