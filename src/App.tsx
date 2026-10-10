import type { FC } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AppProviders } from '@/app/providers'
import { router } from '@/app/router'

/**
 * Root Application Component.
 * Composes global providers and the central router.
 */
export const App: FC = () => {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}

export default App
