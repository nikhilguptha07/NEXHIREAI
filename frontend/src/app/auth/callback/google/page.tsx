'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { tokenStore } from '@/api/client';
import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      const err = searchParams.get('error') || searchParams.get('error_description');
      const message = searchParams.get('message');

      if (err) {
        setError(message || err || 'Google sign in was canceled or failed.');
        setProcessing(false);
        toast.error('Google Sign-In failed. Please try again.');
        return;
      }

      const token = searchParams.get('token') || searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken') || searchParams.get('refresh_token');

      if (!token) {
        setError('No authentication token received from authentication server.');
        setProcessing(false);
        return;
      }

      try {
        tokenStore.set(token, refreshToken || token);
        await refreshUser();
        toast.success('Successfully signed in with Google!');
        router.push('/dashboard');
      } catch (err: any) {
        setError(err?.message || 'Failed to initialize authenticated session.');
        setProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, router, refreshUser]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background selection:bg-primary/30">
      <Card className="w-full max-w-md border-white/10 shadow-2xl glass backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
            {error ? (
              <>
                <AlertCircle className="h-5 w-5 text-red-400" />
                Sign In Failed
              </>
            ) : processing ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Completing Google Sign In…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Authenticated
              </>
            )}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {error ? 'There was a problem authenticating with your Google Account.' : 'Validating authentication credentials…'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {error ? (
            <div className="space-y-4">
              <div className="p-3 text-xs font-medium text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg">
                {error}
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">Back to Sign In</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-xs text-muted-foreground">Redirecting to your dashboard…</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
