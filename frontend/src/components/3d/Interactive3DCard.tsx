'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  depth?: number;
  glowColor?: string;
  onClick?: () => void;
}

export function Interactive3DCard({
  children,
  className = '',
  maxTilt = 15,
  depth = 30,
  glowColor = 'rgba(56, 189, 248, 0.25)',
  onClick,
}: Interactive3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [`${maxTilt}deg`, `-${maxTilt}deg`]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [`-${maxTilt}deg`, `${maxTilt}deg`]);
  const glareX = useTransform(smoothMouseX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(smoothMouseY, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
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
    <div
      style={{ perspective: 1200 }}
      className="w-full h-full"
      onClick={onClick}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className={`relative w-full h-full rounded-2xl transition-shadow duration-300 ${className}`}
      >
        {/* Dynamic Specular Glare Reflection */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
          style={{
            background: `radial-gradient(circle 300px at ${glareX} ${glareY}, ${glowColor}, transparent 70%)`,
          }}
        />

        {/* Content with 3D Z Depth */}
        <div
          style={{
            transform: `translateZ(${depth}px)`,
            transformStyle: 'preserve-3d',
          }}
          className="relative z-10 w-full h-full"
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
