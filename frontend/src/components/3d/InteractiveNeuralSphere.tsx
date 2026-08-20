'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Html, Line, Sphere, Stars } from '@react-three/drei';
import { useTheme } from 'next-themes';
import * as THREE from 'three';

interface SkillNode {
  id: string;
  name: string;
  category: string;
  position: THREE.Vector3;
  color: string;
}

const SKILL_DATA = [
  { id: '1', name: 'Neural NLP', category: 'AI', color: '#a855f7' },
  { id: '2', name: 'Vector Search', category: 'Data', color: '#38bdf8' },
  { id: '3', name: 'System Design', category: 'Architecture', color: '#34d399' },
  { id: '4', name: 'PyTorch / ML', category: 'AI', color: '#f43f5e' },
  { id: '5', name: 'React 19 & Next.js', category: 'Frontend', color: '#60a5fa' },
  { id: '6', name: 'Distributed Systems', category: 'Cloud', color: '#fbbf24' },
  { id: '7', name: 'ATS Parser', category: 'Engine', color: '#c084fc' },
  { id: '8', name: 'Zero-Bias Scoring', category: 'Analytics', color: '#f472b6' },
];

export function InteractiveNeuralSphere() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  const { pointer } = useThree();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme === 'dark';

  // Calculate 3D positions for skill nodes distributed on a sphere radius 2.6
  const skillNodes = useMemo<SkillNode[]>(() => {
    return SKILL_DATA.map((skill, index) => {
      const phi = Math.acos(-1 + (2 * index) / SKILL_DATA.length);
      const theta = Math.sqrt(SKILL_DATA.length * Math.PI) * phi;
      const radius = 2.6;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      return {
        ...skill,
        position: new THREE.Vector3(x, y, z),
      };
    });
  }, []);

  // Generate random constellation lines connecting nodes
  const connectionLines = useMemo(() => {
    const lines: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < skillNodes.length; i++) {
      for (let j = i + 1; j < skillNodes.length; j++) {
        const nodeA = skillNodes[i];
        const nodeB = skillNodes[j];
        if (nodeA && nodeB && nodeA.position.distanceTo(nodeB.position) < 4.2) {
          lines.push([nodeA.position, nodeB.position]);
        }
      }
    }
    return lines;
  }, [skillNodes]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (groupRef.current) {
      // Mouse parallax easing
      const targetRotY = elapsed * 0.15 + pointer.x * 0.4;
      const targetRotX = Math.sin(elapsed * 0.2) * 0.1 + pointer.y * 0.3;

      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
    }

    if (coreRef.current) {
      coreRef.current.rotation.y = -elapsed * 0.25;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = elapsed * 0.3;
      ringRef.current.rotation.x = Math.sin(elapsed * 0.5) * 0.2;
    }
  });

  const primaryGlow = isDark ? '#a855f7' : '#7c3aed';
  const secondaryGlow = isDark ? '#38bdf8' : '#0284c7';
  const coreColor = isDark ? '#090d16' : '#f1f5f9';

  return (
    <>
      {/* Lighting Setup */}
      <ambientLight intensity={isDark ? 0.8 : 1.2} />
      <directionalLight position={[10, 10, 10]} intensity={isDark ? 2.5 : 2.0} color={primaryGlow} />
      <pointLight position={[-10, -10, -10]} intensity={2.0} color={secondaryGlow} />
      <spotLight position={[0, 15, 0]} intensity={1.8} angle={0.6} penumbra={1} color="#38bdf8" />

      <Float speed={1.8} rotationIntensity={0.3} floatIntensity={1.5}>
        <group ref={groupRef}>
          {/* Main Cyber Inner Core */}
          <Sphere ref={coreRef} args={[1.8, 48, 48]}>
            <meshPhysicalMaterial
              color={coreColor}
              emissive={primaryGlow}
              emissiveIntensity={isDark ? 0.4 : 0.25}
              metalness={0.9}
              roughness={0.1}
              transparent
              opacity={0.92}
              wireframe
            />
          </Sphere>

          {/* Inner Glowing Hologram Sphere */}
          <Sphere args={[1.5, 32, 32]}>
            <meshBasicMaterial
              color={secondaryGlow}
              transparent
              opacity={isDark ? 0.15 : 0.1}
            />
          </Sphere>

          {/* Orbital Holographic Energy Rings */}
          <group ref={ringRef}>
            <mesh rotation={[Math.PI / 3, 0, 0]}>
              <torusGeometry args={[2.8, 0.015, 16, 100]} />
              <meshBasicMaterial color={primaryGlow} transparent opacity={0.6} />
            </mesh>

            <mesh rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
              <torusGeometry args={[3.1, 0.01, 16, 100]} />
              <meshBasicMaterial color={secondaryGlow} transparent opacity={0.5} />
            </mesh>
          </group>

          {/* Geometric Connection Lines */}
          {connectionLines.map((pts, idx) => (
            <Line
              key={idx}
              points={pts}
              color={isDark ? '#38bdf8' : '#0284c7'}
              lineWidth={1}
              transparent
              opacity={isDark ? 0.3 : 0.45}
            />
          ))}

          {/* Interactive Skill Nodes with HTML Badges */}
          {skillNodes.map((node) => {
            const isHovered = activeSkill === node.id;
            return (
              <group key={node.id} position={node.position}>
                {/* 3D Sphere Marker */}
                <mesh
                  onPointerOver={() => setActiveSkill(node.id)}
                  onPointerOut={() => setActiveSkill(null)}
                >
                  <sphereGeometry args={[isHovered ? 0.18 : 0.12, 16, 16]} />
                  <meshStandardMaterial
                    color={node.color}
                    emissive={node.color}
                    emissiveIntensity={isHovered ? 1.5 : 0.6}
                  />
                </mesh>

                {/* HTML Floating Badge overlay */}
                <Html
                  position={[0, 0.25, 0]}
                  center
                  distanceFactor={8}
                  style={{ transition: 'all 0.2s ease', pointerEvents: 'none' }}
                >
                  <div
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap shadow-lg backdrop-blur-md border transition-all duration-300 ${
                      isHovered
                        ? 'scale-110 bg-purple-600/90 text-white border-purple-300 shadow-purple-500/50'
                        : 'bg-black/60 text-foreground border-white/20'
                    }`}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: node.color }} />
                    {node.name}
                  </div>
                </Html>
              </group>
            );
          })}
        </group>
      </Float>

      {/* Background Starfield */}
      {isDark && (
        <Stars
          radius={80}
          depth={50}
          count={3000}
          factor={4}
          fade
          speed={0.8}
        />
      )}
    </>
  );
}
