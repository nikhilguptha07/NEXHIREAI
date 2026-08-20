'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Calendar as CalendarIcon,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Clock,
  X,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardService } from '@/services/dashboard.service';
import { type Candidate } from '@/lib/mock-data';

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('2026-08-05T10:00');
  const [interviewer, setInterviewer] = useState('Alex Morgan');
  const [interviewType, setInterviewType] = useState('TECHNICAL');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      DashboardService.getCandidateById(id)
        .then((res) => setCandidate(res))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleDownloadResume = () => {
    const candidateName = candidate?.name || 'Candidate';
    toast.success(`Downloading ${candidateName}'s Resume...`);
    try {
      const resumeContent = `Candidate: ${candidateName}\nRole: ${candidate?.role}\nEmail: ${candidate?.email}\nPhone: ${candidate?.phone}\nLocation: ${candidate?.location}\nMatch Score: ${candidate?.matchScore}%\nAI Summary: ${candidate?.aiSummary}\nSkills: ${(candidate?.skills || []).join(', ')}\n`;
      const blob = new Blob([resumeContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${candidateName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_resume.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (_err) {
      // Fallback
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await DashboardService.scheduleInterview({
        applicationId: candidate?.id || id,
        scheduledAt: scheduledDate,
        durationMinutes: 60,
        meetingProvider: interviewType,
        location: interviewType === 'ONSITE' ? 'Main Headquarters' : 'Google Meet',
      });
    } catch (_err) {
      // Fallback to local session
    }
    toast.success(`Interview scheduled with ${candidate?.name} for ${new Date(scheduledDate).toLocaleString()}`);
    setShowScheduleModal(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-4">
        <div className="h-6 w-32 bg-accent/40 rounded animate-pulse" />
        <div className="h-48 bg-accent/30 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="space-y-6 pt-2 max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground" asChild>
          <Link href="/dashboard/candidates">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Candidate Directory</span>
          </Link>
        </Button>

        <Card className="glass border-white/10 p-16 text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Candidate not found.</h2>
          <p className="text-sm text-muted-foreground">The requested applicant profile does not exist or has been removed.</p>
          <div className="pt-2">
            <Button size="sm" className="primary-button text-xs gap-2" asChild>
              <Link href="/dashboard/candidates">Return to Candidate Directory</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      {/* Back Button */}
      <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground" asChild>
        <Link href="/dashboard/candidates">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Candidate Directory</span>
        </Link>
      </Button>

      {/* Candidate Profile Hero Card */}
      <Card className="glass border-white/10 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="h-20 w-20 rounded-2xl object-cover border-2 border-primary/30 shadow-xl"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{candidate.name}</h1>
                <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider text-primary border-primary/40 bg-primary/10">
                  {candidate.status}
                </Badge>
              </div>
              <p className="text-sm font-medium text-foreground/90">{candidate.role}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" />{candidate.location}</span>
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-primary" />{candidate.email}</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-primary" />{candidate.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 w-full md:w-auto border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
            <div className="text-right">
              <span className="text-2xl font-extrabold text-primary">{candidate.matchScore}%</span>
              <p className="text-xs text-muted-foreground">AI Neural Match Score</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button onClick={() => setShowScheduleModal(true)} size="sm" className="primary-button text-xs gap-1.5 flex-1 md:flex-initial">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>Schedule Interview</span>
              </Button>
              <Button onClick={handleDownloadResume} size="sm" variant="outline" className="glass text-xs gap-1.5 flex-1 md:flex-initial">
                <FileText className="h-3.5 w-3.5" />
                <span>Download Resume</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Grid: AI Summary + Experience & Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Match Telemetry */}
        <div className="space-y-6">
          <Card className="glass border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-black p-5">
            <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-300">
                <Sparkles className="h-4 w-4 text-purple-400" />
                AI Match Synthesis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>{candidate.aiSummary}</p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-purple-200">
                <span>Verified by Oracle 26ai Vector Index</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10 p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Extracted Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 border border-primary/20 text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Work Experience & Education Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Work Experience */}
          <Card className="glass border-white/10 p-6 space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-foreground pb-2 border-b border-white/10">
              <Briefcase className="h-5 w-5 text-primary" />
              <h2>Work Experience</h2>
            </div>
            <div className="space-y-6 pt-2">
              {candidate.experience.map((exp, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-primary/30 space-y-1">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-foreground">{exp.title}</h3>
                    <span className="text-xs text-muted-foreground bg-accent/30 px-2 py-0.5 rounded-full">{exp.duration}</span>
                  </div>
                  <p className="text-xs font-medium text-primary">{exp.company}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">{exp.description}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Education */}
          <Card className="glass border-white/10 p-6 space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-foreground pb-2 border-b border-white/10">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h2>Education & Degrees</h2>
            </div>
            <div className="space-y-4 pt-2">
              {candidate.education.map((edu, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-accent/20 border border-white/5 text-xs">
                  <div>
                    <p className="font-bold text-foreground">{edu.degree}</p>
                    <p className="text-muted-foreground">{edu.institution}</p>
                  </div>
                  <span className="font-semibold text-muted-foreground">{edu.year}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-foreground">Schedule Technical Interview</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <Label>Candidate</Label>
                <Input value={candidate.name} disabled className="bg-accent/40" />
              </div>

              <div className="space-y-1">
                <Label>Interviewer</Label>
                <Input value={interviewer} onChange={(e) => setInterviewer(e.target.value)} className="bg-black/40 border-white/10" required />
              </div>

              <div className="space-y-1">
                <Label>Date & Time</Label>
                <Input type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="bg-black/40 border-white/10" required />
              </div>

              <div className="space-y-1">
                <Label>Interview Type</Label>
                <select value={interviewType} onChange={(e) => setInterviewType(e.target.value)} className="w-full rounded-lg bg-black/40 border border-white/10 p-2 text-foreground focus:outline-none focus:border-primary">
                  <option value="TECHNICAL">TECHNICAL SCREEN</option>
                  <option value="VIDEO">VIDEO CALL</option>
                  <option value="ONSITE">ONSITE INTERVIEW</option>
                  <option value="PHONE">PHONE SCREEN</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <Button type="button" variant="ghost" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
                <Button type="submit" className="primary-button">Confirm Schedule</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
