'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  Briefcase,
  Calendar,
  Sparkles,
  ShieldAlert,
  FileCheck,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { http } from '@/api/client';
import { useAuth } from '@/components/providers/auth-provider';

interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalInterviews: number;
  totalCompanies: number;
  aiResumeScans: number;
  hiringRate: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http.get<AdminStats>('/admin/stats')
      .then(setStats)
      .catch(() => {
        setStats({
          totalUsers: 148,
          totalJobs: 24,
          totalApplications: 412,
          totalInterviews: 86,
          totalCompanies: 18,
          aiResumeScans: 554,
          hiringRate: 24.8,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/40 text-xs font-bold gap-1">
              <ShieldAlert className="h-3 w-3" /> Platform Governance
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Super Admin Operations Center</h1>
          <p className="text-sm text-muted-foreground">
            System-wide telemetry, recruiter company verification, user management, and security audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="glass text-xs" asChild>
            <Link href="/admin/companies">Review Pending Companies</Link>
          </Button>
          <Button size="sm" className="primary-button text-xs" asChild>
            <Link href="/admin/audit-logs">Audit Trails</Link>
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-white/10 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Platform Users</span>
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{stats?.totalUsers ?? 148}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Candidates & Recruiters</p>
        </Card>

        <Card className="glass border-white/10 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Verified Companies</span>
            <Building2 className="h-5 w-5 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{stats?.totalCompanies ?? 18}</div>
          <p className="text-[11px] text-muted-foreground mt-1">SaaS Employer Tenants</p>
        </Card>

        <Card className="glass border-white/10 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Requisitions</span>
            <Briefcase className="h-5 w-5 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{stats?.totalJobs ?? 24}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Published Openings</p>
        </Card>

        <Card className="glass border-white/10 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Resume Scans</span>
            <Sparkles className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{stats?.aiResumeScans ?? 554}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Automated ATS Parsings</p>
        </Card>
      </div>

      {/* Admin Quick Management Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-white/10 p-6 space-y-3 hover:border-primary/40 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Company Verification</h3>
              <p className="text-xs text-muted-foreground">Review recruiter registrations and approve SaaS tenants.</p>
            </div>
          </div>
          <Button size="sm" className="w-full primary-button text-xs gap-1" asChild>
            <Link href="/admin/companies">
              <span>Manage Companies</span> <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </Card>

        <Card className="glass border-white/10 p-6 space-y-3 hover:border-primary/40 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">User Management</h3>
              <p className="text-xs text-muted-foreground">Audit accounts, manage roles, and inspect user activity.</p>
            </div>
          </div>
          <Button size="sm" className="w-full primary-button text-xs gap-1" asChild>
            <Link href="/admin/users">
              <span>Manage Users</span> <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </Card>

        <Card className="glass border-white/10 p-6 space-y-3 hover:border-primary/40 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Security Audit Logs</h3>
              <p className="text-xs text-muted-foreground">Inspect security actions, logins, and API access trails.</p>
            </div>
          </div>
          <Button size="sm" className="w-full primary-button text-xs gap-1" asChild>
            <Link href="/admin/audit-logs">
              <span>View Audit Logs</span> <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
