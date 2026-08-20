'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, Clock, Briefcase, Award, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardService, type DashboardStats } from '@/services/dashboard.service';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DashboardService.getStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const totalCandidates = stats?.totalCandidates ?? 0;
  const totalInterviews = stats?.totalInterviews ?? 0;
  const totalJobs = stats?.totalJobs ?? 0;
  const totalHired = stats?.applicationsByStatus?.ACCEPTED ?? 0;

  const calculatePct = (count: number) => {
    if (!totalCandidates || totalCandidates === 0) return '0%';
    const pct = Math.min(100, Math.round((count / totalCandidates) * 100));
    return `${pct}%`;
  };

  const FUNNEL_STAGES = [
    { stage: 'Applied Candidates', count: totalCandidates, pct: totalCandidates > 0 ? '100%' : '0%' },
    { stage: 'AI Screened', count: stats?.applicationsByStatus?.SCREENING ?? 0, pct: calculatePct(stats?.applicationsByStatus?.SCREENING ?? 0) },
    { stage: 'Shortlisted', count: stats?.applicationsByStatus?.SHORTLISTED ?? 0, pct: calculatePct(stats?.applicationsByStatus?.SHORTLISTED ?? 0) },
    { stage: 'Interviewed', count: totalInterviews, pct: calculatePct(totalInterviews) },
    { stage: 'Offers Extended', count: stats?.offersSent ?? 0, pct: calculatePct(stats?.offersSent ?? 0) },
    { stage: 'Hired', count: totalHired, pct: calculatePct(totalHired) },
  ];

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recruitment Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Real-time hiring funnel metrics computed directly from database telemetry.
        </p>
      </div>

      {/* KPI Overview Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="glass border-white/10 p-4">
          <span className="text-xs font-semibold text-muted-foreground">Candidates</span>
          <p className="text-2xl font-bold text-foreground mt-1">{totalCandidates}</p>
        </Card>
        <Card className="glass border-white/10 p-4">
          <span className="text-xs font-semibold text-muted-foreground">Interviews</span>
          <p className="text-2xl font-bold text-foreground mt-1">{totalInterviews}</p>
        </Card>
        <Card className="glass border-white/10 p-4">
          <span className="text-xs font-semibold text-muted-foreground">Jobs</span>
          <p className="text-2xl font-bold text-foreground mt-1">{totalJobs}</p>
        </Card>
        <Card className="glass border-white/10 p-4">
          <span className="text-xs font-semibold text-muted-foreground">Hired</span>
          <p className="text-2xl font-bold text-foreground mt-1">{totalHired}</p>
        </Card>
      </div>

      {/* Funnel Overview */}
      <Card className="glass border-white/10 p-6 space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold">Hiring Conversion Funnel</h2>
            <p className="text-xs text-muted-foreground">Live telemetry calculated from database records</p>
          </div>
          <span className="text-xs font-bold text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
            {stats?.hiringRate ?? 0}% Offer Acceptance
          </span>
        </div>

        <div className="space-y-3">
          {FUNNEL_STAGES.map((st) => (
            <div key={st.stage} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span>{st.stage}</span>
                <span>{st.count.toLocaleString()} ({st.pct})</span>
              </div>
              <div className="h-3 w-full bg-accent/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                  style={{ width: st.pct }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
