'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Eye,
  Mail,
  MapPin,
  Sparkles,
  Trash2,
  MoreVertical,
  ArrowUpDown,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardService } from '@/services/dashboard.service';
import { type Candidate } from '@/lib/mock-data';

export default function CandidatesDirectoryPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'exp' | 'name'>('score');

  useEffect(() => {
    DashboardService.getCandidates().then(setCandidates);
  }, []);

  const handleStatusChange = (id: string, newStatus: Candidate['status']) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    toast.success(`Candidate status updated to ${newStatus}`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove candidate ${name}?`)) {
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      toast.info(`Candidate ${name} removed from pipeline.`);
    }
  };

  const filtered = candidates
    .filter((c) => {
      const matchesQuery =
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.role.toLowerCase().includes(query.toLowerCase()) ||
        c.skills.some((s) => s.toLowerCase().includes(query.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

      return matchesQuery && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.matchScore - a.matchScore;
      if (sortBy === 'exp') return b.experienceYears - a.experienceYears;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidate Directory</h1>
          <p className="text-sm text-muted-foreground">
            Manage applicant profiles, view neural vector scores, and move candidates through pipeline stages.
          </p>
        </div>

        <Button size="sm" className="primary-button gap-2 text-xs" asChild>
          <Link href="/dashboard/ai/resume-scanner">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Scan New Resume</span>
          </Link>
        </Button>
      </div>

      {/* Filter & Sort Bar */}
      <Card className="glass border-white/10 p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by name, role, or skill..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-accent/40 border-border/40 text-sm h-9"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary"
              >
                <option value="score">Match Score</option>
                <option value="exp">Experience</option>
                <option value="name">Name</option>
              </select>
            </div>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-1.5 shrink-0">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              {['ALL', 'NEW', 'SCREENING', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'HIRED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                    statusFilter === st
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-accent/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Candidates Table */}
      <Card className="glass border-white/10">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="p-4">Candidate</th>
                <th className="p-4">Role & Location</th>
                <th className="p-4">Match Score</th>
                <th className="p-4">Top Skills</th>
                <th className="p-4">Pipeline Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filtered.map((cand) => (
                <tr key={cand.id} className="hover:bg-accent/20 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={cand.avatar}
                        alt={cand.name}
                        className="h-10 w-10 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <Link
                          href={`/dashboard/candidates/${cand.id}`}
                          className="font-bold text-sm text-foreground hover:text-primary transition-colors"
                        >
                          {cand.name}
                        </Link>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{cand.email}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-foreground">{cand.role}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      <span>{cand.location}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                        {cand.matchScore}% Match
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {cand.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                      {cand.skills.length > 3 && (
                        <span className="text-[10px] text-muted-foreground px-1">+{cand.skills.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={cand.status}
                      onChange={(e) => handleStatusChange(cand.id, e.target.value as any)}
                      className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
                    >
                      <option value="NEW">NEW</option>
                      <option value="SCREENING">SCREENING</option>
                      <option value="SHORTLISTED">SHORTLISTED</option>
                      <option value="INTERVIEWING">INTERVIEWING</option>
                      <option value="OFFERED">OFFERED</option>
                      <option value="HIRED">HIRED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" asChild>
                        <Link href={`/dashboard/candidates/${cand.id}`} title="View Details">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(cand.id, cand.name)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                        title="Delete Candidate"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-16 text-center space-y-4">
              <div className="p-4 rounded-full bg-accent/30 text-muted-foreground w-fit mx-auto border border-white/10">
                <UserCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">No Candidates Yet</h3>
                <p className="text-sm text-muted-foreground">No resumes have been uploaded.</p>
                <p className="text-xs text-muted-foreground pt-1">
                  Click &quot;Scan Resume&quot; or wait until candidates apply.
                </p>
              </div>
              <div className="pt-2">
                <Button size="sm" className="primary-button text-xs gap-2 px-5 py-2" asChild>
                  <Link href="/dashboard/ai/resume-scanner">
                    <Sparkles className="h-4 w-4" />
                    <span>Scan Resume</span>
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
