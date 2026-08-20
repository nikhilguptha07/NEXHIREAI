'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Route Error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="glass border-red-500/30 p-6 max-w-md w-full text-center space-y-4">
        <div className="p-3 rounded-full bg-red-500/10 text-red-400 w-fit mx-auto">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <CardHeader className="p-0">
          <CardTitle className="text-xl font-bold text-foreground">Something went wrong</CardTitle>
          <CardDescription className="text-xs text-muted-foreground pt-1">
            An unexpected error occurred while loading this dashboard view.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-4 pt-2">
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-red-300 truncate">
            {error.message || 'Unknown Dashboard Error'}
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={reset} size="sm" className="primary-button text-xs gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </Button>
            <Button variant="outline" size="sm" className="glass text-xs gap-1.5" asChild>
              <Link href="/dashboard">
                <Home className="h-3.5 w-3.5" />
                <span>Dashboard Home</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
