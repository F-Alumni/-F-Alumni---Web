import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { UserSummary } from '@/types/user.types'
import type { Role } from '@/constants/roles'
import type { UserType } from '@/constants/userTypes'
import { getPermissionsForUser } from '@/lib/permissions'
import { DEMO_USERS } from '@/constants/demoUsers'

export interface AuthState {
  token: string | null
  currentUser: UserSummary | null
  role: Role | null
  userType: UserType | null
  isAuthenticated: boolean
  permissions: string[]

  // Actions
  setAuth: (payload: { token: string; user: UserSummary }) => void
  setToken: (token: string | null) => void
  setUser: (user: UserSummary | null) => void
  switchUser: (user: UserSummary) => void
  updateCurrentUser: (partialUser: Partial<UserSummary>) => void
  clearAuth: () => void
}

/**
 * Client-side authentication and role state store with localStorage persistence.
 * Tracks session token, current active persona, system role, and granted permissions.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      currentUser: null,
      role: null,
      userType: null,
      isAuthenticated: false,
      permissions: [],

      setAuth: ({ token, user }) => {
        const computedPermissions = getPermissionsForUser(user)
        try {
          localStorage.setItem('access_token', token)
        } catch {
          // Ignore localStorage errors in non-browser envs
        }
        set({
          token,
          currentUser: user,
          role: user.role,
          userType: user.userType,
          isAuthenticated: true,
          permissions: computedPermissions,
        })
      },

      setToken: (token) => {
        if (!token) {
          get().clearAuth()
          return
        }

        const existingUser = get().currentUser
        const userToSet = existingUser || DEMO_USERS.ADMIN
        get().setAuth({ token, user: userToSet })
      },

      setUser: (user) => {
        if (!user) {
          get().clearAuth()
          return
        }
        const existingToken = get().token || `fpt-demo-session-${Date.now()}`
        get().setAuth({ token: existingToken, user })
      },

      switchUser: (user) => {
        const token = `fpt-session-${user.role.toLowerCase()}-${user.userType.toLowerCase()}-${Date.now()}`
        get().setAuth({ token, user })
      },

      updateCurrentUser: (partialUser) => {
        const existing = get().currentUser
        if (!existing) return
        const updated: UserSummary = { ...existing, ...partialUser }
        set({
          currentUser: updated,
          role: updated.role,
          userType: updated.userType,
          permissions: getPermissionsForUser(updated),
        })
      },

      clearAuth: () => {
        try {
          localStorage.removeItem('access_token')
        } catch {
          // Ignore
        }
        set({
          token: null,
          currentUser: null,
          role: null,
          userType: null,
          isAuthenticated: false,
          permissions: [],
        })
      },
    }),
    {
      name: 'alumni-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
