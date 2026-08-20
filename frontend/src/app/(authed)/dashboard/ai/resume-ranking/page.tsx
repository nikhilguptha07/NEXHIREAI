'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sliders, Sparkles, ArrowLeft, ArrowUpRight, CheckCircle2, User, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { http } from '@/api/client';
import { type Candidate } from '@/lib/mock-data';

export default function ResumeRankingPage() {
  const [selectedJob, setSelectedJob] = useState('Senior Full Stack Engineer');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRankings() {
      try {
        const data = await http.get<Candidate[]>('/candidates/ranking');
        if (Array.isArray(data)) {
          setCandidates(data);
        }
      } catch (_err) {
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    }
    loadRankings();
  }, []);

  return (
    <div className="space-y-6 pt-2 max-w-5xl mx-auto">
      <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground" asChild>
        <Link href="/dashboard/ai">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to AI Neural Suite</span>
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vector Candidate Ranking</h1>
          <p className="text-sm text-muted-foreground">
            Oracle 26ai AI Vector Search similarity scores computed across active requisitions.
          </p>
        </div>
      </div>

      <Card className="glass border-white/10 p-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Job Requisition:</span>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
          >
            <option value="Senior Full Stack Engineer">Senior Full Stack Engineer (Next.js & Spring Boot)</option>
            <option value="Staff AI/ML Engineer">Staff AI/ML Research Engineer</option>
            <option value="Principal Product Designer">Principal Product Designer</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-accent/30 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <Card className="glass border-white/10 p-16 text-center space-y-4">
          <div className="p-4 rounded-full bg-accent/30 text-muted-foreground w-fit mx-auto border border-white/10">
            <UserCheck className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">No Candidates Ranked Yet</h3>
            <p className="text-sm text-muted-foreground">No applicant resumes have been scanned for vector similarity ranking.</p>
          </div>
          <div className="pt-2">
            <Button size="sm" className="primary-button text-xs gap-2 px-5 py-2" asChild>
              <Link href="/dashboard/ai/resume-scanner">
                <Sparkles className="h-4 w-4" />
                <span>Scan Resume</span>
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {candidates.map((cand, index) => (
            <Card key={cand.id} className="glass border-white/10 p-5 hover:border-primary/40 transition-all">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="font-extrabold text-lg text-muted-foreground w-6">#{index + 1}</span>
                  {cand.avatar ? (
                    <img src={cand.avatar} alt={cand.name} className="h-12 w-12 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                      {cand.name?.[0] || 'C'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-base text-foreground">{cand.name}</h3>
                    <p className="text-xs text-muted-foreground">{cand.role} • {cand.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-primary font-bold text-lg">
                      <Sparkles className="h-4 w-4" />
                      <span>{cand.matchScore || 90}%</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Vector Similarity</span>
                  </div>

                  <Button size="sm" variant="outline" className="glass text-xs gap-1" asChild>
                    <Link href={`/dashboard/candidates/${cand.id}`}>
                      Profile Details <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
