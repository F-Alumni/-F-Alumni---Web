import { create } from 'zustand'

export interface AuthState {
  token: string | null
  isAuthenticated: boolean
  setToken: (token: string | null) => void
  clearAuth: () => void
}

/**
 * Client-side authentication state store.
 * Note: Server user profile data must be managed via TanStack Query.
 */
export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  setToken: (token) => set({ token, isAuthenticated: Boolean(token) }),
  clearAuth: () => set({ token: null, isAuthenticated: false }),
}))
