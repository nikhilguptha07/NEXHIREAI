'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  FileSearch,
  Sparkles,
  Sliders,
  BarChart3,
  BrainCircuit,
  ShieldCheck,
  Layers,
  Cpu,
  ArrowRight,
  Zap,
  Calendar,
  FileText,
  Box,
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

export default function FeaturesPage() {
  const FEATURES_LIST = [
    {
      icon: FileText,
      title: 'Resume Parsing Engine',
      description: 'Multi-column PDF, DOCX, and TXT parsing with layout-aware text extraction and section classification.',
      badge: 'Parsing',
      color: '#38bdf8',
    },
    {
      icon: FileSearch,
      title: 'ATS Formatting & Density Analysis',
      description: 'Mathematical evaluation of formatting quality, keyword density, section completeness, and project impact metrics.',
      badge: 'ATS Scoring',
      color: '#818cf8',
    },
    {
      icon: Sparkles,
      title: '20-Category Semantic Matcher',
      description: '6-dimensional vector similarity engine comparing candidates against structured job descriptions with skill alias normalization.',
      badge: 'Semantic Vector',
      color: '#a855f7',
    },
    {
      icon: Sliders,
      title: 'Multi-Factor Candidate Ranker',
      description: 'Weighted candidate scoring with a 7-level tie-breaking algorithm, shortlist filtering, and candidate pool statistics.',
      badge: 'Ranking Engine',
      color: '#ec4899',
    },
    {
      icon: BrainCircuit,
      title: 'AI Recruiter Intelligence',
      description: 'Generates skill maturity classifications, compensation estimates, offer acceptance probabilities, and recruiter notes.',
      badge: 'Recruiter AI',
      color: '#f43f5e',
    },
    {
      icon: Cpu,
      title: 'OCR Resume Scanner',
      description: 'Tesseract OCR fallback engine for processing scanned PDF documents and image-based candidate resumes.',
      badge: 'OCR Processing',
      color: '#fbbf24',
    },
    {
      icon: BarChart3,
      title: 'Recruitment Analytics Dashboard',
      description: 'Time-to-hire telemetry, candidate funnel conversion velocity, recruiter productivity metrics, and multi-chart dataset bundles.',
      badge: 'Analytics',
      color: '#34d399',
    },
    {
      icon: Calendar,
      title: 'Interactive Interview Engine',
      description: 'Dynamic question generation across 16 categories, candidate-tailored evaluation rubrics, and structured 6-phase interview plans.',
      badge: 'Interviewing',
      color: '#06b6d4',
    },
    {
      icon: Layers,
      title: 'Enterprise 3D Architecture',
      description: 'Built on Next.js 15, React 19, Java 21 Spring Boot, Three.js WebGL, and Oracle Database 23ai for bank-grade reliability.',
      badge: 'Architecture',
      color: '#6366f1',
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
            <Badge variant="outline" className="px-3.5 py-1 text-xs border-sky-500/40 text-sky-400 bg-sky-500/10">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Enterprise 3D Feature Suite
            </Badge>

            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight">
              Built for High-Growth <br />
              <span className="gradient-text">Talent Acquisition Teams</span>
            </h1>

            <p className="text-muted-foreground text-base md:text-xl max-w-2xl mx-auto">
              From intelligent spatial resume parsing to mathematical semantic vector matching and automated AI interview rubrics.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button size="lg" className="primary-button gap-2 text-sm px-7 shadow-xl shadow-blue-500/20" asChild>
                <Link href="/dashboard">
                  <span>Explore Live Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" className="glass text-sm px-7 border-purple-500/30 text-purple-300 hover:bg-purple-500/10" asChild>
                <Link href="/3d-experience">
                  <Box className="w-4 h-4 mr-1.5 text-purple-400" />
                  <span>3D Candidate Studio</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 container relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Comprehensive Capabilities</h2>
            <p className="text-base text-muted-foreground">
              Every tool engineered to eliminate manual screening, accelerate time-to-hire, and deliver objective candidate evaluations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES_LIST.map((feat) => {
              const Icon = feat.icon;
              return (
                <Interactive3DCard key={feat.title} maxTilt={14} depth={25} glowColor={`${feat.color}30`}>
                  <div className="hologram-card p-7 rounded-3xl h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div
                          className="p-3.5 rounded-2xl shadow-lg"
                          style={{
                            backgroundColor: `${feat.color}20`,
                            color: feat.color,
                            border: `1px solid ${feat.color}40`,
                          }}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase font-mono font-bold tracking-wider"
                          style={{
                            backgroundColor: `${feat.color}15`,
                            color: feat.color,
                            border: `1px solid ${feat.color}30`,
                          }}
                        >
                          {feat.badge}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-bold text-foreground">{feat.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
                    </div>

                    <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-muted-foreground">
                      <span>Telemetry Module</span>
                      <span style={{ color: feat.color }}>Enabled</span>
                    </div>
                  </div>
                </Interactive3DCard>
              );
            })}
          </div>
        </section>

        {/* Technical Demonstration Section */}
        <section className="py-20 bg-accent/20 border-y border-border/40 relative z-10">
          <div className="container max-w-5xl mx-auto space-y-8 text-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold">Spatial System Telemetry Preview</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Real-time vector matching interface designed for high-velocity talent organizations
              </p>
            </div>

            <div className="p-4 rounded-3xl hologram-card shadow-2xl">
              <div className="aspect-video w-full rounded-2xl bg-gradient-to-br from-purple-950/50 via-black to-blue-950/50 border border-white/10 flex flex-col items-center justify-center p-8 space-y-5 text-center">
                <div className="p-4 rounded-full bg-primary/20 border border-primary/40 text-primary animate-pulse shadow-[0_0_30px_rgba(56,189,248,0.5)]">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="font-extrabold text-2xl text-foreground">Interactive AI Match Telemetry Cockpit</h3>
                <p className="text-sm text-muted-foreground max-w-lg">
                  Parses candidate resumes in under 400ms, correlates multi-dimensional skill vectors against Oracle 23ai embeddings, and outputs exact candidate rank order.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Badge variant="outline" className="text-xs bg-sky-500/10 text-sky-400 border-sky-500/30">Next.js 15 App Router</Badge>
                  <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">Oracle 23ai 3D Vectors</Badge>
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Spring Boot Microservices</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 container text-center max-w-3xl mx-auto space-y-6 relative z-10">
          <h2 className="text-4xl font-extrabold tracking-tight">Ready to Elevate Your Hiring Pipeline?</h2>
          <p className="text-base text-muted-foreground">
            Join enterprise recruitment teams using NEXHIRE AI to screen candidates 10x faster.
          </p>
          <div className="pt-2">
            <Button size="lg" className="primary-button text-sm px-8 gap-2 shadow-xl shadow-blue-500/30" asChild>
              <Link href="/dashboard">
                <span>Get Started Now</span>
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

