'use client';

import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line, Grid, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { CandidateVector3D } from '@/app/api/3d/vector-stream/route';

interface Candidate3DRadarProps {
  candidates: CandidateVector3D[];
  onSelectCandidate?: (candidate: CandidateVector3D) => void;
}

export function Candidate3DRadar({ candidates, onSelectCandidate }: Candidate3DRadarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [selectedId, setSelectedId] = useState<string | null>(candidates[0]?.id || null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useFrame(({ clock }) => {
    if (groupRef.current && !selectedId) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#38bdf8" />
      <pointLight position={[-10, -10, -10]} intensity={1.5} color="#a855f7" />

      {/* Camera Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        maxDistance={12}
        minDistance={3}
        autoRotate={false}
      />

      <group ref={groupRef}>
        {/* 3D Coordinate Grid */}
        <Grid
          args={[10, 10]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#334155"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#38bdf8"
          fadeDistance={15}
          position={[0, -2, 0]}
        />

        {/* Origin Marker */}
        <mesh position={[0, 0, 0]}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshBasicMaterial color="#a855f7" wireframe />
        </mesh>

        {/* Render Candidate Vectors */}
        {candidates.map((cand) => {
          const isSelected = selectedId === cand.id;
          const isHovered = hoveredId === cand.id;

          const color =
            cand.status === 'top-match'
              ? '#38bdf8'
              : cand.status === 'strong'
              ? '#a855f7'
              : '#f43f5e';

          const origin = new THREE.Vector3(0, 0, 0);
          const target = new THREE.Vector3(...cand.position);

          return (
            <group key={cand.id}>
              {/* Vector Beam from Center to Candidate Position */}
              <Line
                points={[origin, target]}
                color={color}
                lineWidth={isSelected || isHovered ? 2.5 : 1}
                transparent
                opacity={isSelected || isHovered ? 0.9 : 0.4}
              />

              {/* 3D Node Marker */}
              <mesh
                position={cand.position}
                onClick={() => {
                  setSelectedId(cand.id);
                  onSelectCandidate?.(cand);
                }}
                onPointerOver={() => setHoveredId(cand.id)}
                onPointerOut={() => setHoveredId(null)}
              >
                <sphereGeometry args={[isSelected ? 0.35 : isHovered ? 0.28 : 0.22, 32, 32]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={isSelected ? 1.2 : isHovered ? 0.8 : 0.4}
                  roughness={0.2}
                />
              </mesh>

              {/* Pulsing Outer Halo for Selected Node */}
              {isSelected && (
                <Sphere position={cand.position} args={[0.5, 16, 16]}>
                  <meshBasicMaterial color={color} transparent opacity={0.25} wireframe />
                </Sphere>
              )}

              {/* Interactive HTML Card attached to 3D position */}
              <Html
                position={cand.position}
                distanceFactor={10}
                style={{ pointerEvents: 'auto', transition: 'all 0.2s ease' }}
              >
                <div
                  onClick={() => {
                    setSelectedId(cand.id);
                    onSelectCandidate?.(cand);
                  }}
                  className={`cursor-pointer rounded-xl p-3 backdrop-blur-md border shadow-2xl transition-all duration-300 w-48 ${
                    isSelected
                      ? 'bg-black/90 border-sky-400 shadow-sky-500/40 ring-2 ring-sky-500/50 scale-105'
                      : isHovered
                      ? 'bg-black/80 border-purple-400 shadow-purple-500/30'
                      : 'bg-black/60 border-white/10 opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-foreground truncate">{cand.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-extrabold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      {cand.matchScore}%
                    </span>
                  </div>

                  <p className="text-[10px] text-muted-foreground truncate mb-2">{cand.role}</p>

                  <div className="flex flex-wrap gap-1">
                    {cand.skills.slice(0, 2).map((sk) => (
                      <span
                        key={sk}
                        className="text-[9px] px-1 py-0.5 rounded bg-white/10 text-white/80"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </Html>
            </group>
          );
        })}
      </group>
    </>
  );
}
