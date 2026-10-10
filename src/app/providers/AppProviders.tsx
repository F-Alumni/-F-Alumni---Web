import type { FC, PropsWithChildren } from 'react'
import { QueryProvider } from './QueryProvider'

/**
 * Root application provider composition.
 * Combines TanStack Query, potential theme, and global contexts.
 */
export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
  return <QueryProvider>{children}</QueryProvider>
}
