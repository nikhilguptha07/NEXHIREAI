'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  User,
  Star,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DashboardService } from '@/services/dashboard.service';
import { type InterviewSession } from '@/lib/mock-data';
import { useAuth } from '@/components/providers/auth-provider';

export default function InterviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const isRecruiter = Boolean(
    user?.roles?.includes('RECRUITER') ||
    user?.roles?.includes('SUPER_ADMIN') ||
    user?.roles?.includes('TENANT_ADMIN')
  );

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Recruiter Feedback state
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState('5');
  const [decision, setDecision] = useState<'SELECTED' | 'REJECTED' | 'COMPLETED'>('SELECTED');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSession();
  }, [resolvedParams.id]);

  const loadSession = async () => {
    setLoading(true);
    try {
      const interviews = await DashboardService.getInterviews();
      const found = interviews.find((i) => i.id === resolvedParams.id) || interviews[0];
      if (found) {
        setSession(found);
        if (found.feedback) setFeedback(found.feedback);
        if (found.rating) setRating(String(found.rating));
      }
    } catch (_err) {
      toast.error('Failed to load interview session.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setSubmitting(true);
    try {
      await DashboardService.recordInterviewFeedback(
        session.id,
        feedback,
        Number(rating) || 5,
        decision
      );

      toast.success(`Interview feedback recorded. Decision: ${decision}`);
      router.push('/dashboard/interviews');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground" asChild>
        <Link href="/dashboard/interviews">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Interview Sessions</span>
        </Link>
      </Button>

      {/* Header Banner */}
      <Card className="glass border-white/10 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider text-primary border-primary/30">
                {session.type}
              </Badge>
              <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider text-muted-foreground border-white/20">
                {session.status}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{session.jobTitle}</h1>
            <p className="text-xs text-muted-foreground">
              Candidate: <span className="text-foreground font-semibold">{session.candidateName}</span> • Interviewer: <span className="text-foreground font-semibold">{session.interviewerName}</span>
            </p>
          </div>

          {session.meetingUrl && (
            <Button size="lg" className="primary-button text-sm gap-2" asChild>
              <a href={session.meetingUrl} target="_blank" rel="noreferrer">
                <Video className="h-4 w-4" />
                <span>Join Video Call</span>
              </a>
            </Button>
          )}
        </div>
      </Card>

      {/* RECRUITER FEEDBACK FORM */}
      {isRecruiter && (
        <Card className="glass border-white/10 p-6 space-y-4">
          <CardHeader className="p-0">
            <CardTitle className="text-lg font-bold">Record Technical Assessment & Selection Decision</CardTitle>
            <CardDescription className="text-xs">
              Evaluate coding performance, system architecture answers, and record final hiring decision.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleFeedbackSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Overall Rating (1 - 5 Stars)
                </Label>
                <select
                  id="rating"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-white/10 p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="5">5 ★★★★★ (Exceptional / Strong Hire)</option>
                  <option value="4">4 ★★★★☆ (Good Performance / Hire)</option>
                  <option value="3">3 ★★★☆☆ (Average / Borderline)</option>
                  <option value="2">2 ★★☆☆☆ (Needs Improvement)</option>
                  <option value="1">1 ★☆☆☆☆ (Unsatisfactory / Reject)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="decision" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Candidate Selection Decision
                </Label>
                <select
                  id="decision"
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as any)}
                  className="w-full rounded-xl bg-black/40 border border-white/10 p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="SELECTED">SELECTED / OFFER</option>
                  <option value="REJECTED">REJECT</option>
                  <option value="COMPLETED">INTERVIEW COMPLETED</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Technical Feedback Notes & Recommendations
              </Label>
              <textarea
                id="feedback"
                rows={4}
                placeholder="Detail technical strengths, code quality, communication, and key observations..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs focus:border-primary focus:outline-none text-foreground"
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={submitting} className="primary-button text-xs gap-2">
                {submitting ? 'Saving Decision...' : 'Save Feedback & Decision'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
