import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthState {
  token: string | null
  isAuthenticated: boolean
  setToken: (token: string | null) => void
  clearAuth: () => void
}

/**
 * Client-side authentication state store with localStorage persistence.
 * Tracks session token and authentication status.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      setToken: (token) => set({ token, isAuthenticated: Boolean(token) }),
      clearAuth: () => set({ token: null, isAuthenticated: false }),
    }),
    {
      name: 'alumni-auth-storage',
    }
  )
)
