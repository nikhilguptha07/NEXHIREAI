'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Video,
  XCircle,
  FileText,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { DashboardService, type ApplicationRecord, type InterviewRecord } from '@/services/dashboard.service';
import { useAuth } from '@/components/providers/auth-provider';
import { type ApplicationStatus } from '@/types/api';

export default function CandidateApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsData, interviewsData] = await Promise.all([
        DashboardService.getMyApplications(),
        DashboardService.getInterviews(),
      ]);

      setApplications(appsData);
      setInterviews(interviewsData as any[]);
    } catch (_err) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleRespondInterview = async (interviewId: string, response: 'ACCEPT' | 'DECLINE') => {
    try {
      await DashboardService.respondToInterview(interviewId, response);
      toast.success(`Interview invitation ${response === 'ACCEPT' ? 'accepted' : 'declined'}.`);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${response.toLowerCase()} interview.`);
    }
  };

  const handleWithdraw = async (appId: string) => {
    if (!confirm('Are you sure you want to withdraw this job application?')) return;

    try {
      await DashboardService.withdrawApplication(appId);
      toast.success('Application withdrawn successfully.');
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to withdraw application.');
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge className="bg-emerald-600 text-white font-extrabold border-emerald-500 shadow-md">✓ ACCEPTED</Badge>;
      case 'OFFERED':
        return <Badge className="bg-amber-500 text-black font-extrabold border-amber-400 shadow-md">OFFERED</Badge>;
      case 'SELECTED':
        return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold">Selected</Badge>;
      case 'SHORTLISTED':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">Shortlisted</Badge>;
      case 'INTERVIEW_SCHEDULED':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40">Interview Scheduled</Badge>;
      case 'INTERVIEW_COMPLETED':
        return <Badge className="bg-purple-600/30 text-purple-300 border-purple-500/50">Interview Completed</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/40">Rejected</Badge>;
      case 'WITHDRAWN':
        return <Badge variant="outline" className="text-gray-400 border-gray-500/40">Withdrawn</Badge>;
      case 'SCREENING':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/40">Screening</Badge>;
      default:
        return <Badge variant="outline" className="text-blue-400 border-blue-500/30">{status || 'Submitted'}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
          <p className="text-sm text-muted-foreground">
            Track your recruitment application status and interview sessions.
          </p>
        </div>

        <Button size="sm" className="primary-button text-xs gap-2" asChild>
          <Link href="/dashboard/jobs">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Browse Open Jobs</span>
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : applications.length === 0 ? (
        <Card className="glass border-white/10 p-16 text-center space-y-4">
          <div className="p-4 rounded-full bg-accent/30 text-muted-foreground w-fit mx-auto border border-white/10">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">No Applications Yet</h3>
            <p className="text-sm text-muted-foreground">Explore published job requisitions and submit your application.</p>
          </div>
          <div className="pt-2">
            <Button size="sm" className="primary-button text-xs gap-2 px-5 py-2" asChild>
              <Link href="/dashboard/jobs">
                <Briefcase className="h-4 w-4" />
                <span>Explore Open Roles</span>
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const matchedInterview = interviews.find(
              (i) => i.applicationId === app.id || i.jobTitle === app.jobTitle
            );
            const isWithdrawn = app.status === 'WITHDRAWN';
            const isRejected = app.status === 'REJECTED';

            return (
              <Card key={app.id} className="glass border-white/10 p-6 transition-all hover:border-primary/40">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-foreground">{app.jobTitle}</h3>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">
                      Applied on {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recently'} {app.department ? `• ${app.department}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/10">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground">ATS Score</div>
                        <div className="text-sm font-extrabold text-primary">{app.atsScore ?? 85}%</div>
                      </div>
                    </div>

                    {!isWithdrawn && !isRejected && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleWithdraw(app.id)}
                        className="border-red-500/30 text-red-400 hover:bg-red-950/30 text-xs gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Withdraw</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Interview Information Banner */}
                {matchedInterview && (
                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-purple-300">
                        <Calendar className="h-4 w-4" />
                        <span>Video Technical Interview Session</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Scheduled: {matchedInterview.scheduledAt ? new Date(matchedInterview.scheduledAt).toLocaleString() : 'Scheduled'} ({matchedInterview.durationMinutes ?? 60} mins)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {matchedInterview.status === 'INVITED' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleRespondInterview(matchedInterview.id, 'ACCEPT')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRespondInterview(matchedInterview.id, 'DECLINE')}
                            className="text-xs gap-1 border-red-500/40 text-red-400 hover:bg-red-950/40"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Decline
                          </Button>
                        </>
                      )}

                      {matchedInterview.meetingUrl && (
                        <Button size="sm" className="primary-button text-xs gap-1.5" asChild>
                          <a href={matchedInterview.meetingUrl} target="_blank" rel="noreferrer">
                            <Video className="h-3.5 w-3.5" />
                            <span>Join Interview</span>
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
