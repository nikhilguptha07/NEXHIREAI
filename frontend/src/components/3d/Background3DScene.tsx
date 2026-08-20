'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

function FloatingParticleMesh({ count = 120 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { pointer } = useThree();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#38bdf8'),
      new THREE.Color('#818cf8'),
      new THREE.Color('#c084fc'),
      new THREE.Color('#34d399'),
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;

      const c = palette[Math.floor(Math.random() * palette.length)] ?? palette[0]!;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, col];
  }, [count]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = elapsed * 0.04 + pointer.x * 0.15;
      pointsRef.current.rotation.x = Math.sin(elapsed * 0.03) * 0.1 + pointer.y * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function Background3DScene({ className = 'absolute inset-0 pointer-events-none' }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ alpha: true, antialias: false, powerPreference: 'low-power' }}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.5} />
        <FloatingParticleMesh count={140} />
        <Stars radius={40} depth={30} count={1200} factor={3} fade speed={0.6} />
      </Canvas>
    </div>
  );
}
