'use client';

import type { ReactNode } from 'react';

import { AuthProvider } from './auth-provider';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';

/**
 * NEXHIRE AI — Single composition of client-side providers.
 * Mounted once in `app/layout.tsx`.
 *
 * Order:
 *   ThemeProvider → QueryProvider → AuthProvider
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
