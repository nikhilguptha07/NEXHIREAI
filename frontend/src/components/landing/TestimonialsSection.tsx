'use client';

import { motion } from 'framer-motion';
import { Sparkles, Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: "NEXHIRE AI reduced our time-to-hire by 64%. The multi-dimensional spatial vector matching is eerily precise.",
    author: "Dr. Sarah Jenkins",
    role: "VP of Talent Acquisition, CloudScale Corp",
    avatar: "SJ",
    color: "#38bdf8",
  },
  {
    quote: "We parsed over 25,000 engineering resumes in seconds and pinpointed our principal systems architect on day one.",
    author: "Michael Chen",
    role: "Head of Technical Recruiting, GlobalFlow",
    avatar: "MC",
    color: "#a855f7",
  },
  {
    quote: "The most stunning, high-performance ATS cockpit in enterprise tech. It feels like software engineered from 2030.",
    author: "Elena Rodriguez",
    role: "Chief People Officer, Nexus Dynamics",
    avatar: "ER",
    color: "#ec4899",
  },
  {
    quote: "Oracle 26ai vector search coupled with zero-bias scoring makes compliance reviews seamless and bulletproof.",
    author: "David Kwon",
    role: "Chief Technology Officer, FinTrust AI",
    avatar: "DK",
    color: "#10b981",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-32 bg-background relative border-t border-border/40 overflow-hidden">
      {/* 3D Background Glows */}
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Proven Enterprise Impact</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Trusted by Talent <span className="text-gradient">Visionaries</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            See how forward-thinking talent organizations transform hiring velocity with spatial vector AI.
          </p>
        </div>

        {/* 3D Infinite Marquee Carousel */}
        <div className="relative flex overflow-x-hidden group py-4" style={{ perspective: 1000 }}>
          <motion.div
            className="flex gap-6 whitespace-nowrap px-4"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 35, ease: 'linear', repeat: Infinity }}
          >
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div
                key={i}
                className="w-[420px] shrink-0 hologram-card p-8 rounded-3xl whitespace-normal transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(56,189,248,0.25)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          className="w-4 h-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-white/20" />
                  </div>

                  <p className="text-base text-foreground/90 mb-8 leading-relaxed font-medium">
                    "{t.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3.5 pt-4 border-t border-white/10">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md"
                    style={{ backgroundColor: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40` }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-foreground">{t.author}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Gradients to fade carousel edges smoothly */}
          <div className="absolute inset-y-0 left-0 w-36 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-36 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

