'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Building, Eye, EyeOff, ArrowRight } from 'lucide-react';
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

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim()) {
      toast.error('First name is required');
      return;
    }

    if (!lastName.trim()) {
      toast.error('Last name is required');
      return;
    }

    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!confirmPassword) {
      toast.error('Please confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      toast.error('You must accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      const res = await http.post<LoginResponse>('/auth/register', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        companyName: companyName.trim() || null,
        acceptTerms,
      });

      tokenStore.set(res.tokens.accessToken, res.tokens.refreshToken);
      await refreshUser();
      toast.success(`Account created! Welcome, ${res.user.firstName}!`);
      router.push('/dashboard');
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(apiErr.message || 'Registration failed');
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
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 bg-background selection:bg-primary/30">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <Link href="/" className="mb-8 hover:scale-105 transition-transform">
        <BrandMark size={44} />
      </Link>

      <Card className="w-full max-w-md glass border-white/10 shadow-2xl backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Start your NEXHIRE AI workspace in under a minute
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
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
              <span className="bg-background px-2 text-muted-foreground">Or register with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Alex"
                    className="pl-9 bg-black/40 border-white/10 focus:border-primary"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Morgan"
                  className="bg-black/40 border-white/10 focus:border-primary"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="alex@company.com"
                  className="pl-9 bg-black/40 border-white/10 focus:border-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Company Name <span className="text-muted-foreground font-normal">(Optional for Recruiters)</span>
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Acme Corp"
                  className="pl-9 bg-black/40 border-white/10 focus:border-primary"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  className="pl-9 pr-9 bg-black/40 border-white/10 focus:border-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="pl-9 bg-black/40 border-white/10 focus:border-primary"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-black/40 text-primary focus:ring-primary"
                required
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer select-none">
                I agree to the Terms of Service & Privacy Policy
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
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground pt-2">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
