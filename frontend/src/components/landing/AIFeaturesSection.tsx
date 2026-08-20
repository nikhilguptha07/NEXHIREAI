'use client';

import { motion } from 'framer-motion';
import { Bot, Search, ShieldCheck, Sparkles, Cpu, Layers, BarChart, Zap } from 'lucide-react';
import React from 'react';
import { Interactive3DCard } from '@/components/3d/Interactive3DCard';

const FEATURES = [
  {
    icon: Bot,
    title: 'AI Resume Intelligence',
    body: 'Structured parsing, skill extraction, and canonical profiles from any document format — powered by advanced LLMs.',
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.25)',
    badge: 'Vector OCR',
  },
  {
    icon: Search,
    title: 'Semantic Candidate Search',
    body: 'Find the right candidate with vector similarity over skills and experience, not just brittle keyword match.',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.25)',
    badge: 'Cosine Ranking',
  },
  {
    icon: Sparkles,
    title: 'Hybrid Multi-Vector Ranking',
    body: 'Combine semantic similarity with hard filters and custom business rules for fair, explainable shortlists.',
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.25)',
    badge: 'Zero-Bias',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Security & RBAC',
    body: 'Per-tenant isolation, JWT + OAuth2, RBAC, full audit trail, and zero-knowledge encryption at rest.',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.25)',
    badge: 'SOC2 Compliant',
  },
];

export function AIFeaturesSection() {
  return (
    <section
      id="ai"
      className="py-32 bg-background relative border-t border-border/40 overflow-hidden scroll-mt-24"
    >
      {/* 3D Grid Backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="grid-3d-backdrop absolute inset-0 h-[150%]" />
      </div>

      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Autonomous Intelligence Suite</span>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground"
          >
            Engineered for <span className="text-gradient">3D Recruitment Scale</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            A complete recruitment stack — from requisition ingestion to offer issuance — with spatial vector AI powering every milestone.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
            >
              <Interactive3DCard maxTilt={15} depth={30} glowColor={feature.glow}>
                <div className="hologram-card p-8 rounded-3xl group flex flex-col justify-between h-full min-h-[320px]">
                  <div className="flex flex-col items-start gap-4">
                    <div className="flex items-center justify-between w-full">
                      <div
                        className="p-3.5 rounded-2xl transition-all duration-300 group-hover:scale-110 shadow-lg"
                        style={{
                          backgroundColor: `${feature.color}20`,
                          color: feature.color,
                          boxShadow: `0 0 20px ${feature.color}30`,
                        }}
                      >
                        <feature.icon className="w-6 h-6" />
                      </div>

                      <span
                        className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border"
                        style={{
                          backgroundColor: `${feature.color}15`,
                          borderColor: `${feature.color}40`,
                          color: feature.color,
                        }}
                      >
                        {feature.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-foreground group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-sky-400 group-hover:to-purple-400 transition-all duration-300">
                      {feature.title}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.body}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                    <span>Spatial Vector Pipeline</span>
                    <span style={{ color: feature.color }}>Active →</span>
                  </div>
                </div>
              </Interactive3DCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}