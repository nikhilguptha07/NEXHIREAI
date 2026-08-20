'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { BarChart3, Users, Clock, ArrowUpRight, Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react';
import React, { useRef } from 'react';

export function DashboardPreviewSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 180 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], ['14deg', '-14deg']);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], ['-14deg', '14deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      id="security"
      className="py-32 bg-background relative border-t border-border/40 overflow-hidden scroll-mt-24"
    >
      {/* 3D Grid Backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-25">
        <div className="grid-3d-backdrop absolute inset-0 h-[150%]" />
      </div>

      <div className="container relative z-10 px-4 mx-auto">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Interactive 3D Control Center</span>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground"
          >
            Spatial Intelligence at a <span className="text-gradient">Glance</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Hover and rotate the recruiter cockpit. Real-time telemetry, automated pipelines, and spatial vector candidate queues.
          </motion.p>
        </div>

        {/* 3D Isometric Interactive Viewport */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ perspective: 1400 }}
          className="relative mx-auto max-w-5xl py-8 cursor-grab active:cursor-grabbing"
        >
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl border border-sky-500/30 bg-card/90 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-2xl overflow-visible"
          >
            {/* Top Chrome Bar */}
            <div className="h-12 border-b border-border/40 flex items-center justify-between px-6 bg-muted/40 rounded-t-3xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-sm" />
                <span className="ml-3 text-xs font-mono text-muted-foreground">nexhire-ai://cockpit.vector.3d</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span>3D Stream Live</span>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gradient-to-b from-background/40 to-background/80 rounded-b-3xl">
              {/* Stats Cards with translateZ popping */}
              <div
                className="col-span-1 md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4"
                style={{ transform: 'translateZ(30px)' }}
              >
                {[
                  { label: 'Vector Candidates', value: '2,840', icon: Users, trend: '+24% this week', color: '#38bdf8' },
                  { label: 'Avg Time to Shortlist', value: '4.2 Hrs', icon: Clock, trend: '-68% vs ATS baseline', color: '#a855f7' },
                  { label: 'Neural Match Accuracy', value: '98.7%', icon: BarChart3, trend: '+4.2% model gain', color: '#10b981' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.03, zIndex: 20 }}
                    className="p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md flex flex-col gap-2 shadow-lg"
                  >
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span className="text-xs font-semibold">{stat.label}</span>
                      <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                    </div>
                    <div className="text-3xl font-black text-foreground">{stat.value}</div>
                    <div className="text-xs font-semibold flex items-center gap-1" style={{ color: stat.color }}>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      {stat.trend}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Chart Mockup with translateZ */}
              <div
                className="col-span-1 md:col-span-2 h-72 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6 flex flex-col justify-between"
                style={{ transform: 'translateZ(40px)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-foreground">Spatial Hiring Velocity</div>
                    <div className="text-xs text-muted-foreground">Requisitions analyzed across multi-tenant vector stores</div>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
                    Real-time
                  </span>
                </div>

                <div className="flex-1 flex items-end gap-3 pt-6">
                  {[45, 65, 50, 92, 60, 98, 85, 70, 88].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                        className="w-full rounded-t-lg bg-gradient-to-t from-sky-500 via-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 shadow-md group-hover:shadow-[0_0_15px_rgba(56,189,248,0.5)] transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Mockup with translateZ */}
              <div
                className="col-span-1 h-72 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6 flex flex-col justify-between"
                style={{ transform: 'translateZ(50px)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-foreground">Top Vector Matches</div>
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>

                <div className="space-y-2.5">
                  {[
                    { name: 'Dr. Sarah Jenkins', role: 'Staff ML Engineer', score: '99.4%', color: '#38bdf8' },
                    { name: 'Michael Vance', role: 'Distributed Systems Architect', score: '97.2%', color: '#a855f7' },
                    { name: 'Elena Rostova', role: 'Principal AI Researcher', score: '95.8%', color: '#ec4899' },
                  ].map((match, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-sky-500/40 transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-foreground">{match.name}</div>
                        <div className="text-[10px] text-muted-foreground">{match.role}</div>
                      </div>
                      <div
                        className="text-xs font-black px-2 py-1 rounded-lg"
                        style={{ backgroundColor: `${match.color}20`, color: match.color }}
                      >
                        {match.score}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ranked via Oracle 26ai vectors</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3D Dashboard Ambient Outer Aura */}
          <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl opacity-40 -z-10 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

