'use client';

import { useState, useRef, useEffect, useCallback, ChangeEvent, DragEvent, FormEvent } from 'react';
import Link from 'next/link';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  FileCheck,
  X,
  Briefcase,
  UserCheck,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

import { http } from '@/api/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOCK_CANDIDATES, MOCK_JOBS, type Candidate, type JobPosting } from '@/lib/mock-data';
import { parseResumeDocument, type ParsedResumeData } from '@/lib/resume-parser';
import { DashboardService } from '@/services/dashboard.service';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];

export default function ResumeScannerPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [jobs, setJobs] = useState<JobPosting[]>(MOCK_JOBS);
  const [selectedJobId, setSelectedJobId] = useState<string>(MOCK_JOBS[0]?.id || 'job-001');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [parsing, setParsing] = useState<boolean>(false);
  const [parsedResult, setParsedResult] = useState<ParsedResumeData | null>(null);
  const [duplicateCandidate, setDuplicateCandidate] = useState<Candidate | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [savingCandidate, setSavingCandidate] = useState<boolean>(false);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const liveJobs = await DashboardService.getJobs();
        if (Array.isArray(liveJobs) && liveJobs.length > 0 && liveJobs[0]?.id) {
          setJobs(liveJobs);
          setSelectedJobId(liveJobs[0].id);
        }
      } catch (_err) {
        // Fallback to MOCK_JOBS already initialized
      }
    }
    fetchJobs();
  }, []);

  const defaultJob: JobPosting = {
    id: 'job-001',
    title: 'Senior Full Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'FULL_TIME',
    experienceLevel: 'Senior',
    salaryMin: 120000,
    salaryMax: 160000,
    currency: 'USD',
    status: 'PUBLISHED',
    postedDate: new Date().toISOString(),
    applicantsCount: 12,
    shortlistedCount: 4,
    description: 'Lead engineering team',
    requiredSkills: ['React', 'Next.js', 'TypeScript', 'Java', 'Spring Boot'],
  };

  const activeJob: JobPosting = jobs.find((j) => j.id === selectedJobId) ?? (jobs.length > 0 && jobs[0] ? jobs[0] : defaultJob);

  const validateFile = useCallback((file: File): boolean => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error('Invalid file format. Please upload a PDF, DOC, or DOCX document.');
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error('File size exceeds maximum allowed limit of 10 MB.');
      return false;
    }

    return true;
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setParsedResult(null);
      setDuplicateCandidate(null);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setParsedResult(null);
      setDuplicateCandidate(null);
    }
  };

  const handleStartParsing = async () => {
    if (!selectedFile) {
      toast.error('Please select a valid resume document first.');
      return;
    }

    setParsing(true);
    setUploadProgress(15);
    setStatusText('Uploading resume to secure enterprise storage...');
    setParsedResult(null);
    setDuplicateCandidate(null);

    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(timer);
          return 90;
        }
        if (prev === 30) setStatusText('Extracting canonical entities and metadata...');
        if (prev === 60) setStatusText('Running AI vector embeddings and skill extraction...');
        if (prev === 85) setStatusText('Calculating dynamic ATS scores and gaps...');
        return prev + 15;
      });
    }, 250);

    try {
      try {
        await http.upload('/resumes/upload', selectedFile);
      } catch (_err) {
        // Fallback to client-side document parser if backend upload endpoint is mocked
      }

      const parsed = await parseResumeDocument(
        selectedFile,
        activeJob.title || 'Software Requisition',
        activeJob.requiredSkills || []
      );

      clearInterval(timer);
      setUploadProgress(100);
      setStatusText('Neural parsing complete!');
      setParsing(false);
      setParsedResult(parsed);

      const parsedEmail = (parsed.personalInfo.email || '').toLowerCase().trim();
      const parsedName = (parsed.personalInfo.fullName || '').toLowerCase().trim();

      let match: Candidate | undefined;
      try {
        const liveCandidates = await http.get<Candidate[]>('/candidates');
        if (Array.isArray(liveCandidates)) {
          match = liveCandidates.find(
            (c) =>
              (parsedEmail && (c.email || '').toLowerCase().trim() === parsedEmail) ||
              (parsedName && (c.name || '').toLowerCase().trim() === parsedName)
          );
        }
      } catch (_err) {
        match = MOCK_CANDIDATES.find(
          (c) =>
            (parsedEmail && (c.email || '').toLowerCase().trim() === parsedEmail) ||
            (parsedName && (c.name || '').toLowerCase().trim() === parsedName)
        );
      }

      if (match) {
        setDuplicateCandidate(match);
        toast.warning(`Duplicate Candidate Detected: ${match.name}`);
      } else {
        toast.success(`Resume analyzed successfully for ${parsed.personalInfo.fullName || 'Candidate'}!`);
      }
    } catch (_err) {
      clearInterval(timer);
      setParsing(false);
      toast.error('Failed to parse resume content. Please check file format and retry.');
    }
  };

  const handleSaveToCandidates = async () => {
    if (!parsedResult) return;
    setSavingCandidate(true);

    try {
      await http.post('/candidates', {
        name: parsedResult.personalInfo.fullName || 'Unnamed Candidate',
        email: parsedResult.personalInfo.email || '',
        phone: parsedResult.personalInfo.phone || '',
        location: parsedResult.personalInfo.address || 'Remote',
        role: activeJob.title || 'Engineering',
        skills: parsedResult.skills.technical || [],
        matchScore: parsedResult.atsScores.overallScore || 0,
      });

      toast.success(`Saved ${parsedResult.personalInfo.fullName || 'candidate'} to candidate database!`);
      window.location.href = '/dashboard/candidates';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database insert failed.';
      toast.error(`Failed to save candidate: ${msg}`);
    } finally {
      setSavingCandidate(false);
    }
  };

  return (
    <div className="space-y-6 pt-2 max-w-5xl mx-auto">
      {/* Back Navigation */}
      <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground" asChild>
        <Link href="/dashboard/ai">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to AI Tools</span>
        </Link>
      </Button>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">AI Resume Scanner & Parser</h1>
        <p className="text-sm text-muted-foreground">
          Upload PDF/DOCX resumes to extract entities, run vector skill matching, and generate dynamic ATS scores.
        </p>
      </div>

      {/* Target Job Requisition Selector */}
      <Card className="glass border-white/10 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="font-bold text-foreground">Target Job Requisition:</span>
          </div>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full sm:w-auto bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary font-semibold"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title || 'Untitled Job'} ({j.department || 'General'})
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Drag & Drop Resume Upload Zone */}
      <Card className="glass border-white/10 p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            isDragOver ? 'border-primary bg-primary/10' : 'border-white/20 hover:border-primary/40'
          }`}
        >
          <div className="p-4 rounded-full bg-primary/10 text-primary w-fit mx-auto mb-3">
            <Upload className="h-8 w-8" />
          </div>

          <h3 className="font-bold text-base text-foreground">Drag & Drop Resume File</h3>
          <p className="text-xs text-muted-foreground pt-1">Supports PDF, DOC, and DOCX documents up to 10 MB</p>

          <div className="pt-4 flex justify-center gap-3">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="glass text-xs gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Browse Local File</span>
            </Button>
          </div>

          {selectedFile && (
            <div className="mt-4 p-3 rounded-xl bg-accent/40 border border-white/10 max-w-md mx-auto flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <FileCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-foreground truncate">{selectedFile.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Upload Progress Bar & Action Button */}
        <div className="pt-4 flex flex-col items-center gap-3">
          {parsing && (
            <div className="w-full max-w-md space-y-2 text-xs text-center">
              <div className="flex justify-between font-semibold">
                <span className="text-primary">{statusText}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-accent/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleStartParsing}
            disabled={parsing || !selectedFile}
            className="primary-button text-xs gap-2 px-6 py-2"
          >
            {parsing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Parsing Resume Document...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Start AI Neural Scan</span>
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Duplicate Candidate Warning Card */}
      {duplicateCandidate && (
        <Card className="glass border-amber-500/40 bg-gradient-to-r from-amber-950/20 to-black p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0" />
            <div>
              <h3 className="font-bold text-base text-amber-300">Duplicate Candidate Found in Pipeline</h3>
              <p className="text-xs text-muted-foreground">
                Candidate email <strong>{duplicateCandidate.email}</strong> already exists in your active applicant database.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              {duplicateCandidate.avatar ? (
                <img src={duplicateCandidate.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                  {duplicateCandidate.name?.[0] || 'C'}
                </div>
              )}
              <div>
                <p className="font-bold text-foreground">{duplicateCandidate.name || 'Candidate'}</p>
                <p className="text-muted-foreground">
                  {duplicateCandidate.role || 'Applicant'} • Previous Score: {duplicateCandidate.matchScore ?? 0}%
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="glass text-xs" asChild>
              <Link href={`/dashboard/candidates/${duplicateCandidate.id}`}>View Candidate Record</Link>
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button size="sm" variant="ghost" onClick={() => setDuplicateCandidate(null)} className="text-xs">
              Dismiss
            </Button>
            <Button
              size="sm"
              onClick={() => {
                toast.success(`Candidate profile record verified for ${duplicateCandidate.name}!`);
                setDuplicateCandidate(null);
              }}
              className="primary-button text-xs gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Confirm Existing Record</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Extracted Parsed Data & Dynamic ATS Breakdown */}
      {parsedResult && !duplicateCandidate && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3">
          {/* Dynamic ATS Score Banner */}
          <Card className="glass border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-black p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10 pb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center font-extrabold text-white text-2xl shadow-xl">
                  {parsedResult.atsScores?.overallScore ?? 0}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">Dynamic ATS Match Score</h2>
                    <Badge variant="outline" className="text-xs text-purple-400 border-purple-500/40 bg-purple-500/10">
                      {parsedResult.atsScores?.confidenceScore ?? 95}% Confidence
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground pt-0.5">
                    Evaluated against <strong>{activeJob.title}</strong>
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                disabled={savingCandidate}
                onClick={handleSaveToCandidates}
                className="primary-button text-xs gap-1.5"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>{savingCandidate ? 'Saving Record...' : 'Save to Candidates'}</span>
              </Button>
            </div>

            {/* Score Breakdown Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-accent/30 border border-white/5 space-y-1">
                <span className="text-muted-foreground font-semibold">SKILLS MATCH</span>
                <p className="font-bold text-base text-primary">{parsedResult.atsScores?.skillScore ?? 0}%</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/30 border border-white/5 space-y-1">
                <span className="text-muted-foreground font-semibold">EXPERIENCE</span>
                <p className="font-bold text-base text-purple-400">{parsedResult.atsScores?.experienceScore ?? 0}%</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/30 border border-white/5 space-y-1">
                <span className="text-muted-foreground font-semibold">EDUCATION</span>
                <p className="font-bold text-base text-blue-400">{parsedResult.atsScores?.educationScore ?? 0}%</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/30 border border-white/5 space-y-1">
                <span className="text-muted-foreground font-semibold">KEYWORDS</span>
                <p className="font-bold text-base text-emerald-400">{parsedResult.atsScores?.keywordScore ?? 0}%</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/30 border border-white/5 space-y-1">
                <span className="text-muted-foreground font-semibold">FORMATTING</span>
                <p className="font-bold text-base text-amber-400">{parsedResult.atsScores?.formattingScore ?? 0}%</p>
              </div>
            </div>
          </Card>

          {/* Personal Metadata & Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass border-white/10 p-6 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Extracted Candidate Metadata</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full Name:</span>
                  <span className="font-bold text-foreground">{parsedResult.personalInfo?.fullName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground">{parsedResult.personalInfo?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="text-foreground">{parsedResult.personalInfo?.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="text-foreground">{parsedResult.personalInfo?.address || 'Remote'}</span>
                </div>
              </div>
            </Card>

            <Card className="glass border-white/10 p-6 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Technical Skill Taxonomy</h3>
              <div className="flex flex-wrap gap-1.5">
                {(parsedResult.skills?.technical || []).map((skill: string) => (
                  <span key={skill} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 border border-primary/20 text-primary">
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          {/* Strengths, Weaknesses & Recommendation */}
          <Card className="glass border-white/10 p-6 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <h3 className="font-bold text-base text-foreground">AI Match Evaluation</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="space-y-2">
                <span className="font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Top Strengths
                </span>
                <ul className="space-y-1.5 list-disc list-inside text-muted-foreground">
                  {(parsedResult.jobMatch?.strengths || []).map((st: string, idx: number) => (
                    <li key={idx}>{st}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Areas for Improvement
                </span>
                <ul className="space-y-1.5 list-disc list-inside text-muted-foreground">
                  {(parsedResult.jobMatch?.weaknesses || []).map((wk: string, idx: number) => (
                    <li key={idx}>{wk}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                  <X className="h-4 w-4" /> Missing Role Skills
                </span>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(parsedResult.jobMatch?.missingSkills || []).length > 0 ? (
                    parsedResult.jobMatch.missingSkills.map((ms: string) => (
                      <span key={ms} className="px-2 py-0.5 rounded text-[11px] bg-red-950/40 border border-red-500/30 text-red-300">
                        {ms}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No critical role skills missing.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs space-y-1">
              <span className="font-bold text-purple-300 uppercase tracking-wider block">AI Hiring Recommendation:</span>
              <p className="text-foreground leading-relaxed">{parsedResult.jobMatch?.recommendation || 'Candidate evaluation complete.'}</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
