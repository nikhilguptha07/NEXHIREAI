'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { FileText, Cpu, ListChecks, MessagesSquare, Award, CheckCircle, Sparkles } from 'lucide-react';
import { Interactive3DCard } from '@/components/3d/Interactive3DCard';

const STEPS = [
  { id: 'resume', icon: FileText, title: 'Resume Vectorization', desc: 'Candidates upload resumes. Our multi-vector OCR decomposes raw PDFs into semantic coordinate tensors.', color: '#38bdf8' },
  { id: 'ai', icon: Cpu, title: 'Neural Vector Matching', desc: 'Oracle 26ai vectors match candidate skill centroids against dynamic job embeddings at sub-second speeds.', color: '#818cf8' },
  { id: 'shortlist', icon: ListChecks, title: 'Zero-Bias Shortlisting', desc: 'Ranked candidate queues generated with anonymized demographic scoring and verifiable match weights.', color: '#a855f7' },
  { id: 'interview', icon: MessagesSquare, title: 'Autonomous Scheduling', desc: 'Smart calendar negotiation and live AI candidate briefing packs generated for interviewer panels.', color: '#ec4899' },
  { id: 'offer', icon: Award, title: 'Predictive Offer Matrix', desc: 'Market compensation curve modeling and candidate retention probability predictions for optimal closing.', color: '#f59e0b' },
  { id: 'hired', icon: CheckCircle, title: 'Zero-Friction Onboarding', desc: 'Automated document processing, background telemetry integration, and frictionless day-one setup.', color: '#10b981' },
];

export function HiringProcessSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section ref={containerRef} className="py-32 bg-background relative border-t border-border/40 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container relative z-10 max-w-5xl px-4 mx-auto">
        <div className="text-center mb-24 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Recruitment Pipeline</span>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground"
          >
            The 3D Pipeline <span className="text-gradient">Standard</span>
          </motion.h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            From requisition upload to offer acceptance in record velocity.
          </p>
        </div>

        <div className="relative">
          {/* Central Conduit Background */}
          <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-1.5 bg-border/60 -translate-x-1/2 rounded-full" />

          {/* Central Energy Conduit Fill */}
          <motion.div
            className="absolute left-[27px] md:left-1/2 top-0 w-1.5 bg-gradient-to-b from-sky-400 via-purple-500 to-emerald-400 -translate-x-1/2 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.6)]"
            style={{ height: lineHeight }}
          />

          {/* Steps with 3D Orbital Nodes */}
          <div className="flex flex-col gap-16 md:gap-24 relative z-10">
            {STEPS.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={step.id} className={`flex items-center w-full ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  {/* Empty space for alternating layout on desktop */}
                  <div className="hidden md:block md:w-1/2" />

                  {/* 3D Spatial Node Marker */}
                  <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-black/90 border-2 border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.35)] z-20 group">
                    <div
                      className="absolute inset-0 rounded-full border border-dashed animate-[spin_8s_linear_infinite]"
                      style={{ borderColor: step.color }}
                    />
                    <step.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-125" style={{ color: step.color }} />
                  </div>

                  {/* 3D Interactive Card */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`ml-20 md:ml-0 md:w-1/2 flex flex-col ${isEven ? 'md:items-start md:pl-16' : 'md:items-end md:pr-16 text-left md:text-right'}`}
                  >
                    <Interactive3DCard maxTilt={12} depth={25} glowColor={`${step.color}35`} className="max-w-md">
                      <div className="hologram-card p-6 rounded-2xl flex flex-col gap-2.5">
                        <div className={`flex items-center gap-2 ${isEven ? 'md:justify-start' : 'md:justify-end'}`}>
                          <span
                            className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border uppercase"
                            style={{
                              backgroundColor: `${step.color}15`,
                              borderColor: `${step.color}40`,
                              color: step.color,
                            }}
                          >
                            Stage 0{index + 1}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                        <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{step.desc}</p>
                      </div>
                    </Interactive3DCard>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

