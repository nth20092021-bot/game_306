import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/useGameStore';

export const ShockwaveRing: React.FC = () => {
  const phase = useGameStore((s) => s.phase);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const sphereBurstRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (phase === 'CLIMAX_BURST') {
      if (ring1Ref.current) {
        ring1Ref.current.scale.addScalar(delta * 22);
        const mat = ring1Ref.current.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, mat.opacity - delta * 1.5);
      }
      if (ring2Ref.current) {
        ring2Ref.current.scale.addScalar(delta * 16);
        const mat = ring2Ref.current.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, mat.opacity - delta * 1.2);
      }
      if (sphereBurstRef.current) {
        sphereBurstRef.current.scale.addScalar(delta * 28);
        const mat = sphereBurstRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, mat.opacity - delta * 2.2);
      }
    } else {
      if (ring1Ref.current) {
        ring1Ref.current.scale.set(0.1, 0.1, 0.1);
        (ring1Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.95;
      }
      if (ring2Ref.current) {
        ring2Ref.current.scale.set(0.1, 0.1, 0.1);
        (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity = 0.85;
      }
      if (sphereBurstRef.current) {
        sphereBurstRef.current.scale.set(0.1, 0.1, 0.1);
        (sphereBurstRef.current.material as THREE.MeshBasicMaterial).opacity = 1.0;
      }
    }
  });

  if (phase !== 'CLIMAX_BURST') return null;

  return (
    <group position={[0, 0, 0.2]}>
      {/* VÒNG XUNG KÍCH CHÍNH (VÀNG HOÀNG KIM) */}
      <mesh ref={ring1Ref}>
        <ringGeometry args={[0.9, 1.15, 64]} />
        <meshBasicMaterial
          color="#ffdf80"
          transparent
          opacity={0.95}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* VÒNG XUNG KÍCH PHỤ (XANH NĂNG LƯỢNG THỜI GIAN) */}
      <mesh ref={ring2Ref} position={[0, 0, 0.05]}>
        <ringGeometry args={[0.75, 0.95, 64]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* CẦU NĂNG LƯỢNG BÙNG NỔ TRUNG TÂM */}
      <mesh ref={sphereBurstRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={1.0}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};
