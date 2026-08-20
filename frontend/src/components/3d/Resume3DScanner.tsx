'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface ExtractedTag {
  id: string;
  name: string;
  score: string;
  pos: [number, number, number];
  color: string;
}

const TAGS: ExtractedTag[] = [
  { id: '1', name: 'PyTorch / Vector Search', score: '98%', pos: [-2.2, 1.2, 0.5], color: '#38bdf8' },
  { id: '2', name: 'Distributed Systems', score: '95%', pos: [2.2, 1.0, 0.4], color: '#a855f7' },
  { id: '3', name: 'Oracle 26ai Vectors', score: '99%', pos: [-2.0, -1.0, 0.6], color: '#ec4899' },
  { id: '4', name: 'Zero-Bias Scoring', score: '100%', pos: [2.1, -1.1, 0.5], color: '#10b981' },
];

function ResumeScene() {
  const docGroupRef = useRef<THREE.Group>(null);
  const scanLaserRef = useRef<THREE.Mesh>(null);
  const coreGlowRef = useRef<THREE.Mesh>(null);

  // Generate constellation connection lines to tags
  const connectionLines = useMemo(() => {
    return TAGS.map((tag) => {
      const start = new THREE.Vector3(0, (tag.pos[1] * 0.5), 0.2);
      const end = new THREE.Vector3(...tag.pos);
      return [start, end] as [THREE.Vector3, THREE.Vector3];
    });
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (docGroupRef.current) {
      docGroupRef.current.rotation.y = Math.sin(t * 0.5) * 0.15;
      docGroupRef.current.rotation.x = Math.cos(t * 0.4) * 0.08;
    }

    if (scanLaserRef.current) {
      // Move scanning laser beam up and down across the document
      scanLaserRef.current.position.y = Math.sin(t * 2) * 1.6;
    }

    if (coreGlowRef.current) {
      coreGlowRef.current.rotation.z = t * 0.4;
      const s = 1 + Math.sin(t * 3) * 0.08;
      coreGlowRef.current.scale.set(s, s, s);
    }
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 8, 5]} intensity={1.8} color="#38bdf8" />
      <pointLight position={[-6, -4, 4]} intensity={1.5} color="#a855f7" />

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={1}>
        <group ref={docGroupRef}>
          {/* Main Holographic 3D Resume Slab */}
          <RoundedBox args={[2.2, 3.2, 0.08]} radius={0.08} smoothness={4} position={[0, 0, 0]}>
            <meshPhysicalMaterial
              color="#0d111c"
              emissive="#1e293b"
              emissiveIntensity={0.6}
              roughness={0.2}
              metalness={0.8}
              transparent
              opacity={0.88}
            />
          </RoundedBox>

          {/* Glowing Border Wireframe */}
          <RoundedBox args={[2.24, 3.24, 0.09]} radius={0.08} smoothness={4} position={[0, 0, 0]}>
            <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.35} />
          </RoundedBox>

          {/* Animated Laser Scanning Beam */}
          <mesh ref={scanLaserRef} position={[0, 0, 0.08]}>
            <planeGeometry args={[2.3, 0.06]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} side={THREE.DoubleSide} />
          </mesh>

          {/* Central AI Processor Emblem */}
          <mesh ref={coreGlowRef} position={[0, 0, 0.06]}>
            <ringGeometry args={[0.3, 0.38, 32]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>

          {/* Geometric Beam Lines */}
          {connectionLines.map((line, idx) => (
            <Line
              key={idx}
              points={line}
              color={TAGS[idx]?.color || '#38bdf8'}
              lineWidth={1.5}
              transparent
              opacity={0.6}
            />
          ))}

          {/* Extracted Floating Spatial 3D Badges */}
          {TAGS.map((tag) => (
            <group key={tag.id} position={tag.pos}>
              <mesh>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color={tag.color} emissive={tag.color} emissiveIntensity={1.2} />
              </mesh>

              <Html position={[0, 0.15, 0]} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
                <div
                  className="px-2.5 py-1 rounded-xl backdrop-blur-md border shadow-xl flex items-center gap-2 whitespace-nowrap text-xs font-semibold"
                  style={{
                    backgroundColor: 'rgba(10, 15, 29, 0.85)',
                    borderColor: tag.color,
                    boxShadow: `0 0 15px ${tag.color}40`,
                  }}
                >
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: tag.color }} />
                  <span className="text-white text-[11px]">{tag.name}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-black"
                    style={{ backgroundColor: `${tag.color}25`, color: tag.color }}
                  >
                    {tag.score}
                  </span>
                </div>
              </Html>
            </group>
          ))}
        </group>
      </Float>
    </>
  );
}

export function Resume3DScanner({ className = 'w-full h-[400px]' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <ResumeScene />
      </Canvas>
    </div>
  );
}
