'use client';

import { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
  FileCheck,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardService, type ApplicationRecord } from '@/services/dashboard.service';
import { useAuth } from '@/components/providers/auth-provider';
import { type JobPosting } from '@/lib/mock-data';

const formatSalary = (val?: number | null) =>
  typeof val === 'number' && !isNaN(val) ? val.toLocaleString() : '0';

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const isRecruiter = Boolean(
    user?.roles?.includes('RECRUITER') ||
    user?.roles?.includes('SUPER_ADMIN') ||
    user?.roles?.includes('TENANT_ADMIN')
  );

  const [job, setJob] = useState<JobPosting | null>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Candidate Apply Modal state & File Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Recruiter Interview Invitation Modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [meetingProvider, setMeetingProvider] = useState('Google Meet');
  const [scheduling, setScheduling] = useState(false);

  const handleUpdateStatus = async (appId: string, status: string) => {
    try {
      await DashboardService.updateApplicationStatus(appId, status);
      toast.success(`Application status updated to ${status}.`);
      loadJobDetails();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update application status.');
    }
  };

  useEffect(() => {
    loadJobDetails();
  }, [resolvedParams.id]);

  const loadJobDetails = async () => {
    setLoading(true);
    try {
      const [jobData, appsData] = await Promise.all([
        DashboardService.getJobById(resolvedParams.id),
        DashboardService.getJobApplications(resolvedParams.id),
      ]);

      setJob(jobData);
      setApplications(appsData);
    } catch (_err) {
      toast.error('Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  const validateResumeFile = (file: File): boolean => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error('Invalid document format. Only PDF, DOC, and DOCX files are allowed.');
      return false;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error('File size exceeds the 10 MB limit.');
      return false;
    }
    return true;
  };

  const handleResumeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateResumeFile(file)) {
      setResumeFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateResumeFile(file)) {
      setResumeFile(file);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      toast.error('Please attach your resume file before submitting.');
      return;
    }

    setApplying(true);
    try {
      const res = await DashboardService.submitApplication(
        resolvedParams.id,
        resumeFile,
        coverLetter
      );

      toast.success(
        `Application submitted successfully! ATS Score: ${res.atsScore ?? 85}%. Status: ${res.status || 'SHORTLISTED'}`
      );
      setApplyModalOpen(false);
      setResumeFile(null);
      setCoverLetter('');
      loadJobDetails();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const openInviteModal = (app: ApplicationRecord) => {
    setSelectedApp(app);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setScheduledAt(tomorrow.toISOString().slice(0, 16));
    setInviteModalOpen(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setScheduling(true);
    try {
      await DashboardService.scheduleInterview({
        applicationId: selectedApp.id,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: Number(durationMinutes) || 60,
        meetingProvider,
      });

      toast.success(
        `Interview invitation sent to ${selectedApp.candidateName} via ${meetingProvider}!`
      );
      setInviteModalOpen(false);
      setSelectedApp(null);
      loadJobDetails();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to schedule interview.');
    } finally {
      setScheduling(false);
    }
  };

  const rankedApplications = [...applications].sort((a, b) => (b.atsScore || 0) - (a.atsScore || 0));

  const filteredApps = rankedApplications.filter((app) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'NEW') return app.status === 'SUBMITTED';
    if (statusFilter === 'SHORTLISTED') return app.status === 'SHORTLISTED';
    if (statusFilter === 'INTERVIEW') return app.status.includes('INTERVIEW');
    if (statusFilter === 'SELECTED') return app.status === 'SELECTED';
    if (statusFilter === 'REJECTED') return app.status === 'REJECTED';
    return true;
  });

  const getRecommendationBadge = (rec?: string) => {
    switch (rec) {
      case 'VERY_STRONG_HIRE':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">Very Strong Match</Badge>;
      case 'STRONG_HIRE':
        return <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-500/30">Strong Match</Badge>;
      case 'HIRE':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Good Match</Badge>;
      default:
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">AI Evaluated</Badge>;
    }
  };

  if (loading || !job) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const minSal = job.salaryMin ?? job.minSalary ?? 0;
  const maxSal = job.salaryMax ?? job.maxSalary ?? 0;
  const skillsList = Array.isArray(job.requiredSkills)
    ? job.requiredSkills.map((s: any) => (typeof s === 'string' ? s : s?.skillName || 'Skill'))
    : [];

  return (
    <div className="space-y-6 pt-2 max-w-6xl mx-auto">
      <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground" asChild>
        <Link href="/dashboard/jobs">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Job Requisitions</span>
        </Link>
      </Button>

      {/* Job Banner Header */}
      <Card className="glass border-white/10 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider text-primary border-primary/30">
                {job.department || 'GENERAL'}
              </Badge>
              <Badge variant="outline" className="text-xs uppercase text-emerald-400 border-emerald-500/30">
                {job.status}
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{job.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>{job.location || 'Remote'}</span>
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-purple-400" />
                <span>{job.type || 'FULL_TIME'}</span>
              </span>
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                <span>
                  ${formatSalary(minSal)} - ${formatSalary(maxSal)} {job.currency || 'USD'}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isRecruiter && (
              <Button onClick={() => setApplyModalOpen(true)} className="primary-button text-xs gap-2 px-6">
                <Sparkles className="h-4 w-4" />
                <span>Apply for Job</span>
              </Button>
            )}
            {isRecruiter && (
              <Button size="sm" variant="outline" className="glass text-xs" asChild>
                <Link href={`/dashboard/jobs/edit/${job.id}`}>Edit Requisition</Link>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Description & Technical Skills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 glass border-white/10 p-6 space-y-4">
          <h3 className="font-bold text-base text-foreground">Role Description</h3>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
            {job.description || 'No detailed description provided for this job requisition.'}
          </p>
        </Card>

        <Card className="glass border-white/10 p-6 space-y-4">
          <h3 className="font-bold text-base text-foreground">Required Skill Taxonomy</h3>
          <div className="flex flex-wrap gap-1.5">
            {skillsList.map((skill: string) => (
              <Badge key={skill} variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                {skill}
              </Badge>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Experience Level:</span>
              <span className="font-semibold text-foreground">{job.experienceLevel || 'Mid-Senior'}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Applicants:</span>
              <span className="font-semibold text-foreground">{job.applicantsCount ?? applications.length}</span>
            </div>
            <div className="flex justify-between">
              <span>AI Minimum Score Threshold:</span>
              <span className="font-semibold text-purple-400">{job.minimumScore ?? 80}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* RECRUITER ONLY: RECRUITMENT PIPELINE */}
      {isRecruiter && (
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h2 className="text-2xl font-extrabold tracking-tight">Recruitment Pipeline</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Manage candidate applications, ATS match scores, and interview invitations.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-black/40 rounded-xl border border-white/10">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'NEW', label: 'New' },
                { key: 'SHORTLISTED', label: 'Shortlisted' },
                { key: 'INTERVIEW', label: 'Interview' },
                { key: 'SELECTED', label: 'Selected' },
                { key: 'REJECTED', label: 'Rejected' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                    statusFilter === tab.key ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredApps.length === 0 ? (
            <Card className="glass border-white/10 p-8 text-center text-xs text-muted-foreground">
              No applicant records match pipeline stage &quot;{statusFilter}&quot;.
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredApps.map((app) => (
                <Card key={app.id} className="glass border-white/10 p-5 hover:border-primary/40 transition-all">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shrink-0">
                        {app.atsScore ?? 85}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-foreground">{app.candidateName}</h3>
                          {getRecommendationBadge(app.aiRecommendation)}
                          <Badge variant="outline" className="text-[11px] font-semibold text-emerald-400 border-emerald-500/30">
                            {app.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{app.candidateEmail || 'candidate@nexhire.ai'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                      <div className="text-right text-xs">
                        <span className="text-muted-foreground block text-[10px]">Applied Date</span>
                        <span className="font-mono text-foreground">{new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {app.resumeUrl && (
                          <Button size="sm" variant="outline" className="glass text-xs gap-1.5" asChild>
                            <a href={app.resumeUrl} target="_blank" rel="noreferrer">
                              <FileText className="h-3.5 w-3.5 text-primary" />
                              <span>Resume</span>
                            </a>
                          </Button>
                        )}

                        <Button
                          size="sm"
                          onClick={() => openInviteModal(app)}
                          className="glass text-xs gap-1.5"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Schedule Interview</span>
                        </Button>

                        {app.status !== 'SHORTLISTED' && app.status !== 'REJECTED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30 text-xs gap-1.5"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Shortlist</span>
                          </Button>
                        )}

                        {app.status !== 'REJECTED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                            className="border-red-500/30 text-red-400 hover:bg-red-950/30 text-xs gap-1.5"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CANDIDATE APPLY MODAL */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="glass border-white/10 w-full max-w-lg p-6 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-xl font-bold">Apply for {job.title}</CardTitle>
              <CardDescription className="text-xs">
                Upload your resume for real-time AI ATS scoring and shortlisting evaluation.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resume" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Resume Document (PDF, DOC, DOCX)
                </Label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeSelect}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-primary bg-primary/10'
                      : 'border-white/20 hover:border-primary/50 bg-black/40'
                  }`}
                >
                  <Upload className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-xs text-foreground font-semibold">Click to upload or drag resume file (PDF, DOC, DOCX)</p>
                  <p className="text-[10px] text-muted-foreground pt-1">Automated ATS skill parsing & score calculation enabled</p>

                  {resumeFile && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-4 p-3 rounded-lg bg-accent/50 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold text-foreground truncate">{resumeFile.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          ({(resumeFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setResumeFile(null)}
                        className="text-muted-foreground hover:text-foreground p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverLetter" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cover Letter (Optional)
                </Label>
                <textarea
                  id="coverLetter"
                  rows={4}
                  placeholder="Share relevant project achievements or tech stack experience..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs focus:border-primary focus:outline-none text-foreground"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setApplyModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={applying || !resumeFile} className="primary-button text-xs gap-2">
                  {applying ? 'Evaluating Resume & Scoring...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* RECRUITER INTERVIEW INVITATION MODAL */}
      {inviteModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="glass border-white/10 w-full max-w-md p-6 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-xl font-bold">Invite {selectedApp.candidateName}</CardTitle>
              <CardDescription className="text-xs">
                Schedule technical video interview session and generate meeting link.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date & Time
                </Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="bg-black/40 border-white/10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Duration (Minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="bg-black/40 border-white/10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Meeting Provider
                </Label>
                <select
                  id="provider"
                  value={meetingProvider}
                  onChange={(e) => setMeetingProvider(e.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-white/10 p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="Google Meet">Google Meet</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                  <option value="Daily.co">Daily.co</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setInviteModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={scheduling} className="primary-button text-xs gap-2">
                  {scheduling ? 'Scheduling...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
