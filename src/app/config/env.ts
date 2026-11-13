/**
 * Application environment configuration.
 * Validates and exposes environment variables with type safety.
 * Supports both API Gateway (port 5000) and direct microservice endpoints (Localhost 5001-5005 & Cloud Render).
 */

const defaultGatewayUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

export const env = {
  // Central API Gateway entrypoint (Reverse Proxy routing to all services)
  apiBaseUrl: defaultGatewayUrl,

  // Deployed / Local Microservices base URLs (default to direct microservice ports in dev)
  userServiceBaseUrl:
    import.meta.env.VITE_USER_SERVICE_URL ||
    import.meta.env.VITE_USER_SERVICE_BASE_URL ||
    'http://localhost:5001/api/v1',

  chatServiceBaseUrl:
    import.meta.env.VITE_CHAT_SERVICE_URL ||
    import.meta.env.VITE_CHAT_SERVICE_BASE_URL ||
    'http://localhost:5002/api/v1',

  forumServiceBaseUrl:
    import.meta.env.VITE_FORUM_SERVICE_URL ||
    import.meta.env.VITE_FORUM_SERVICE_BASE_URL ||
    'http://localhost:5003/api/v1',

  aiServiceBaseUrl:
    import.meta.env.VITE_AI_SERVICE_URL ||
    import.meta.env.VITE_AI_SERVICE_BASE_URL ||
    'http://localhost:5004/api/v1',

  adminServiceBaseUrl:
    import.meta.env.VITE_ADMIN_SERVICE_URL ||
    import.meta.env.VITE_ADMIN_SERVICE_BASE_URL ||
    'http://localhost:5005/api/v1',

  notificationServiceBaseUrl:
    import.meta.env.VITE_NOTIFICATION_SERVICE_URL ||
    import.meta.env.VITE_NOTIFICATION_SERVICE_BASE_URL ||
    import.meta.env.VITE_FORUM_SERVICE_URL ||
    'http://localhost:5003/api/v1',

  // Real-time WebSockets SignalR Hubs
  chatHubUrl: import.meta.env.VITE_CHAT_HUB_URL || 'http://localhost:5002/hubs/chat',
  forumHubUrl: import.meta.env.VITE_FORUM_HUB_URL || 'http://localhost:5003/hubs/forum',
  notificationHubUrl:
    import.meta.env.VITE_NOTIFICATION_HUB_URL ||
    import.meta.env.VITE_FORUM_HUB_URL ||
    'http://localhost:5003/hubs/forum',

  // Cloudinary configuration
  cloudinary: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'fxco0zeu',
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '954633752654961',
    apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET || 'kM__nc9y6TuAgEnRkUv50pClHdI',
  },

  // Firebase configuration (Project: alumniconnect-295ed)
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'alumniconnect-295ed.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'alumniconnect-295ed',
    storageBucket:
      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'alumniconnect-295ed.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '260545453641',
    appId:
      import.meta.env.VITE_FIREBASE_APP_ID || '1:260545453641:web:553a568245b20ff08c2998',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-3XH6K9E2HW',
  },

  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const
