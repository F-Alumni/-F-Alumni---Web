/**
 * Application environment configuration.
 * Validates and exposes environment variables with type safety.
 * Supports both API Gateway (port 5000) and direct microservice endpoints (Cloud Render & Localhost).
 */

export const env = {
  // Central API Gateway entrypoint (Reverse Proxy routing to all services)
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',

  // Deployed / Local Microservices base URLs
  adminServiceBaseUrl:
    import.meta.env.VITE_ADMIN_SERVICE_URL ||
    import.meta.env.VITE_ADMIN_SERVICE_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',

  userServiceBaseUrl:
    import.meta.env.VITE_USER_SERVICE_URL ||
    import.meta.env.VITE_USER_SERVICE_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',

  forumServiceBaseUrl:
    import.meta.env.VITE_FORUM_SERVICE_URL ||
    import.meta.env.VITE_FORUM_SERVICE_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',

  chatServiceBaseUrl:
    import.meta.env.VITE_CHAT_SERVICE_URL ||
    import.meta.env.VITE_CHAT_SERVICE_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',

  aiServiceBaseUrl:
    import.meta.env.VITE_AI_SERVICE_URL ||
    import.meta.env.VITE_AI_SERVICE_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',

  // Real-time WebSockets SignalR Hubs
  chatHubUrl: import.meta.env.VITE_CHAT_HUB_URL || 'http://localhost:5000/hubs/chat',
  forumHubUrl: import.meta.env.VITE_FORUM_HUB_URL || 'http://localhost:5000/hubs/forum',

  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const
