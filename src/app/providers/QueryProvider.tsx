import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type FC, type PropsWithChildren } from 'react'

/**
 * TanStack Query Provider setup.
 * Configures default caching and fetching policies.
 */
export const QueryProvider: FC<PropsWithChildren> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
