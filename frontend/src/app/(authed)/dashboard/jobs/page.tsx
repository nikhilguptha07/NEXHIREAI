'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Briefcase,
  Users,
  MapPin,
  Clock,
  DollarSign,
  Search,
  Filter,
  ArrowRight,
  LayoutGrid,
  List,
  Trash2,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DashboardService } from '@/services/dashboard.service';
import { useAuth } from '@/components/providers/auth-provider';
import { type JobPosting } from '@/lib/mock-data';
import { type ApiError } from '@/api/client';

const formatSalary = (val?: number | null) =>
  typeof val === 'number' && !isNaN(val) ? val.toLocaleString() : '0';

export default function JobsDirectoryPage() {
  const { user } = useAuth();
  const isRecruiter = Boolean(
    user?.roles?.includes('RECRUITER') ||
    user?.roles?.includes('SUPER_ADMIN') ||
    user?.roles?.includes('TENANT_ADMIN')
  );

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    DashboardService.getJobs().then(setJobs);
  }, []);

  const handleStatusChange = async (id: string, newStatus: JobPosting['status']) => {
    if (!isRecruiter) {
      toast.error('You do not have permission to perform this action.');
      return;
    }

    try {
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status: newStatus } : j))
      );
      toast.success(`Job requisition status updated to ${newStatus}`);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr?.status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else {
        toast.error(apiErr?.message || 'Failed to update job status');
      }
    }
  };

  const handleDeleteJob = async (id: string, title: string) => {
    if (!isRecruiter) {
      toast.error('You do not have permission to perform this action.');
      return;
    }

    if (confirm(`Are you sure you want to delete job requisition "${title}"?`)) {
      try {
        setJobs((prev) => prev.filter((j) => j.id !== id));
        toast.info(`Job requisition "${title}" deleted.`);
      } catch (err) {
        const apiErr = err as ApiError;
        if (apiErr?.status === 403) {
          toast.error('You do not have permission to perform this action.');
        } else {
          toast.error(apiErr?.message || 'Failed to delete job requisition.');
        }
      }
    }
  };

  const filtered = jobs.filter((j) => {
    const titleMatch = (j.title || '').toLowerCase().includes(query.toLowerCase());
    const deptMatch = (j.department || '').toLowerCase().includes(query.toLowerCase());
    const skillMatch = Array.isArray(j.requiredSkills) && j.requiredSkills.some((s) => {
      const name = typeof s === 'string' ? s : (s as any)?.skillName || '';
      return name.toLowerCase().includes(query.toLowerCase());
    });

    const matchesQuery = titleMatch || deptMatch || skillMatch;
    const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Requisitions</h1>
          <p className="text-sm text-muted-foreground">
            {isRecruiter
              ? 'Manage open job postings, view applicant telemetry, and configure skill match requirements.'
              : 'Browse open roles, view skill requirements, and submit applications.'}
          </p>
        </div>

        {isRecruiter && (
          <Button size="sm" className="primary-button gap-2 text-xs" asChild>
            <Link href="/dashboard/jobs/new">
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Job Requisition</span>
            </Link>
          </Button>
        )}
      </div>

      {/* Filter & View Mode Bar */}
      <Card className="glass border-white/10 p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by job title, department, or skill..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-accent/40 border-border/40 text-sm h-9"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Table View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
              {['ALL', 'PUBLISHED', 'DRAFT', 'CLOSED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
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

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((job) => {
            const minSal = job.salaryMin ?? job.minSalary ?? 0;
            const maxSal = job.salaryMax ?? job.maxSalary ?? 0;
            const skillsList = Array.isArray(job.requiredSkills)
              ? job.requiredSkills.map((s: any) => (typeof s === 'string' ? s : s?.skillName || 'Skill'))
              : [];

            return (
              <Card key={job.id} className="glass border-white/10 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground border-white/20 mb-2">
                        {job.department || 'GENERAL'}
                      </Badge>
                      <CardTitle className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                        <Link href={`/dashboard/jobs/${job.id}`}>{job.title}</Link>
                      </CardTitle>
                    </div>

                    {isRecruiter ? (
                      <select
                        value={job.status || 'PUBLISHED'}
                        onChange={(e) => handleStatusChange(job.id, e.target.value as any)}
                        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[11px] font-bold text-foreground focus:outline-none focus:border-primary"
                      >
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    ) : (
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-primary border-primary/30">
                        {job.status || 'PUBLISHED'}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" />{job.location || 'Remote'}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5 text-primary" />{job.type || job.jobType || 'FULL_TIME'}</span>
                    <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-primary" />${formatSalary(minSal)} - ${formatSalary(maxSal)}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {skillsList.map((skill, idx) => (
                      <span key={`${skill}-${idx}`} className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-md font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-bold text-white">{job.applicantsCount ?? 0}</span>
                      <span className="text-muted-foreground">Applicants</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline" className="glass text-xs gap-1" asChild>
                        <Link href={`/dashboard/jobs/${job.id}`}>
                          View Details <ArrowRight className="h-3 w-3" />
                        </Link>
                      </Button>
                      {isRecruiter && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteJob(job.id, job.title)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                          title="Delete Requisition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card className="glass border-white/10">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Requisition Title</th>
                  <th className="p-4">Department & Location</th>
                  <th className="p-4">Compensation</th>
                  <th className="p-4">Applicants</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filtered.map((job) => {
                  const minSal = job.salaryMin ?? job.minSalary ?? 0;
                  const maxSal = job.salaryMax ?? job.maxSalary ?? 0;

                  return (
                    <tr key={job.id} className="hover:bg-accent/20 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-sm text-foreground">
                          <Link href={`/dashboard/jobs/${job.id}`} className="hover:text-primary transition-colors">
                            {job.title}
                          </Link>
                        </div>
                        <div className="text-[11px] text-muted-foreground">{job.type || job.jobType || 'FULL_TIME'}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-foreground">{job.department || 'General'}</div>
                        <div className="text-[11px] text-muted-foreground">{job.location || 'Remote'}</div>
                      </td>
                      <td className="p-4 font-semibold text-foreground">
                        ${formatSalary(minSal)} - ${formatSalary(maxSal)}
                      </td>
                      <td className="p-4 font-bold text-primary">
                        {job.applicantsCount ?? 0} Candidates
                      </td>
                      <td className="p-4">
                        {isRecruiter ? (
                          <select
                            value={job.status || 'PUBLISHED'}
                            onChange={(e) => handleStatusChange(job.id, e.target.value as any)}
                            className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs font-semibold text-foreground"
                          >
                            <option value="PUBLISHED">PUBLISHED</option>
                            <option value="DRAFT">DRAFT</option>
                            <option value="CLOSED">CLOSED</option>
                          </select>
                        ) : (
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-primary border-primary/30">
                            {job.status || 'PUBLISHED'}
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/dashboard/jobs/${job.id}`}>View</Link>
                          </Button>
                          {isRecruiter && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteJob(job.id, job.title)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
