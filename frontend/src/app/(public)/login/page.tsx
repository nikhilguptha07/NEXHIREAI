'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { BrandMark } from '@/components/layout/brand-mark';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { http, tokenStore, type ApiError } from '@/api/client';
import type { LoginResponse } from '@/types/api';

import { useAuth } from '@/components/providers/auth-provider';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const err = searchParams.get('error');
    const msg = searchParams.get('message');
    if (err) {
      setErrorMsg(msg || 'Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await http.post<LoginResponse>('/auth/login', {
        email,
        password,
        rememberMe,
      });

      tokenStore.set(res.tokens.accessToken, res.tokens.refreshToken);
      await refreshUser();
      toast.success(`Welcome back, ${res.user.firstName || 'User'}!`);
      router.push('/dashboard');
    } catch (err) {
      const apiErr = err as ApiError;
      const message = apiErr.message || 'Failed to sign in. Please check your credentials.';
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const isLocal = typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'));
    const backendBase =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      (!isLocal ? 'https://nexhireai-1.onrender.com/api' : 'http://localhost:8080/api');
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (googleClientId && !googleClientId.includes('placeholder')) {
      window.location.href = `${backendBase}/oauth2/authorization/google`;
    } else {
      window.location.href = `${backendBase}/auth/oauth/google/dev?email=nikhilguptha07@gmail.com&name=Nikhil%20Guptha&redirect_uri=${encodeURIComponent(origin)}`;
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 bg-background selection:bg-primary/30">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <Link href="/" className="mb-8 hover:scale-105 transition-transform">
        <BrandMark size={44} />
      </Link>

      <Card className="w-full max-w-md glass border-white/10 shadow-2xl backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sign in to your NEXHIRE AI workspace
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {errorMsg && (
            <div className="p-3 text-xs font-medium text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg">
              <div>{errorMsg}</div>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-5 border-white/10 hover:bg-white/5 font-medium transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="pl-9 bg-black/40 border-white/10 focus:border-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-9 pr-9 bg-black/40 border-white/10 focus:border-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black/40 text-primary focus:ring-primary"
              />
              <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
                Remember this device for 30 days
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full primary-button font-medium flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground pt-2">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  );
}
