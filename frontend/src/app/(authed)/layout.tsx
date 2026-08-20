'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { tokenStore } from '@/api/client';

export default function AuthedRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const hasToken = !!tokenStore.access;
    if (!loading && !isAuthenticated && !hasToken) {
      const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : '/login';
      router.replace(redirectUrl);
    }
  }, [loading, isAuthenticated, router, pathname]);

  if (loading && !user && !tokenStore.access) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background selection:bg-primary/30">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Authenticating workspace session…
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
