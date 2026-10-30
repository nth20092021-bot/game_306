import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/useGameStore';

export const LightingAndEnvironment: React.FC = () => {
  const clockGlowIntensity = useGameStore((s) => s.clockGlowIntensity);
  const phase = useGameStore((s) => s.phase);
  const coreLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (coreLightRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
      coreLightRef.current.intensity = clockGlowIntensity * 3.5 * pulse;
    }
  });

  return (
    <>
      {/* MÀU NỀN VŨ TRỤ THỜI GIAN ĐẬM CHẤT ĐIỆN ẢNH */}
      <color attach="background" args={['#050811']} />
      <fog attach="fog" args={['#050811', 15, 65]} />

      {/* ÁNH SÁNG STUDIO CHUẨN ĐIỆN ẢNH, KHÔNG GÂY CHÁY LÓA (ANTI-GLARE STUDIO LIGHTS) */}
      <ambientLight intensity={0.65} color="#e2e8f0" />
      <directionalLight position={[3.5, 5.0, 4.0]} intensity={1.15} color="#fffbeb" />
      <directionalLight position={[-3.5, 2.0, -3.0]} intensity={0.45} color="#93c5fd" />

      {/* LÕI NĂNG LƯỢNG NỘI TẠI CỦA ĐỒNG HỒ (CHỈ BẬT KHI KHÔNG TRONG PHA REVEAL) */}
      {phase !== 'STUDENT_REVEAL' && (
        <pointLight
          ref={coreLightRef}
          position={[0, 0, 0.2]}
          color="#80f0ff"
          distance={8}
          decay={2}
        />
      )}
    </>
  );
};
