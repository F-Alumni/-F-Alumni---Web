/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_ADMIN_SERVICE_URL?: string
  readonly VITE_ADMIN_SERVICE_BASE_URL?: string
  readonly VITE_USER_SERVICE_URL?: string
  readonly VITE_USER_SERVICE_BASE_URL?: string
  readonly VITE_FORUM_SERVICE_URL?: string
  readonly VITE_FORUM_SERVICE_BASE_URL?: string
  readonly VITE_CHAT_SERVICE_URL?: string
  readonly VITE_CHAT_SERVICE_BASE_URL?: string
  readonly VITE_AI_SERVICE_URL?: string
  readonly VITE_AI_SERVICE_BASE_URL?: string
  readonly VITE_CHAT_HUB_URL?: string
  readonly VITE_FORUM_HUB_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
