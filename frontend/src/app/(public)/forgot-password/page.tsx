'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, Mail, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

import { BrandMark } from '@/components/layout/brand-mark';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const executeResetRequest = async (targetEmail: string) => {
    setError(null);
    const cleanEmail = targetEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      // Direct POST /api/auth/forgot-password call
      const res = await authService.forgotPassword(cleanEmail);
      setSubmitted(true);
      setSuccessMessage(
        res?.message || 'If the email exists, a password reset link has been sent.'
      );
      toast.success('Password reset link sent successfully!');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      const msg = apiErr?.message || 'Failed to request password reset. Please check SMTP configuration.';
      setError(msg);
      toast.error(msg);
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeResetRequest(email);
  };

  const handleRequestAnother = async () => {
    await executeResetRequest(email);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 py-12 overflow-hidden text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Logo */}
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <Link href="/" className="transition-transform hover:scale-105 duration-200">
          <BrandMark size={48} />
        </Link>
        <span className="text-xs font-semibold tracking-wider uppercase text-indigo-400/90 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800/40">
          NEXHIRE AI Identity Platform
        </span>
      </div>

      <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-indigo-950/40 rounded-2xl overflow-hidden transition-all duration-300">
        <CardHeader className="text-center space-y-2 pb-6 pt-8">
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Reset Password
          </CardTitle>
          <CardDescription className="text-sm text-slate-400 leading-relaxed px-2">
            Enter your registered account email and we&apos;ll send you a secure link to reset your password.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-8 space-y-6">
          {error && (
            <div className="flex items-start gap-3 p-3.5 text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {submitted ? (
            <div className="space-y-6 py-2 text-center animate-in zoom-in-95 duration-300">
              <div className="h-16 w-16 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-100">Reset Link Sent</h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                  {successMessage}
                </p>
              </div>

              <p className="text-[11px] text-slate-500">
                Email dispatched to <span className="text-indigo-300 font-mono">{email}</span>. Check your inbox and spam folder.
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="outline"
                  disabled={loading}
                  className="w-full bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 text-slate-200 text-xs py-2.5 rounded-xl transition-all gap-2"
                  onClick={handleRequestAnother}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Resending Email...</span>
                    </>
                  ) : (
                    <span>Request Another Link</span>
                  )}
                </Button>
                <Button
                  asChild
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2.5 rounded-xl font-medium shadow-md shadow-indigo-900/30 gap-2"
                >
                  <Link href="/login">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sign In
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium text-slate-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10 bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl py-2.5"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm py-2.5 rounded-xl shadow-lg shadow-indigo-950/50 transition-all duration-200 gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </Button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
