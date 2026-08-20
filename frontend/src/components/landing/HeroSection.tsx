'use client';

import dynamic from 'next/dynamic';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, ShieldCheck, Cpu } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const GlobeCanvas = dynamic(() => import('./GlobeCanvas'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-background" />
  ),
});

export function HeroSection() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const heroRotateX = useTransform(smoothMouseY, [-0.5, 0.5], ['10deg', '-10deg']);
  const heroRotateY = useTransform(smoothMouseX, [-0.5, 0.5], ['-10deg', '10deg']);

  const floatingCard1X = useTransform(smoothMouseX, [-0.5, 0.5], ['-35px', '35px']);
  const floatingCard1Y = useTransform(smoothMouseY, [-0.5, 0.5], ['-25px', '25px']);

  const floatingCard2X = useTransform(smoothMouseX, [-0.5, 0.5], ['35px', '-35px']);
  const floatingCard2Y = useTransform(smoothMouseY, [-0.5, 0.5], ['25px', '-25px']);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { innerWidth, innerHeight } = window;
    mouseX.set(e.clientX / innerWidth - 0.5);
    mouseY.set(e.clientY / innerHeight - 0.5);
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative flex min-h-[92vh] w-full items-center justify-center overflow-hidden bg-background preserve-3d"
      style={{ perspective: 1200 }}
    >
      {/* 3D Background Three.js Scene */}
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
        <GlobeCanvas />
      </div>

      {/* 3D Grid Plane Perspective in Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="grid-3d-backdrop absolute inset-0 h-[140%]" />
      </div>

      {/* Radial Gradient Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/20 via-transparent to-background pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      {/* Floating 3D Metric Hologram Card - Left */}
      <motion.div
        style={{
          x: floatingCard1X,
          y: floatingCard1Y,
          transformStyle: 'preserve-3d',
        }}
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="hidden xl:flex absolute left-8 top-1/3 z-20 hologram-card p-4 rounded-2xl flex-col gap-2 max-w-xs animate-float-3d"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-sky-400 tracking-wider uppercase">Neural Matching</div>
            <div className="text-sm font-extrabold text-foreground">99.4% Precision</div>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground leading-tight">
          Spatial 3D vector embeddings scored over 1,000+ domain dimensions.
        </p>
      </motion.div>

      {/* Floating 3D Metric Hologram Card - Right */}
      <motion.div
        style={{
          x: floatingCard2X,
          y: floatingCard2Y,
          transformStyle: 'preserve-3d',
        }}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="hidden xl:flex absolute right-8 bottom-1/3 z-20 hologram-card p-4 rounded-2xl flex-col gap-2 max-w-xs animate-float-3d"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-purple-400 tracking-wider uppercase">Autonomous ATS</div>
            <div className="text-sm font-extrabold text-foreground">Zero-Bias Architecture</div>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground leading-tight">
          Blind candidate matching removing demographic bias automatically.
        </p>
      </motion.div>

      {/* Central 3D Interactive Container */}
      <motion.div
        style={{
          rotateX: heroRotateX,
          rotateY: heroRotateY,
          transformStyle: 'preserve-3d',
        }}
        className="container relative z-20 flex flex-col items-center px-4 text-center my-auto py-16"
      >
        {/* Floating 3D Badge */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ transform: 'translateZ(60px)' }}
          className="glass mb-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 border border-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.25)] backdrop-blur-xl"
        >
          <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
          <span className="text-xs md:text-sm font-semibold text-foreground/90">
            Next-Gen 3D Vector AI Recruitment Platform
          </span>
        </motion.div>

        {/* 3D Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{ transform: 'translateZ(80px)' }}
          className="mb-6 text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-8xl"
        >
          Hire the <span className="gradient-text">Future</span>
          <br />
          in 3D Spatial AI
        </motion.h1>

        {/* 3D Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ transform: 'translateZ(45px)' }}
          className="mb-12 max-w-3xl text-base text-muted-foreground sm:text-lg md:text-2xl"
        >
          NEXHIRE AI unifies intelligent neural parsing, multi-dimensional candidate vector ranking,
          and predictive talent analytics into one premium recruitment ecosystem.
        </motion.p>

        {/* 3D Action Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          style={{ transform: 'translateZ(60px)' }}
          className="flex flex-col gap-4 sm:flex-row items-center justify-center w-full max-w-md"
        >
          <Link
            href="/register"
            className="primary-button inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 w-full sm:w-auto"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/3d-experience"
            className="secondary-button inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold border border-purple-500/40 hover:border-purple-400 text-purple-300 bg-purple-500/10 backdrop-blur-md shadow-lg shadow-purple-500/20 hover:shadow-purple-500/35 w-full sm:w-auto"
          >
            <Cpu className="h-4 w-4 text-purple-400" />
            <span>Launch 3D Studio</span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest"
      >
        <span>Scroll to Explore</span>
        <div className="h-10 w-0.5 bg-gradient-to-b from-sky-400 via-purple-500 to-transparent animate-pulse" />
      </motion.div>
    </section>
  );
}