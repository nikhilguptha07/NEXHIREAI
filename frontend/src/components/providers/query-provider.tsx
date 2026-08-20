'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { env } from '@/lib/env';

/**
 * NEXHIRE AI — TanStack Query provider.
 * - Conservative stale/retry defaults tuned for a hiring dashboard.
 * - 401 handling is performed at the HTTP client level (silent refresh).
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: (failureCount, error) => {
              const status = (error as { status?: number }).status;
              // Never retry client errors except 429
              if (typeof status === 'number' && status >= 400 && status < 500) {
                return status === 429 && failureCount < 2;
              }
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
          },
          mutations: { retry: 0 },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {env.appUrl.includes('localhost') ? (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      ) : null}
    </QueryClientProvider>
  );
}
