'use client';

import { Canvas } from '@react-three/fiber';
import { InteractiveNeuralSphere } from '../3d/InteractiveNeuralSphere';

export default function GlobeCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <InteractiveNeuralSphere />
    </Canvas>
  );
}