'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Line, Sphere, Stars } from '@react-three/drei';
import { useTheme } from 'next-themes';
import * as THREE from 'three';

export function AIGlobe() {
  const group = useRef<THREE.Group>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { pointer } = useThree();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme === 'dark';

  // 3D Nodes scattered on globe
  const nodes = useMemo(() => {
    const list: { pos: THREE.Vector3; color: string; size: number }[] = [];
    const colors = ['#38bdf8', '#a855f7', '#ec4899', '#34d399', '#fbbf24'];
    for (let i = 0; i < 30; i++) {
      list.push({
        pos: new THREE.Vector3().randomDirection().multiplyScalar(2.05),
        color: colors[i % colors.length] ?? '#38bdf8',
        size: Math.random() * 0.06 + 0.05,
      });
    }
    return list;
  }, []);

  const connections = useMemo(() => {
    const result: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < 75; i++) {
      result.push([
        new THREE.Vector3().randomDirection().multiplyScalar(2.1),
        new THREE.Vector3().randomDirection().multiplyScalar(2.1),
      ]);
    }
    return result;
  }, []);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (!group.current) return;

    const targetRotY = elapsed * 0.16 + pointer.x * 0.4;
    const targetRotX = Math.sin(elapsed * 0.25) * 0.12 + pointer.y * 0.25;

    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, 0.05);

    if (ring1.current) ring1.current.rotation.z = elapsed * 0.25;
    if (ring2.current) ring2.current.rotation.y = -elapsed * 0.3;
    if (ring3.current) ring3.current.rotation.x = elapsed * 0.2;
  });

  const sphereColor = isDark ? "#050505" : "#ffffff";
  const emissiveColor = isDark ? "#3b82f6" : "#2563eb";
  const innerSphereColor = isDark ? "#7c3aed" : "#8b5cf6";
  const lineColor = isDark ? "#38bdf8" : "#0284c7";

  return (
    <>
      <ambientLight intensity={isDark ? 0.9 : 1.3} />

      <directionalLight
        intensity={isDark ? 2.5 : 2.2}
        color={isDark ? "#7c3aed" : "#4f46e5"}
        position={[8, 8, 6]}
      />

      <pointLight
        intensity={isDark ? 2.2 : 2}
        color={isDark ? "#38bdf8" : "#0284c7"}
        position={[-8, -8, -6]}
      />

      <Float
        speed={2.2}
        rotationIntensity={0.3}
        floatIntensity={1.8}
      >
        <group ref={group}>
          {/* Main Cyber Wireframe Sphere */}
          <Sphere args={[2, 48, 48]}>
            <meshPhysicalMaterial
              color={sphereColor}
              emissive={emissiveColor}
              emissiveIntensity={isDark ? 0.45 : 0.4}
              metalness={isDark ? 1 : 0.5}
              roughness={isDark ? 0.05 : 0.2}
              transparent
              opacity={isDark ? 0.92 : 0.85}
              wireframe
            />
          </Sphere>

          {/* Inner Glowing Hologram Sphere */}
          <Sphere args={[1.92, 32, 32]}>
            <meshBasicMaterial
              color={innerSphereColor}
              transparent
              opacity={isDark ? 0.12 : 0.15}
            />
          </Sphere>

          {/* Orbital Holographic Energy Ring 1 */}
          <mesh ref={ring1} rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[2.7, 0.018, 16, 80]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} />
          </mesh>

          {/* Orbital Holographic Energy Ring 2 */}
          <mesh ref={ring2} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
            <torusGeometry args={[3.0, 0.014, 16, 80]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.55} />
          </mesh>

          {/* Orbital Holographic Energy Ring 3 */}
          <mesh ref={ring3} rotation={[0, Math.PI / 3, Math.PI / 4]}>
            <torusGeometry args={[3.3, 0.01, 16, 80]} />
            <meshBasicMaterial color="#ec4899" transparent opacity={0.45} />
          </mesh>

          {/* Geometric Connection Lines */}
          {connections.map((points, index) => (
            <Line
              key={index}
              points={points}
              color={lineColor}
              lineWidth={isDark ? 1.2 : 1.5}
              transparent
              opacity={isDark ? 0.4 : 0.55}
            />
          ))}

          {/* Pulsing 3D Nodes on Globe Surface */}
          {nodes.map((n, i) => (
            <mesh key={i} position={n.pos}>
              <sphereGeometry args={[n.size, 16, 16]} />
              <meshStandardMaterial
                color={n.color}
                emissive={n.color}
                emissiveIntensity={1.8}
              />
            </mesh>
          ))}
        </group>
      </Float>

      {isDark && (
        <Stars
          radius={120}
          depth={80}
          count={5000}
          factor={4}
          fade
          speed={1.2}
        />
      )}
    </>
  );
}