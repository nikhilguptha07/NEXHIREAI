'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';

interface Experience3DCanvasProps {
  children: React.ReactNode;
  cameraPosition?: [number, number, number];
  fov?: number;
  className?: string;
}

export function Experience3DCanvas({
  children,
  cameraPosition = [0, 0, 6],
  fov = 45,
  className = 'w-full h-full min-h-[400px]',
}: Experience3DCanvasProps) {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: cameraPosition, fov }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        {children}
      </Canvas>
    </div>
  );
}
