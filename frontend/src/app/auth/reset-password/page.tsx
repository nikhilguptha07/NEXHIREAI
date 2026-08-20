'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldAlert,
  X,
} from 'lucide-react';

import { BrandMark } from '@/components/layout/brand-mark';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Evaluate Password Requirements
  const passwordCriteria = useMemo(() => {
    return {
      minLength: newPassword.length >= 8,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /\d/.test(newPassword),
      hasSpecial: /[@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>/?]/.test(newPassword),
    };
  }, [newPassword]);

  const score = useMemo(() => {
    return Object.values(passwordCriteria).filter(Boolean).length;
  }, [passwordCriteria]);

  const isPasswordValid = score === 5;

  const strengthColor = useMemo(() => {
    if (score <= 1) return 'bg-red-500 text-red-400';
    if (score <= 3) return 'bg-amber-500 text-amber-400';
    if (score <= 4) return 'bg-blue-500 text-blue-400';
    return 'bg-emerald-500 text-emerald-400';
  }, [score]);

  const strengthLabel = useMemo(() => {
    if (score <= 1) return 'Weak';
    if (score <= 3) return 'Medium';
    if (score <= 4) return 'Good';
    return 'Strong';
  }, [score]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing or invalid password reset token in URL.');
      return;
    }

    if (!isPasswordValid) {
      setError('Please fulfill all password strength requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || 'Failed to reset password. Token may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 text-center space-y-6">
        <div className="h-16 w-16 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-100">Invalid Reset Link</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            No valid password reset token was detected in the URL request. Please request a new password reset email.
          </p>
        </div>
        <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-500 text-xs py-2.5 rounded-xl">
          <Link href="/forgot-password">Request Reset Link</Link>
        </Button>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
        <div className="h-16 w-16 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Password Updated!</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your password has been reset successfully. Old reset tokens have been invalidated.
          </p>
        </div>
        <Button asChild className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs py-3 rounded-xl gap-2 shadow-lg shadow-indigo-950/50">
          <Link href="/login">
            <span>Sign In with New Password</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-indigo-950/40 rounded-2xl overflow-hidden">
      <CardHeader className="text-center space-y-2 pb-4 pt-8">
        <CardTitle className="text-2xl font-bold tracking-tight text-white">
          Create New Password
        </CardTitle>
        <CardDescription className="text-sm text-slate-400 leading-relaxed">
          Set a secure new password for your NEXHIRE AI account.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-8 space-y-6">
        {error && (
          <div className="flex items-start gap-3 p-3.5 text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password Input */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-xs font-medium text-slate-300">
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                className="pl-10 pr-10 bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl py-2.5"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {newPassword.length > 0 && (
            <div className="space-y-3 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Password Strength</span>
                <span className={`font-semibold ${strengthColor.split(' ')[1]}`}>
                  {strengthLabel} ({score}/5)
                </span>
              </div>

              {/* Strength Meter Bar */}
              <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`h-full rounded-full transition-all duration-300 ${
                      step <= score ? strengthColor.split(' ')[0] : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              {/* Requirement Checkmarks */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  {passwordCriteria.minLength ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                  )}
                  <span className={passwordCriteria.minLength ? 'text-slate-200' : 'text-slate-500'}>
                    8+ characters
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {passwordCriteria.hasUpper ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                  )}
                  <span className={passwordCriteria.hasUpper ? 'text-slate-200' : 'text-slate-500'}>
                    Uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {passwordCriteria.hasLower ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                  )}
                  <span className={passwordCriteria.hasLower ? 'text-slate-200' : 'text-slate-500'}>
                    Lowercase letter
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {passwordCriteria.hasNumber ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                  )}
                  <span className={passwordCriteria.hasNumber ? 'text-slate-200' : 'text-slate-500'}>
                    Number (0-9)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  {passwordCriteria.hasSpecial ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                  )}
                  <span className={passwordCriteria.hasSpecial ? 'text-slate-200' : 'text-slate-500'}>
                    Special character (!@#$%^&*)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-xs font-medium text-slate-300">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="pl-10 pr-10 bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl py-2.5"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-[11px] text-red-400 pt-0.5">Passwords do not match</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !isPasswordValid || newPassword !== confirmPassword}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-xl shadow-lg shadow-indigo-950/50 transition-all duration-200 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Reset Password</span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 py-12 overflow-hidden text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-purple-600/20 via-indigo-600/20 to-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Header Logo */}
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <Link href="/" className="transition-transform hover:scale-105 duration-200">
          <BrandMark size={48} />
        </Link>
        <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400/90 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800/40">
          Security & Identity
        </span>
      </div>

      <Suspense
        fallback={
          <Card className="w-full max-w-md bg-slate-900/80 p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mx-auto" />
          </Card>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
