import type { FC } from 'react'
import { Outlet } from 'react-router-dom'

/**
 * Layout container for authentication workflows.
 * Provides the shell for auth child routes without implementing UI designs.
 */
export const AuthLayout: FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  )
}
