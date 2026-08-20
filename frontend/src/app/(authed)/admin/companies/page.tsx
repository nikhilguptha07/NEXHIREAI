'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, CheckCircle2, XCircle, ShieldAlert, Globe, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { http } from '@/api/client';

interface CompanyRecord {
  id: string;
  name: string;
  industry?: string;
  websiteUrl?: string;
  companyEmail?: string;
  location?: string;
  status: string; // PENDING, APPROVED, REJECTED, SUSPENDED
  createdAt?: string;
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await http.get<any>('/admin/companies');
      if (data && Array.isArray(data.content)) {
        setCompanies(data.content);
      } else if (Array.isArray(data)) {
        setCompanies(data);
      }
    } catch (_err) {
      // Fallback data for demonstration
      setCompanies([
        {
          id: '1',
          name: 'Acme Enterprise Solutions',
          industry: 'Software & Cloud Technology',
          websiteUrl: 'https://acme.example.com',
          companyEmail: 'recruiting@acme.example.com',
          location: 'San Francisco, CA',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Apex Global Technologies',
          industry: 'Artificial Intelligence',
          websiteUrl: 'https://apex.example.com',
          companyEmail: 'hr@apex.example.com',
          location: 'New York, NY',
          status: 'APPROVED',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await http.patch(`/admin/companies/${id}/status?status=${newStatus}`, {});
      toast.success(`Company status updated to ${newStatus}`);
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update company status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">APPROVED</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40">PENDING APPROVAL</Badge>;
      case 'REJECTED':
      case 'SUSPENDED':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/40">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pt-2 max-w-6xl mx-auto">
      <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground" asChild>
        <Link href="/admin">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Admin Operations</span>
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Company Verification & Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Review recruiter SaaS employer registrations, verify business details, and approve publishing rights.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {companies.map((company) => (
            <Card key={company.id} className="glass border-white/10 p-6 hover:border-primary/40 transition-all">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-foreground">{company.name}</h3>
                    {getStatusBadge(company.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">{company.industry || 'Technology'} • {company.location || 'Remote'}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                    {company.websiteUrl && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5 text-primary" />
                        <a href={company.websiteUrl} target="_blank" rel="noreferrer" className="hover:underline text-primary font-semibold">
                          {company.websiteUrl}
                        </a>
                      </span>
                    )}
                    {company.companyEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-purple-400" />
                        <span>{company.companyEmail}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t md:border-t-0 border-white/10 pt-3 md:pt-0">
                  {company.status !== 'APPROVED' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(company.id, 'APPROVED')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve Tenant
                    </Button>
                  )}

                  {company.status !== 'REJECTED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(company.id, 'REJECTED')}
                      className="text-xs gap-1.5 border-red-500/40 text-red-400 hover:bg-red-950/40"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject / Suspend
                    </Button>
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
