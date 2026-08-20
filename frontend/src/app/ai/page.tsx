'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  BrainCircuit,
  Sparkles,
  Sliders,
  TrendingUp,
  HelpCircle,
  MessageSquare,
  Cpu,
  ArrowRight,
  Zap,
  CheckCircle2,
  GitBranch,
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

export default function AIPage() {
  const AI_CAPABILITIES = [
    {
      icon: BrainCircuit,
      title: 'AI Resume Vector Analysis',
      description: 'Neural text extraction, section classification, font consistency validation, and skill maturity indexing.',
      badge: 'Neural NLP',
      color: '#38bdf8',
    },
    {
      icon: Sliders,
      title: 'AI Multi-Vector Ranking',
      description: 'Multi-vector candidate ranking powered by Oracle 23ai AI Vector Search with 7-level tie-breaking.',
      badge: 'Vector Ranking',
      color: '#818cf8',
    },
    {
      icon: Sparkles,
      title: '3D Semantic Match Engine',
      description: '6-dimensional semantic similarity engine calculating exact 0-100% candidate-job match percentages.',
      badge: 'Semantic Similarity',
      color: '#a855f7',
    },
    {
      icon: TrendingUp,
      title: 'Hiring & Offer Prediction',
      description: 'Mathematical offer acceptance probabilities, candidate retention telemetry, and risk matrix scoring.',
      badge: 'Predictive ML',
      color: '#ec4899',
    },
    {
      icon: HelpCircle,
      title: 'Dynamic Interview Rubrics',
      description: 'Automated generation of candidate-tailored technical, coding, system design, and behavioral question rubrics.',
      badge: 'Question Engine',
      color: '#f43f5e',
    },
    {
      icon: CheckCircle2,
      title: 'Resume Improvement Matrix',
      description: 'Actionable ATS formatting advice, keyword coverage gap analysis, and bullet point impact metrics.',
      badge: 'ATS Feedback',
      color: '#fbbf24',
    },
    {
      icon: MessageSquare,
      title: 'AI Recruiter Copilot',
      description: 'Natural language recruiter assistant for candidate querying, talent pool search, and executive reporting.',
      badge: 'AI Assistant',
      color: '#34d399',
    },
    {
      icon: GitBranch,
      title: 'Machine Learning Pipeline',
      description: 'OCR processing → Text Vectorization → ATS Scoring → Semantic Cosine Match → Multi-Factor Ranking.',
      badge: 'ML Pipeline',
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
            <Badge variant="outline" className="px-3.5 py-1 text-xs border-purple-500/40 text-purple-400 bg-purple-500/10">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Spatial Vector AI Architecture
            </Badge>

            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight">
              Mathematical Candidate Matching <br />
              <span className="gradient-text">& Zero-Bias Spatial AI</span>
            </h1>

            <p className="text-muted-foreground text-base md:text-xl max-w-2xl mx-auto">
              NEXHIRE AI replaces subjective guesswork with multi-vector semantic embeddings, skill gap calculations, and predictive hiring telemetry.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button size="lg" className="primary-button gap-2 text-sm px-7 shadow-xl shadow-blue-500/20" asChild>
                <Link href="/3d-experience">
                  <Box className="w-4 h-4 mr-1.5" />
                  <span>Launch 3D Candidate Studio</span>
                </Link>
              </Button>

              <Button size="lg" variant="outline" className="glass text-sm px-7 border-purple-500/30 text-purple-300 hover:bg-purple-500/10" asChild>
                <Link href="/dashboard/ai/resume-ranking">
                  <span>Candidate Vector Ranking</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* AI Capabilities Grid */}
        <section className="py-24 container relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-3">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">AI & Machine Learning Capabilities</h2>
            <p className="text-base text-muted-foreground">
              Built with mathematical scoring models to ensure complete accuracy, zero placeholders, and objective candidate evaluations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {AI_CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <Interactive3DCard key={cap.title} maxTilt={14} depth={25} glowColor={`${cap.color}30`}>
                  <div className="hologram-card p-6 rounded-3xl h-full flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div
                          className="p-3 rounded-2xl shadow-md"
                          style={{
                            backgroundColor: `${cap.color}20`,
                            color: cap.color,
                            border: `1px solid ${cap.color}40`,
                          }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase font-mono font-bold tracking-wider"
                          style={{
                            backgroundColor: `${cap.color}15`,
                            color: cap.color,
                            border: `1px solid ${cap.color}30`,
                          }}
                        >
                          {cap.badge}
                        </Badge>
                      </div>

                      <h3 className="text-base font-bold text-foreground">{cap.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{cap.description}</p>
                    </div>

                    <div className="pt-3 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                      <span>Inference Engine</span>
                      <span style={{ color: cap.color }}>Online</span>
                    </div>
                  </div>
                </Interactive3DCard>
              );
            })}
          </div>
        </section>

        {/* AI Machine Learning Architecture Flowchart Diagram */}
        <section className="py-20 bg-accent/20 border-y border-border/40 relative z-10">
          <div className="container max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl md:text-4xl font-extrabold">End-to-End 3D AI Pipeline Architecture</h2>
              <p className="text-sm text-muted-foreground">
                How NEXHIRE AI processes raw candidate documents into actionable spatial vector intelligence
              </p>
            </div>

            {/* Architecture Diagram Card */}
            <div className="hologram-card rounded-3xl p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center text-center">
                <Interactive3DCard maxTilt={10} depth={20} glowColor="rgba(56, 189, 248, 0.3)">
                  <div className="p-5 rounded-2xl bg-black/50 border border-sky-500/30 space-y-2">
                    <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 w-fit mx-auto shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                      <Cpu className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold text-sm">1. Multi-Vector Ingestion</h4>
                    <p className="text-xs text-muted-foreground">PDF / DOCX / Image OCR</p>
                  </div>
                </Interactive3DCard>

                <div className="hidden md:flex justify-center text-sky-400 animate-pulse">
                  <ArrowRight className="h-6 w-6" />
                </div>

                <Interactive3DCard maxTilt={10} depth={20} glowColor="rgba(168, 85, 247, 0.3)">
                  <div className="p-5 rounded-2xl bg-black/50 border border-purple-500/30 space-y-2">
                    <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 w-fit mx-auto shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                      <BrainCircuit className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold text-sm">2. Neural Decomposition</h4>
                    <p className="text-xs text-muted-foreground">20-Category Taxonomy</p>
                  </div>
                </Interactive3DCard>

                <div className="hidden md:flex justify-center text-purple-400 animate-pulse">
                  <ArrowRight className="h-6 w-6" />
                </div>

                <Interactive3DCard maxTilt={10} depth={20} glowColor="rgba(16, 185, 129, 0.3)">
                  <div className="p-5 rounded-2xl bg-black/50 border border-emerald-500/30 space-y-2">
                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 w-fit mx-auto shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold text-sm">3. Spatial 3D Matching</h4>
                    <p className="text-xs text-muted-foreground">Oracle 23ai AI Vectors</p>
                  </div>
                </Interactive3DCard>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10 flex flex-wrap justify-between items-center text-xs font-mono text-muted-foreground gap-4">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Deterministic Scoring Engine
                </span>
                <span>Zero Hallucinated Metrics</span>
                <span className="text-sky-400">Strict Sub-Second Latency</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 container text-center max-w-3xl mx-auto space-y-6 relative z-10">
          <h2 className="text-4xl font-extrabold tracking-tight">Experience AI-Native Hiring Today</h2>
          <p className="text-base text-muted-foreground">
            Test candidate resumes against our 20-category semantic match engine in spatial 3D coordinate space.
          </p>
          <div className="pt-2">
            <Button size="lg" className="primary-button text-sm px-8 gap-2 shadow-xl shadow-blue-500/30" asChild>
              <Link href="/3d-experience">
                <span>Explore 3D Studio</span>
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

