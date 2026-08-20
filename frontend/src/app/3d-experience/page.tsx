'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { SiteHeader } from '@/components/layout/site-header';
import { PremiumFooter } from '@/components/landing/PremiumFooter';
import { CandidateVector3D } from '@/app/api/3d/vector-stream/route';
import {
  Sparkles,
  Box,
  Layers,
  Activity,
  UserCheck,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Interactive3DCard } from '@/components/3d/Interactive3DCard';

// Dynamic client-side import for 3D web canvases to prevent SSR issues
const InteractiveNeuralSphere = dynamic(
  () => import('@/components/3d/InteractiveNeuralSphere').then((mod) => mod.InteractiveNeuralSphere),
  { ssr: false }
);

const Candidate3DRadar = dynamic(
  () => import('@/components/3d/Candidate3DRadar').then((mod) => mod.Candidate3DRadar),
  { ssr: false }
);

const Experience3DCanvas = dynamic(
  () => import('@/components/3d/Experience3DCanvas').then((mod) => mod.Experience3DCanvas),
  { ssr: false }
);

const Background3DScene = dynamic(
  () => import('@/components/3d/Background3DScene').then((mod) => mod.Background3DScene),
  { ssr: false }
);

export default function ThreeDExperiencePage() {
  const [activeTab, setActiveTab] = useState<'neural-sphere' | 'vector-radar'>('vector-radar');
  const [candidates, setCandidates] = useState<CandidateVector3D[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateVector3D | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch real-time vector telemetry from Node.js API
  const fetchTelemetry = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/3d/vector-stream');
      const data = await res.json();
      if (data.success && data.data) {
        setCandidates(data.data);
        setSelectedCandidate(data.data[0] || null);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Failed to stream 3D vector data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30 relative">
      <SiteHeader />

      <main className="flex-1 container py-8 md:py-12 space-y-8 relative z-10">
        {/* Ambient 3D Particle Background */}
        <Background3DScene className="fixed inset-0 pointer-events-none z-0 opacity-40" />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/40 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1 text-xs border-purple-500/40 text-purple-400 bg-purple-500/10">
                <Sparkles className="w-3 h-3 mr-1 text-purple-400" />
                WebGL 3D Studio
              </Badge>
              <Badge variant="secondary" className="text-xs">
                React 19 + Three.js + Node.js
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Interactive 3D Candidate & Skill Matrix
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Real-time multi-dimensional vector visualization rendering candidate skills, domain experience, and match scores in spatial 3D coordinate space.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTelemetry}
              disabled={isLoading}
              className="gap-2 glass"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Stream</span>
            </Button>

            <Link href="/dashboard/ai/resume-ranking">
              <Button size="sm" className="primary-button gap-2">
                <span>View Full Ranking</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 3D Visualizer Mode Selector */}
        <div className="flex items-center justify-between gap-4 flex-wrap relative z-10">
          <div className="inline-flex p-1.5 rounded-xl bg-accent/40 border border-white/10 gap-2">
            <button
              onClick={() => setActiveTab('vector-radar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'vector-radar'
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>3D Spatial Vector Radar</span>
            </button>

            <button
              onClick={() => setActiveTab('neural-sphere')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'neural-sphere'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>3D Skill Neural Core</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Node.js Telemetry Stream
            </span>
            {lastUpdated && <span>Updated: {lastUpdated}</span>}
          </div>
        </div>

        {/* Main 3D Canvas Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* Left / Main 3D Viewport (2 Columns) */}
          <div className="lg:col-span-2 relative min-h-[560px] rounded-3xl border border-sky-500/30 bg-black/85 overflow-hidden shadow-2xl flex flex-col">
            {/* Viewport Overlay Controls */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-mono text-sky-400 border border-white/10 flex items-center gap-1.5 shadow-lg">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {activeTab === 'vector-radar' ? 'OrbitControls: Drag to rotate | Scroll to zoom | Click node to inspect' : 'Mouse Parallax: Active | Hover node'}
              </span>
            </div>

            {/* Render 3D Canvas based on active tab */}
            <div className="w-full h-full flex-1">
              <Experience3DCanvas className="w-full h-[560px]" cameraPosition={activeTab === 'vector-radar' ? [6, 4, 8] : [0, 0, 6]}>
                {activeTab === 'vector-radar' ? (
                  <Candidate3DRadar
                    candidates={candidates}
                    onSelectCandidate={(cand) => setSelectedCandidate(cand)}
                  />
                ) : (
                  <InteractiveNeuralSphere />
                )}
              </Experience3DCanvas>
            </div>
          </div>

          {/* Right Sidebar: Real-Time Telemetry & Selected Candidate Specs */}
          <div className="space-y-6">
            {/* Candidate Specs Card */}
            <Interactive3DCard maxTilt={10} depth={20} glowColor="rgba(56, 189, 248, 0.3)">
              <div className="hologram-card p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-sky-400" />
                    Selected Candidate Vector
                  </h3>
                  <Badge variant="outline" className="text-[10px] uppercase border-sky-500/40 text-sky-400">
                    Spatial Node
                  </Badge>
                </div>

                {selectedCandidate ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-extrabold text-foreground">{selectedCandidate.name}</h4>
                        <span className="text-sm font-black text-sky-400">{selectedCandidate.matchScore}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{selectedCandidate.role}</p>
                    </div>

                    {/* Vector Coordinates Breakdown */}
                    <div className="p-3 rounded-xl bg-accent/30 border border-white/10 space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-muted-foreground">
                        <span>X (Skill Depth):</span>
                        <span className="text-emerald-400">{selectedCandidate.position[0]}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Y (Experience Level):</span>
                        <span className="text-sky-400">{selectedCandidate.position[1]}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Z (Domain Alignment):</span>
                        <span className="text-purple-400">{selectedCandidate.position[2]}</span>
                      </div>
                    </div>

                    {/* Skills list */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-muted-foreground">Skill Vector Badges:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCandidate.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/30">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    Click any node in the 3D space to inspect candidate details.
                  </div>
                )}
              </div>
            </Interactive3DCard>

            {/* Node.js Backend Telemetry Card */}
            <Interactive3DCard maxTilt={10} depth={20} glowColor="rgba(168, 85, 247, 0.3)">
              <div className="hologram-card p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold border-b border-border/40 pb-3">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>Node.js Live Telemetry Stats</span>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Active Spatial Nodes:</span>
                    <span className="font-bold text-foreground">{candidates.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Vector Dimensions:</span>
                    <span className="font-bold text-foreground">3D Coordinate</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Rendering Engine:</span>
                    <span className="font-bold text-sky-400">Three.js / R3F</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Backend API:</span>
                    <span className="font-bold text-emerald-400">Next.js / Node.js Route</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Zero-bias spatial vector candidate ranking
                </div>
              </div>
            </Interactive3DCard>
          </div>
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
}

