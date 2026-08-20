'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

/**
 * NEXHIRE AI — Theme provider (next-themes).
 * Mounted in root layout to enable system / light / dark switching.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="nexhire.theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
