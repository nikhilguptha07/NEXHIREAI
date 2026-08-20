'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Video, CheckCircle2, User, Star, Plus } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardService } from '@/services/dashboard.service';
import { type InterviewSession } from '@/lib/mock-data';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);

  useEffect(() => {
    DashboardService.getInterviews().then(setInterviews);
  }, []);

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Sessions</h1>
          <p className="text-sm text-muted-foreground">
            Manage scheduled technical screens, view meeting links, and submit candidate feedback.
          </p>
        </div>

        <Button size="sm" className="primary-button gap-2 text-xs" asChild>
          <Link href="/dashboard/calendar">
            <Calendar className="h-3.5 w-3.5" />
            <span>Open Interactive Calendar</span>
          </Link>
        </Button>
      </div>

      {interviews.length === 0 ? (
        <Card className="glass border-white/10 p-16 text-center space-y-4">
          <div className="p-4 rounded-full bg-accent/30 text-muted-foreground w-fit mx-auto border border-white/10">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">No Scheduled Interviews Yet</h3>
            <p className="text-sm text-muted-foreground">Technical interview sessions will appear here once scheduled.</p>
          </div>
          <div className="pt-2">
            <Button size="sm" className="primary-button text-xs gap-2 px-5 py-2" asChild>
              <Link href="/dashboard/candidates">
                <User className="h-4 w-4" />
                <span>View Candidates</span>
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {interviews.map((session) => (
            <Card key={session.id} className="glass border-white/10 p-5 hover:border-primary/40 transition-all">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {session.candidateAvatar ? (
                    <img src={session.candidateAvatar} alt={session.candidateName} className="h-12 w-12 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                      {session.candidateName?.[0] || 'C'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-foreground">{session.candidateName}</h3>
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-primary border-primary/30">
                        {session.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{session.jobTitle}</p>
                    <p className="text-xs text-muted-foreground pt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1"><User className="h-3 w-3 text-purple-400" />Interviewer: {session.interviewerName} ({session.interviewerRole})</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-2 w-full md:w-auto border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{session.scheduledAt ? new Date(session.scheduledAt).toLocaleString() : 'Scheduled'} ({session.durationMinutes ?? 60} mins)</span>
                  </div>

                  {session.meetingUrl && (
                    <Button size="sm" variant="outline" className="glass text-xs gap-1.5" asChild>
                      <a href={session.meetingUrl} target="_blank" rel="noreferrer">
                        <Video className="h-3.5 w-3.5 text-blue-400" />
                        <span>Join Meeting</span>
                      </a>
                    </Button>
                  )}

                  {session.feedback && (
                    <div className="flex items-center gap-1 text-xs text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>Rating: {session.rating}/5 — "{session.feedback}"</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
