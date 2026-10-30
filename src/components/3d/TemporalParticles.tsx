import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/useGameStore';

export const TemporalParticles: React.FC = () => {
  const phase = useGameStore((s) => s.phase);
  const pointsRef = useRef<THREE.Points>(null);

  const particleCount = 1800;

  // Khởi tạo vị trí và vận tốc cho các hạt bụi thời gian
  const [positions, speeds, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const spd = new Float32Array(particleCount);
    const cols = new Float32Array(particleCount * 3);

    const goldColor = new THREE.Color('#ffdf80');
    const cyanColor = new THREE.Color('#38bdf8');
    const whiteColor = new THREE.Color('#ffffff');

    for (let i = 0; i < particleCount; i++) {
      // Bố trí hình trụ xung quanh trục nhìn Z
      const radius = 1.2 + Math.random() * 8.5;
      const angle = Math.random() * Math.PI * 2;
      const z = -60 + Math.random() * 70;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = z;

      spd[i] = 0.5 + Math.random() * 1.5;

      // Màu hạt ngẫu nhiên: vàng hoàng kim, xanh thời gian, trắng tinh khiết
      const randColor = Math.random();
      let c = goldColor;
      if (randColor > 0.7) c = cyanColor;
      else if (randColor > 0.9) c = whiteColor;

      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }

    return [pos, spd, cols];
  }, [particleCount]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;

    const t = state.clock.elapsedTime;

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;

      if (phase === 'FLASHBACK_REWIND' || phase === 'CAMERA_DIVE') {
        // Tốc độ lao vút qua không gian (Hyperspace / Warp streak)
        const warpSpeed = phase === 'FLASHBACK_REWIND' ? 55 * speeds[i] : 20 * speeds[i];
        posArr[idx + 2] += delta * warpSpeed;

        // Vòng xoáy nhẹ quanh trục Z
        const x = posArr[idx];
        const y = posArr[idx + 1];
        const rot = delta * 1.5;
        posArr[idx] = x * Math.cos(rot) - y * Math.sin(rot);
        posArr[idx + 1] = x * Math.sin(rot) + y * Math.cos(rot);

        // Khi hạt bay qua phía sau camera, tái tạo lại ở đáy đường hầm
        if (posArr[idx + 2] > 10) {
          posArr[idx + 2] = -70;
        }
      } else if (phase === 'CLIMAX_BURST') {
        // Bung toả xuyên tâm từ tâm đồng hồ
        posArr[idx] += posArr[idx] * delta * 4;
        posArr[idx + 1] += posArr[idx + 1] * delta * 4;
        posArr[idx + 2] += delta * 10;
      } else if (phase === 'STUDENT_REVEAL') {
        // Hạt vàng bay bồng bềnh chúc mừng xung quanh học sinh
        posArr[idx + 1] += delta * speeds[i] * 0.8;
        posArr[idx] += Math.sin(t * 2 + i) * delta * 0.4;
        if (posArr[idx + 1] > 5) {
          posArr[idx + 1] = -2;
        }
      } else {
        // IDLE: Chuyển động Brown lơ lửng chậm rãi
        posArr[idx + 1] += Math.sin(t * 0.8 + i) * delta * 0.25;
        posArr[idx] += Math.cos(t * 0.6 + i) * delta * 0.2;
        posArr[idx + 2] += Math.sin(t * 0.4 + i) * delta * 0.2;
      }
    }

    posAttr.needsUpdate = true;
  });

  // Tạo texture tròn mềm mại cho hạt bụi (không bị vuông cạnh)
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 223, 128, 0.8)');
      grad.addColorStop(0.8, 'rgba(212, 175, 55, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

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
        size={0.16}
        vertexColors
        map={particleTexture}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
