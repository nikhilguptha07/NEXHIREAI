'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Database, Cpu, CheckCircle2, FileText, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { Interactive3DCard } from '@/components/3d/Interactive3DCard';

const Resume3DScanner = dynamic(
  () => import('@/components/3d/Resume3DScanner').then((mod) => mod.Resume3DScanner),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] w-full flex items-center justify-center bg-black/40 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 text-sky-400 font-mono text-sm animate-pulse">
          <Cpu className="w-5 h-5 animate-spin" />
          <span>Initializing 3D Neural Scanner...</span>
        </div>
      </div>
    ),
  }
);

export function ResumeScannerSection() {
  return (
    <section
      id="features"
      className="relative min-h-[100vh] bg-background py-28 flex flex-col items-center border-t border-border/40 scroll-mt-24 overflow-hidden"
    >
      {/* 3D Background Glows */}
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 max-w-6xl px-4 mx-auto flex flex-col items-center">
        {/* Section Title */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Vector 3D Neural OCR Engine</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Neural 3D Resume <span className="text-gradient">Deconstruction</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI engine renders resumes as spatial coordinate graphs, decomposing raw unstructured PDF/DOCX
            documents into verifiable competency vectors in real time.
          </p>
        </div>

        {/* 3D Interactive Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-center">
          {/* Main 3D WebGL Scanner Viewport (7 Cols) */}
          <div className="lg:col-span-7 relative">
            <div className="hologram-card rounded-3xl p-4 md:p-6 overflow-hidden border border-sky-500/30 shadow-[0_0_50px_rgba(56,189,248,0.15)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-foreground font-semibold">WebGL 3D Laser Spectrometry</span>
                </div>
                <span className="text-sky-400">Target: Vector Cluster 26ai</span>
              </div>

              {/* 3D WebGL Canvas */}
              <Resume3DScanner className="w-full h-[380px] md:h-[430px]" />

              <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-muted-foreground border-t border-white/10 pt-3">
                <span>Spatial Parsing Depth: 1,024 Dim</span>
                <span className="text-emerald-400">Latency: 142ms</span>
              </div>
            </div>
          </div>

          {/* Right 3D Telemetry Feature Cards (5 Cols) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {[
              {
                icon: Database,
                title: 'Structured Skill Taxonomy',
                desc: 'Maps colloquial experience into normalized ontology nodes across 40,000+ technical skill trees.',
                glow: 'rgba(56, 189, 248, 0.3)',
                badge: 'Vector Ontology',
              },
              {
                icon: Cpu,
                title: 'Semantic Vector Extraction',
                desc: 'Encodes candidate work history into dense embeddings ready for cosine similarity queries.',
                glow: 'rgba(168, 85, 247, 0.3)',
                badge: '1,536-Dim Embeddings',
              },
              {
                icon: ShieldCheck,
                title: 'Anti-Hallucination Verification',
                desc: 'Cross-verifies extracted timelines, certifications, and technical accomplishments with deterministic checks.',
                glow: 'rgba(236, 72, 153, 0.3)',
                badge: '100% Deterministic',
              },
              {
                icon: Layers,
                title: 'Instant Canonical Profiles',
                desc: 'Produces anonymized, standardized executive summaries for hiring committees and technical leads.',
                glow: 'rgba(16, 185, 129, 0.3)',
                badge: 'Real-time JSON',
              },
            ].map((item, i) => (
              <Interactive3DCard key={i} maxTilt={10} depth={20} glowColor={item.glow}>
                <div className="hologram-card p-5 rounded-2xl flex flex-col gap-2.5 h-full">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </Interactive3DCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}