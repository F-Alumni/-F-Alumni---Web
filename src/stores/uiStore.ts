import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface UiState {
  sidebarOpen: boolean
  theme: ThemeMode
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: ThemeMode) => void
}

/**
 * Client-side global UI state store.
 */
export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  theme: 'system',
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}))
