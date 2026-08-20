'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Key,
  Database,
  FileCheck,
  UserCheck,
  History,
  Building2,
  ArrowRight,
  Server,
  Sparkles,
  Zap,
} from 'lucide-react';

import { SiteHeader } from '@/components/layout/site-header';
import { PremiumFooter } from '@/components/landing/PremiumFooter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Interactive3DCard } from '@/components/3d/Interactive3DCard';

const Background3DScene = dynamic(
  () => import('@/components/3d/Background3DScene').then((mod) => mod.Background3DScene),
  { ssr: false }
);

export default function SecurityPage() {
  const SECURITY_FEATURES = [
    {
      icon: Lock,
      title: 'Authentication & SSO',
      description: 'OAuth2 / OpenID Connect single sign-on, Google & Microsoft enterprise login, and multi-factor authentication.',
      badge: 'SSO & Auth',
      color: '#38bdf8',
    },
    {
      icon: UserCheck,
      title: 'Role-Based Access Control (RBAC)',
      description: 'Granular permissions restricting candidate data access across Recruiters, Hiring Managers, Interviewers, and Admins.',
      badge: 'RBAC',
      color: '#818cf8',
    },
    {
      icon: Key,
      title: 'Stateless JWT Token Security',
      description: 'Signed HS512/RS256 JSON Web Tokens with automated token rotation and secure HTTP-only cookie transport.',
      badge: 'JWT Tokens',
      color: '#a855f7',
    },
    {
      icon: ShieldCheck,
      title: 'End-to-End Data Encryption',
      description: 'AES-256 encryption for candidate data at rest and TLS 1.3 encryption for all data in transit across APIs.',
      badge: 'AES-256 / TLS 1.3',
      color: '#10b981',
    },
    {
      icon: Database,
      title: 'Secure Resume Vector Storage',
      description: 'Encrypted object storage with signed URL access expiration and zero public file bucket permissions.',
      badge: 'Encrypted Storage',
      color: '#34d399',
    },
    {
      icon: Server,
      title: 'Oracle Database 23ai Security',
      description: 'Oracle Transparent Data Encryption (TDE), Virtual Private Database (VPD), and isolated database schemas.',
      badge: 'Oracle TDE',
      color: '#ec4899',
    },
    {
      icon: FileCheck,
      title: 'GDPR & Privacy Compliance',
      description: 'Automated candidate PII redaction, right-to-be-forgotten data deletion pipelines, and data minimization controls.',
      badge: 'GDPR Ready',
      color: '#f43f5e',
    },
    {
      icon: History,
      title: 'Immutable Audit Logging',
      description: 'Tamper-proof audit logs recording all candidate profile views, resume downloads, status changes, and recruiter notes.',
      badge: 'Audit Trail',
      color: '#fbbf24',
    },
    {
      icon: Building2,
      title: 'Enterprise Perimeter Protection',
      description: 'Rate limiting, Web Application Firewall (WAF), DDoS protection, and SOC2 Type II audit readiness.',
      badge: 'SOC2 / WAF',
      color: '#06b6d4',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 relative">
      <SiteHeader />

      <main className="flex-1 relative">
        {/* Ambient 3D Particle Background */}
        <Background3DScene className="fixed inset-0 pointer-events-none z-0 opacity-60" />

        {/* Hero Section */}
        <section className="relative pt-24 pb-20 overflow-hidden border-b border-border/40">
          <div className="grid-3d-backdrop absolute inset-0 h-[140%] opacity-30 pointer-events-none" />

          <div className="container relative z-10 text-center max-w-4xl mx-auto space-y-6">
            <Badge variant="outline" className="px-3.5 py-1 text-xs border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Bank-Grade Security Architecture
            </Badge>

            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight">
              Enterprise Security & <br />
              <span className="gradient-text">GDPR Data Compliance</span>
            </h1>

            <p className="text-muted-foreground text-base md:text-xl max-w-2xl mx-auto">
              NEXHIRE AI protects sensitive candidate resumes, evaluation rubrics, and recruiter data with zero-trust access control and Oracle Database 23ai encryption.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button size="lg" className="primary-button gap-2 text-sm px-7 shadow-xl shadow-blue-500/20" asChild>
                <Link href="/dashboard">
                  <span>Go to Secure Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" className="glass text-sm px-7 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10" asChild>
                <Link href="/features">
                  <span>Explore Features</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Security Features Grid */}
        <section className="py-24 container relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Comprehensive Security Infrastructure</h2>
            <p className="text-base text-muted-foreground">
              Designed from the ground up to protect enterprise candidate PII and adhere to international data privacy standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECURITY_FEATURES.map((sec) => {
              const Icon = sec.icon;
              return (
                <Interactive3DCard key={sec.title} maxTilt={14} depth={25} glowColor={`${sec.color}30`}>
                  <div className="hologram-card p-7 rounded-3xl h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div
                          className="p-3.5 rounded-2xl shadow-lg"
                          style={{
                            backgroundColor: `${sec.color}20`,
                            color: sec.color,
                            border: `1px solid ${sec.color}40`,
                          }}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase font-mono font-bold tracking-wider"
                          style={{
                            backgroundColor: `${sec.color}15`,
                            color: sec.color,
                            border: `1px solid ${sec.color}30`,
                          }}
                        >
                          {sec.badge}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-bold text-foreground">{sec.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{sec.description}</p>
                    </div>

                    <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-muted-foreground">
                      <span>Zero-Trust Protocol</span>
                      <span style={{ color: sec.color }}>Enforced</span>
                    </div>
                  </div>
                </Interactive3DCard>
              );
            })}
          </div>
        </section>

        {/* Security Highlights Banner */}
        <section className="py-20 bg-accent/20 border-y border-border/40 relative z-10">
          <div className="container max-w-5xl mx-auto">
            <div className="hologram-card rounded-3xl p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/10">
                  <div className="text-4xl font-black text-emerald-400">AES-256</div>
                  <p className="text-xs font-mono text-muted-foreground">Vector Data Encryption at Rest</p>
                </div>
                <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/10">
                  <div className="text-4xl font-black text-sky-400">100% GDPR</div>
                  <p className="text-xs font-mono text-muted-foreground">Candidate Data Privacy Compliance</p>
                </div>
                <div className="space-y-2 p-4 rounded-2xl bg-black/40 border border-white/10">
                  <div className="text-4xl font-black text-purple-400">SOC2 Type II</div>
                  <p className="text-xs font-mono text-muted-foreground">Enterprise Audit Preparedness</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 container text-center max-w-3xl mx-auto space-y-6 relative z-10">
          <h2 className="text-4xl font-extrabold tracking-tight">Secure Your Enterprise Recruitment Pipeline</h2>
          <p className="text-base text-muted-foreground">
            Deploy NEXHIRE AI with complete confidence in data privacy, encryption, and perimeter security.
          </p>
          <div className="pt-2">
            <Button size="lg" className="primary-button text-sm px-8 gap-2 shadow-xl shadow-blue-500/30" asChild>
              <Link href="/dashboard">
                <span>Access Secure Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <PremiumFooter />
    </div>
  );
}

