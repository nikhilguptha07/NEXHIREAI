'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  TrendingUp,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardService, type DashboardStats } from '@/services/dashboard.service';
import { type Candidate, type InterviewSession, type JobPosting } from '@/lib/mock-data';
import { useAuth } from '@/components/providers/auth-provider';

export default function DashboardHomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, candsData, intsData, jobsData] = await Promise.all([
          DashboardService.getStats(),
          DashboardService.getCandidates(),
          DashboardService.getInterviews(),
          DashboardService.getJobs(),
        ]);
        setStats(statsData);
        setCandidates(candsData);
        setInterviews(intsData);
        setJobs(jobsData);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6 pt-2">
        <div className="h-8 w-48 bg-accent/40 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-accent/30 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-accent/20 rounded-xl animate-pulse" />
      </div>
    );
  }

  const KPI_CARDS = [
    {
      title: 'Total Candidates',
      value: stats.totalCandidates.toLocaleString(),
      change: '+14% this month',
      icon: Users,
    },
    {
      title: 'Active Job Postings',
      value: stats.totalJobs.toString(),
      change: `${jobs.length || 4} active roles`,
      icon: Briefcase,
    },
    {
      title: 'Interviews Today',
      value: `${interviews.length || 4} Sessions`,
      change: '2 completed',
      icon: Calendar,
    },
    {
      title: 'AI Resume Match Rate',
      value: `${stats.hiringRate || 88}%`,
      change: '+3.8% efficiency',
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-6 pt-2">
      {/* Page Header with 3D Studio Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Hiring Cockpit</h1>
          <p className="text-xs text-muted-foreground">
            Welcome back, {user?.firstName || 'User'}. Here is your enterprise recruiting telemetry summary.
          </p>
        </div>

        <Link
          href="/3d-experience"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] w-fit"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>Launch 3D Candidate Radar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Summary KPI Cards with 3D Tilt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="h-full">
              <Card className="hologram-card border border-border/40 h-full">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {kpi.title}
                    </p>
                    <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                      <span>{kpi.change}</span>
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Candidates */}
        <Card className="lg:col-span-2 border border-border/40 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">Recent Candidates</CardTitle>
              <CardDescription className="text-xs">Top matched candidate pipeline</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary gap-1 h-7" asChild>
              <Link href="/dashboard/candidates">
                View All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="pt-0">
            {candidates.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground space-y-2">
                <p>No candidates in pipeline yet.</p>
                <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8" asChild>
                  <Link href="/dashboard/ai/resume-scanner">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>Scan Resume</span>
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {candidates.slice(0, 4).map((cand) => (
                  <div
                    key={cand.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-accent/20 border border-border/30 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {cand.avatar ? (
                        <img src={cand.avatar} alt={cand.name} className="h-8 w-8 rounded-full object-cover border border-border/40" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center font-bold text-primary text-xs">
                          {cand.name?.[0] || 'C'}
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/dashboard/candidates/${cand.id}`}
                          className="font-semibold text-xs text-foreground hover:text-primary transition-colors"
                        >
                          {cand.name}
                        </Link>
                        <p className="text-[11px] text-muted-foreground">{cand.role} • {cand.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                        {cand.matchScore}% Match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card className="border border-border/40 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">Upcoming Interviews</CardTitle>
              <CardDescription className="text-xs">Scheduled sessions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary gap-1 h-7" asChild>
              <Link href="/dashboard/interviews">
                View Calendar <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="pt-0 space-y-2.5">
            {interviews.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No upcoming interviews scheduled.
              </div>
            ) : (
              interviews.slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="p-2.5 rounded-lg bg-accent/20 border border-border/30 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">{session.candidateName}</span>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {session.type}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{session.jobTitle}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" />
                      {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>With {session.interviewerName}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Grid: Recent Jobs & Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card className="border border-border/40 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">Recent Requisitions</CardTitle>
              <CardDescription className="text-xs">Active job postings</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary gap-1 h-7" asChild>
              <Link href="/dashboard/jobs">
                All Jobs <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {jobs.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">No active jobs found.</div>
            ) : (
              jobs.slice(0, 3).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-2.5 rounded-lg bg-accent/20 border border-border/30 text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{job.title}</p>
                    <p className="text-[11px] text-muted-foreground">{job.department} • {job.location}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {job.applicantsCount || 0} Applicants
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Analytics Overview */}
        <Card className="border border-border/40 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">Analytics Overview</CardTitle>
              <CardDescription className="text-xs">Hiring velocity & match efficiency</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary gap-1 h-7" asChild>
              <Link href="/dashboard/analytics">
                Full Analytics <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-0 space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-accent/20 border border-border/30">
              <span className="text-muted-foreground">Average Time to Hire</span>
              <span className="font-bold text-foreground">14 Days</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-accent/20 border border-border/30">
              <span className="text-muted-foreground">Offer Acceptance Rate</span>
              <span className="font-bold text-foreground">78.5%</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-accent/20 border border-border/30">
              <span className="text-muted-foreground">Average Candidate Match Score</span>
              <span className="font-bold text-primary">88.4%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
