// src/components/models/TimeRewindClockModel.tsx
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface TimeRewindClockProps {
  /** Tốc độ quay ngược: 1 = bình thường, > 1.5 = bắt đầu tua ngược thời gian & phát sáng */
  rewindSpeed?: number;
  /** Cường độ phát sáng cơ bản */
  glowIntensity?: number;
  /** Quy mô hiển thị của đồng hồ */
  scale?: number;
}

const royalDialVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Shader Mặt Nền Trống Đồng Đông Sơn & Hào Quang Thời Gian (Ấm áp, không chói)
const royalDialFragmentShader = `
  uniform float uTime;
  uniform float uIgnition;
  varying vec2 vUv;

  void main() {
    vec2 centered = vUv - 0.5;
    float r = length(centered) * 2.0;
    float angle = atan(centered.y, centered.x);

    // 1. Ngôi sao 14 cánh Trống Đồng Đông Sơn ở trung tâm
    float starRays = smoothstep(0.08, 0.0, abs(sin(angle * 7.0 + uTime * 0.4)) * r - 0.03) * smoothstep(0.48, 0.1, r);

    // 2. Các vòng hoa văn kỷ hà đồng tâm xoay ngược chiều nhau
    float ring1 = smoothstep(0.016, 0.0, abs(r - 0.92));
    float ring2 = smoothstep(0.012, 0.0, abs(r - 0.78));
    float ring3 = smoothstep(0.012, 0.0, abs(r - 0.56));
    float ring4 = smoothstep(0.015, 0.0, abs(r - 0.34));

    // Họa tiết kỷ hà cách điệu
    float patternOuter = step(0.1, sin(angle * 48.0 - uTime * 2.0)) * smoothstep(0.04, 0.0, abs(r - 0.85));
    float patternMid = step(0.2, cos(angle * 24.0 + uTime * 1.5)) * smoothstep(0.045, 0.0, abs(r - 0.67));
    float patternInner = step(0.15, sin(angle * 16.0 - uTime * 3.0)) * smoothstep(0.035, 0.0, abs(r - 0.45));

    // 3. Sóng năng lượng lan tỏa từ tâm ra ngoài khi bấm BẮT ĐẦU
    float surgeWave = sin(r * 12.0 - uTime * 8.0) * 0.5 + 0.5;
    float ignitionBoost = 1.0 + uIgnition * (2.2 + surgeWave * 1.2);
    float combined = (ring1 * 1.3 + ring2 + ring3 + ring4 * 1.2 + patternOuter + patternMid * 1.1 + patternInner + starRays * 1.4);

    vec3 deepGold = vec3(0.85, 0.58, 0.18);
    vec3 brightImperialGold = vec3(0.96, 0.82, 0.42);
    vec3 coreFlare = vec3(1.0, 0.92, 0.75);
    vec3 baseHue = mix(deepGold, brightImperialGold, clamp(combined * 0.6 + uIgnition * 0.4, 0.0, 1.0));

    // Luồng sáng ấm dịu ở tâm đồng hồ
    float centerGlow = exp(-r * (3.4 - uIgnition * 1.5)) * (0.32 + uIgnition * 1.25);
    vec3 finalColor = baseHue * combined * (0.82 * ignitionBoost) + coreFlare * centerGlow;
    float alpha = clamp((combined * 0.72 + centerGlow) * smoothstep(1.0, 0.94, r), 0.0, 0.92);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

interface OrnateGearProps {
  radius: number;
  teethCount: number;
  toothHeight?: number;
  thickness?: number;
  spokeCount?: number;
  rimWidth?: number;
  materialRim: THREE.Material;
  materialSpoke: THREE.Material;
  materialJewel?: THREE.Material;
}

/** Bánh răng cơ khí nan hoa rỗng (Spoked open-gear) */
const OrnateGear: React.FC<OrnateGearProps> = ({
  radius,
  teethCount,
  toothHeight = 0.12,
  thickness = 0.09,
  spokeCount = 6,
  rimWidth = 0.15,
  materialRim,
  materialSpoke,
  materialJewel,
}) => {
  const teeth = useMemo(() => {
    return Array.from({ length: teethCount }, (_, i) => {
      const angle = (i / teethCount) * Math.PI * 2;
      return {
        angle,
        x: Math.cos(angle) * (radius + toothHeight * 0.44),
        y: Math.sin(angle) * (radius + toothHeight * 0.44),
      };
    });
  }, [radius, teethCount, toothHeight]);

  const spokes = useMemo(() => {
    return Array.from({ length: spokeCount }, (_, i) => (i / spokeCount) * Math.PI);
  }, [spokeCount]);

  return (
    <group>
      {/* Vành bánh răng chính */}
      <mesh material={materialRim}>
        <torusGeometry args={[radius, rimWidth * 0.48, 20, 72]} />
      </mesh>
      {/* Vành chỉ nổi mạ vàng bên trong */}
      <mesh material={materialSpoke}>
        <torusGeometry args={[radius * 0.52, rimWidth * 0.32, 16, 56]} />
      </mesh>
      {/* Trục đồng tâm */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materialRim}>
        <cylinderGeometry args={[radius * 0.22, radius * 0.22, thickness * 1.45, 24]} />
      </mesh>
      {/* Chân kính tâm trục (Vàng Đồng Hổ Phách ấm, không dùng màu hồng) */}
      {materialJewel && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, thickness * 0.75]} material={materialJewel}>
          <cylinderGeometry args={[radius * 0.11, radius * 0.11, 0.03, 20]} />
        </mesh>
      )}
      {/* Nan hoa rỗng thanh thoát */}
      {spokes.map((ang, idx) => (
        <mesh key={`sp-${idx}`} rotation={[0, 0, ang]} material={materialSpoke}>
          <boxGeometry args={[radius * 1.92, rimWidth * 0.48, thickness * 0.65]} />
        </mesh>
      ))}
      {/* Răng cưa vát sắc nét */}
      {teeth.map((t, idx) => (
        <mesh
          key={`th-${idx}`}
          position={[t.x, t.y, 0]}
          rotation={[0, 0, t.angle]}
          material={materialRim}
        >
          <boxGeometry args={[toothHeight, (Math.PI * radius * 0.95) / teethCount, thickness]} />
        </mesh>
      ))}
    </group>
  );
};

export const TimeRewindClockModel: React.FC<TimeRewindClockProps> = ({
  rewindSpeed = 1,
  scale = 1,
}) => {
  const masterRigRef = useRef<THREE.Group>(null);
  const astrolabeRing1Ref = useRef<THREE.Group>(null);
  const astrolabeRing2Ref = useRef<THREE.Group>(null);
  const bgGearLeftRef = useRef<THREE.Group>(null);
  const bgGearRightRef = useRef<THREE.Group>(null);
  const bgGearTopRef = useRef<THREE.Group>(null);
  const outerBezelCogRef = useRef<THREE.Group>(null);
  const gearCenterRef = useRef<THREE.Group>(null);
  const gearTRRef = useRef<THREE.Group>(null);
  const gearBLRef = useRef<THREE.Group>(null);
  const gearTLRef = useRef<THREE.Group>(null);
  const gearBRRef = useRef<THREE.Group>(null);
  const hourHandRef = useRef<THREE.Group>(null);
  const minuteHandRef = useRef<THREE.Group>(null);
  const secondHandRef = useRef<THREE.Group>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);
  const ambientParticlesRef = useRef<THREE.InstancedMesh>(null);

  const ignitionProgressRef = useRef(0);
  const lastActiveTimeRef = useRef(performance.now());

  // Bảo vệ tab ẩn: xả bỏ thời gian chết khi tab mở lại (không bị giật bung)
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        lastActiveTimeRef.current = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const dialUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIgnition: { value: 0 },
    }),
    []
  );

  // Bộ vật liệu Hoàng Gia Cổ Điển — Đổi toàn bộ chi tiết Hồng sang Vàng Đồng Hổ Phách
  const materials = useMemo(() => {
    return {
      royalGold: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xf59e0b),
        emissive: new THREE.Color(0x92400e),
        emissiveIntensity: 0.38,
        metalness: 0.85,
        roughness: 0.22,
      }),
      burnishedBrass: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xd97706),
        emissive: new THREE.Color(0x78350f),
        emissiveIntensity: 0.25,
        metalness: 0.8,
        roughness: 0.3,
      }),
      antiqueCopper: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xb45309),
        emissive: new THREE.Color(0x451a03),
        emissiveIntensity: 0.22,
        metalness: 0.78,
        roughness: 0.35,
      }),
      deepBronzeCase: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x452712),
        emissive: new THREE.Color(0x271204),
        emissiveIntensity: 0.18,
        metalness: 0.75,
        roughness: 0.42,
      }),
      obsidianDial: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x120c07),
        metalness: 0.4,
        roughness: 0.6,
      }),
      glowingImperialGold: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xfef08a),
        emissive: new THREE.Color(0xf59e0b),
        emissiveIntensity: 1.15,
        metalness: 0.6,
        roughness: 0.15,
      }),
      // VÀNG ĐỒNG HỔ PHÁCH DỊU DÀNG THAY CHO MÀU HỒNG RUBY CŨ
      warmAmberGold: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xd4af37),
        emissive: new THREE.Color(0x8b5a00),
        emissiveIntensity: 0.45,
        metalness: 0.85,
        roughness: 0.25,
      }),
      // Kim đồng hồ màu vàng sáng #ffd700 có viền nổi
      brightHandGold: new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ffd700'),
        emissive: new THREE.Color(0xb45309),
        emissiveIntensity: 0.5,
        metalness: 0.9,
        roughness: 0.18,
      }),
      particleSpark: new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xfde68a),
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      }),
    };
  }, []);

  // 24 Đinh tán đồng cổ quanh vành Bezel
  const bezelRivets = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const ang = (i / 24) * Math.PI * 2;
      return { x: Math.cos(ang) * 2.62, y: Math.sin(ang) * 2.62 };
    });
  }, []);

  // 120 Hạt bụi vàng thời gian bay lượn quanh đồng hồ
  const dustParticles = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => {
      const angle = (i / 120) * Math.PI * 2 + Math.random();
      const radius = 1.6 + Math.random() * 3.4;
      const z = (Math.random() - 0.5) * 2.2;
      const speed = 0.15 + Math.random() * 0.45;
      const size = 0.016 + Math.random() * 0.028;
      return { angle, radius, z, speed, size };
    });
  }, []);

  // Vòng số La Mã (I - XII) & Vạch chia Railway Track trên Canvas trong suốt
  const romanOverlayTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const cx = 1024;
    const cy = 1024;
    ctx.clearRect(0, 0, 2048, 2048);

    // Vòng vạch chia phút mảnh cổ điển (Railway Track)
    const outerR = 910;
    const innerR = 880;
    ctx.strokeStyle = 'rgba(235, 185, 75, 0.85)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.stroke();

    // Vòng phát sáng vạch đứt đồng tâm bên trong (Dashed Glowing Rings)
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 3.5;
    ctx.setLineDash([16, 20]);
    ctx.beginPath();
    ctx.arc(cx, cy, 740, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(254, 240, 138, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([10, 16]);
    ctx.beginPath();
    ctx.arc(cx, cy, 580, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const isHour = i % 5 === 0;
      ctx.lineWidth = isHour ? 7 : 3;
      ctx.strokeStyle = isHour ? '#FFD25A' : 'rgba(218, 165, 32, 0.65)';
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
      ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
      ctx.stroke();
    }

    // 12 chữ số La Mã mạ vàng đồng cổ điển (Cinzel / Playfair Display)
    const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    ctx.font = '700 94px "Cinzel", "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    numerals.forEach((roman, idx) => {
      const angle = (idx / 12) * Math.PI * 2 - Math.PI / 2;
      const textRadius = 798;
      const x = cx + Math.cos(angle) * textRadius;
      const y = cy + Math.sin(angle) * textRadius;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);

      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#F3C65F';
      ctx.fillText(roman, 0, 0);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFF0B8';
      ctx.strokeText(roman, 0, 0);
      ctx.restore();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;
    return texture;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Frame Loop với cơ chế bảo vệ Delta Time không bao giờ vượt quá 0.05s
  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    const isRewinding = rewindSpeed > 1.5;
    const speed = rewindSpeed;

    // 1. HIỆU ỨNG BỪNG SÁNG ĐỒNG HỒ KHI BẤM BẮT ĐẦU
    const targetIgnition = isRewinding ? 1.0 : 0.0;
    ignitionProgressRef.current = THREE.MathUtils.lerp(
      ignitionProgressRef.current,
      targetIgnition,
      delta * (isRewinding ? 3.2 : 2.0)
    );
    const ign = ignitionProgressRef.current;

    dialUniforms.uTime.value += delta * speed;
    dialUniforms.uIgnition.value = ign;

    materials.royalGold.emissiveIntensity = 0.38 + ign * 1.25;
    materials.burnishedBrass.emissiveIntensity = 0.25 + ign * 0.85;
    materials.glowingImperialGold.emissiveIntensity = 1.15 + ign * 2.2;
    materials.warmAmberGold.emissiveIntensity = 0.45 + ign * 1.1;

    if (coreLightRef.current) {
      coreLightRef.current.intensity = 2.0 + ign * 6.5 + Math.sin(t * 5) * 0.3;
    }
    if (rimLightRef.current) {
      rimLightRef.current.intensity = 1.6 + ign * 3.8;
    }

    // 2. DI CAM 3D ĐIỆN ẢNH VÀ TRANG BÌA LƠ LỬNG
    if (masterRigRef.current) {
      if (isRewinding) {
        const targetRotY = Math.sin(t * 2.0) * 0.45;
        const targetRotX = -0.24 + Math.cos(t * 1.6) * 0.26;
        const targetRotZ = Math.sin(t * 1.2) * 0.18;
        const targetPosZ = 0.95 + ign * 0.65;

        masterRigRef.current.rotation.y = THREE.MathUtils.lerp(masterRigRef.current.rotation.y, targetRotY, delta * 3.5);
        masterRigRef.current.rotation.x = THREE.MathUtils.lerp(masterRigRef.current.rotation.x, targetRotX, delta * 3.5);
        masterRigRef.current.rotation.z = THREE.MathUtils.lerp(masterRigRef.current.rotation.z, targetRotZ, delta * 3.5);
        masterRigRef.current.position.z = THREE.MathUtils.lerp(masterRigRef.current.position.z, targetPosZ, delta * 3.0);
      } else {
        masterRigRef.current.rotation.y = THREE.MathUtils.lerp(
          masterRigRef.current.rotation.y,
          Math.sin(t * 0.6) * 0.16,
          delta * 2.5
        );
        masterRigRef.current.rotation.x = THREE.MathUtils.lerp(
          masterRigRef.current.rotation.x,
          Math.cos(t * 0.45) * 0.1,
          delta * 2.5
        );
        masterRigRef.current.rotation.z = THREE.MathUtils.lerp(masterRigRef.current.rotation.z, 0, delta * 2.5);
        masterRigRef.current.position.z = THREE.MathUtils.lerp(masterRigRef.current.position.z, 0, delta * 2.5);
      }
    }

    // 3. VÒNG HỖN THIÊN NGHI 3D
    if (astrolabeRing1Ref.current) {
      astrolabeRing1Ref.current.rotation.x = 0.35 + Math.sin(t * 0.4) * 0.15;
      astrolabeRing1Ref.current.rotation.y += delta * 0.18 * (1 + ign * 2.5);
    }
    if (astrolabeRing2Ref.current) {
      astrolabeRing2Ref.current.rotation.y = -0.35 + Math.cos(t * 0.35) * 0.15;
      astrolabeRing2Ref.current.rotation.z -= delta * 0.15 * (1 + ign * 2.5);
    }

    // 4. XOAY CÁC BÁNH RĂNG CƠ KHÍ NAN HOA RỖNG
    if (bgGearLeftRef.current) bgGearLeftRef.current.rotation.z += delta * 0.2 * speed;
    if (bgGearRightRef.current) bgGearRightRef.current.rotation.z -= delta * 0.26 * speed;
    if (bgGearTopRef.current) bgGearTopRef.current.rotation.z += delta * 0.34 * speed;
    if (outerBezelCogRef.current) outerBezelCogRef.current.rotation.z -= delta * 0.18 * speed;
    if (gearCenterRef.current) gearCenterRef.current.rotation.z += delta * 0.7 * speed;
    if (gearTRRef.current) gearTRRef.current.rotation.z -= delta * 1.25 * speed;
    if (gearBLRef.current) gearBLRef.current.rotation.z -= delta * 1.4 * speed;
    if (gearTLRef.current) gearTLRef.current.rotation.z += delta * 1.65 * speed;
    if (gearBRRef.current) gearBRRef.current.rotation.z -= delta * 1.5 * speed;

    // 5. KIM ĐỒNG HỒ TUA NGƯỢC
    if (secondHandRef.current) secondHandRef.current.rotation.z += delta * 2.8 * speed;
    if (minuteHandRef.current) minuteHandRef.current.rotation.z += delta * 0.52 * speed;
    if (hourHandRef.current) hourHandRef.current.rotation.z += delta * 0.1 * speed;

    // 6. 120 HẠT BỤI SAO THỜI GIAN
    if (ambientParticlesRef.current) {
      dustParticles.forEach((p, idx) => {
        const curAngle = p.angle - t * p.speed * (1 + ign * 3.5);
        const curR = p.radius * (1 - ign * 0.22 * Math.sin(t * 3 + idx));
        const curZ = p.z + Math.sin(t * 1.5 + idx) * 0.25 + ign * 1.1;
        const pulse = p.size * (0.7 + 0.4 * Math.sin(t * 5 + idx)) * (1 + ign * 0.75);
        dummy.position.set(Math.cos(curAngle) * curR, Math.sin(curAngle) * curR, curZ);
        dummy.rotation.set(t * 2, t * 3, 0);
        dummy.scale.setScalar(pulse);
        dummy.updateMatrix();
        ambientParticlesRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      ambientParticlesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={masterRigRef} scale={scale}>
      {/* ĐÈN CHIẾU ĐỒNG HỒ (ẤM ÁP, KHÔNG CHÓI) */}
      <pointLight ref={coreLightRef} position={[0, 0, 1.65]} intensity={2.0} distance={8} color="#fde047" />
      <pointLight ref={rimLightRef} position={[3.0, 2.8, 2.5]} intensity={1.6} distance={11} color="#fef08a" />
      <pointLight position={[-3.0, -2.5, 2.0]} intensity={1.1} distance={9} color="#f59e0b" />

      {/* 120 HẠT BỤI SAO VÀNG BAY QUANH ĐỒNG HỒ */}
      <instancedMesh ref={ambientParticlesRef} args={[undefined, undefined, 120]} material={materials.particleSpark}>
        <octahedronGeometry args={[1, 0]} />
      </instancedMesh>

      {/* 2 VÒNG HỖN THIÊN NGHI 3D */}
      <group ref={astrolabeRing1Ref}>
        <mesh material={materials.burnishedBrass}>
          <torusGeometry args={[3.52, 0.035, 16, 128]} />
        </mesh>
      </group>
      <group ref={astrolabeRing2Ref}>
        <mesh material={materials.royalGold}>
          <torusGeometry args={[3.28, 0.03, 16, 128]} />
        </mesh>
      </group>

      {/* TẦNG 1: 3 BÁNH RĂNG KHỔNG LỒ PHÍA SAU NỀN */}
      <group position={[0, 0, -0.52]}>
        <group ref={bgGearLeftRef} position={[-2.25, 1.35, -0.12]}>
          <OrnateGear
            radius={2.05}
            teethCount={32}
            toothHeight={0.18}
            thickness={0.12}
            spokeCount={8}
            rimWidth={0.22}
            materialRim={materials.burnishedBrass}
            materialSpoke={materials.deepBronzeCase}
            materialJewel={materials.warmAmberGold}
          />
        </group>
        <group ref={bgGearRightRef} position={[2.35, -1.25, -0.08]}>
          <OrnateGear
            radius={1.88}
            teethCount={28}
            toothHeight={0.16}
            thickness={0.12}
            spokeCount={6}
            rimWidth={0.2}
            materialRim={materials.antiqueCopper}
            materialSpoke={materials.burnishedBrass}
            materialJewel={materials.warmAmberGold}
          />
        </group>
        <group ref={bgGearTopRef} position={[1.95, 1.68, -0.18]}>
          <OrnateGear
            radius={1.32}
            teethCount={22}
            toothHeight={0.14}
            thickness={0.1}
            spokeCount={5}
            rimWidth={0.16}
            materialRim={materials.royalGold}
            materialSpoke={materials.deepBronzeCase}
          />
        </group>
      </group>

      {/* TẦNG 2: THÂN VỎ ĐỒNG HỒ CỔ ĐÍNH 24 ĐINH TÁN */}
      <group ref={outerBezelCogRef} position={[0, 0, -0.14]}>
        <OrnateGear
          radius={2.88}
          teethCount={48}
          toothHeight={0.14}
          thickness={0.14}
          spokeCount={12}
          rimWidth={0.18}
          materialRim={materials.royalGold}
          materialSpoke={materials.deepBronzeCase}
        />
      </group>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.22]} material={materials.deepBronzeCase}>
        <cylinderGeometry args={[2.76, 2.68, 0.36, 64]} />
      </mesh>

      <mesh position={[0, 0, 0.03]} material={materials.royalGold}>
        <torusGeometry args={[2.62, 0.16, 32, 128]} />
      </mesh>

      {/* 24 Đinh tán đồng nổi quanh vành Bezel */}
      <group position={[0, 0, 0.18]}>
        {bezelRivets.map((rv, idx) => (
          <mesh key={`rivet-${idx}`} position={[rv.x, rv.y, 0]} material={materials.glowingImperialGold}>
            <sphereGeometry args={[0.042, 12, 12]} />
          </mesh>
        ))}
      </group>

      {/* Núm vặn quả quýt ở đỉnh 12 giờ */}
      <group position={[0, 3.08, -0.04]}>
        <mesh position={[0, -0.22, 0]} material={materials.deepBronzeCase}>
          <cylinderGeometry args={[0.25, 0.18, 0.4, 24]} />
        </mesh>
        <mesh position={[0, 0.06, 0]} material={materials.royalGold}>
          <cylinderGeometry args={[0.38, 0.38, 0.24, 32]} />
        </mesh>
        <mesh position={[0, 0.28, 0]} material={materials.royalGold}>
          <torusGeometry args={[0.54, 0.07, 16, 48]} />
        </mesh>
      </group>

      {/* TẦNG 3: MẶT NỀN TRỐNG ĐỒNG ĐÔNG SƠN & 5 BÁNH RĂNG LỘ CƠ RỖNG */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.1]} material={materials.obsidianDial}>
        <cylinderGeometry args={[2.55, 2.55, 0.08, 64]} />
      </mesh>

      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[4.95, 4.95]} />
        <shaderMaterial
          vertexShader={royalDialVertexShader}
          fragmentShader={royalDialFragmentShader}
          uniforms={dialUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 5 Bánh răng nan hoa rỗng lộ cơ trong lòng đồng hồ (Tâm trục vàng hổ phách) */}
      <group position={[0, 0, 0.01]}>
        <group ref={gearCenterRef} position={[0, 0, 0]}>
          <OrnateGear
            radius={1.22}
            teethCount={28}
            toothHeight={0.1}
            thickness={0.07}
            spokeCount={8}
            rimWidth={0.13}
            materialRim={materials.royalGold}
            materialSpoke={materials.antiqueCopper}
          />
        </group>
        <group ref={gearTRRef} position={[1.05, 0.82, 0.03]}>
          <OrnateGear
            radius={0.7}
            teethCount={18}
            toothHeight={0.085}
            thickness={0.06}
            spokeCount={6}
            rimWidth={0.1}
            materialRim={materials.antiqueCopper}
            materialSpoke={materials.royalGold}
            materialJewel={materials.warmAmberGold}
          />
        </group>
        <group ref={gearBLRef} position={[-1.02, -0.82, 0.03]}>
          <OrnateGear
            radius={0.66}
            teethCount={16}
            toothHeight={0.085}
            thickness={0.06}
            spokeCount={5}
            rimWidth={0.1}
            materialRim={materials.royalGold}
            materialSpoke={materials.burnishedBrass}
            materialJewel={materials.warmAmberGold}
          />
        </group>
        <group ref={gearTLRef} position={[-1.06, 0.86, -0.01]}>
          <OrnateGear
            radius={0.54}
            teethCount={14}
            toothHeight={0.075}
            thickness={0.05}
            spokeCount={4}
            rimWidth={0.085}
            materialRim={materials.burnishedBrass}
            materialSpoke={materials.royalGold}
            materialJewel={materials.warmAmberGold}
          />
        </group>
        <group ref={gearBRRef} position={[1.05, -0.86, -0.01]}>
          <OrnateGear
            radius={0.56}
            teethCount={15}
            toothHeight={0.075}
            thickness={0.05}
            spokeCount={4}
            rimWidth={0.085}
            materialRim={materials.royalGold}
            materialSpoke={materials.antiqueCopper}
            materialJewel={materials.warmAmberGold}
          />
        </group>
      </group>

      {/* Cầu trục Tourbillon ngang tâm với chốt vàng hổ phách */}
      <group position={[0, 0, 0.06]}>
        <mesh material={materials.burnishedBrass}>
          <boxGeometry args={[3.9, 0.16, 0.04]} />
        </mesh>
        <mesh position={[-1.7, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]} material={materials.warmAmberGold}>
          <cylinderGeometry args={[0.075, 0.075, 0.05, 16]} />
        </mesh>
        <mesh position={[1.7, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]} material={materials.warmAmberGold}>
          <cylinderGeometry args={[0.075, 0.075, 0.05, 16]} />
        </mesh>
      </group>

      {/* LỚP PHỦ VÒNG SỐ LA MÃ (I - XII) & VẠCH ĐỨT ĐỒNG TÂM TRONG SUỐT */}
      {romanOverlayTexture && (
        <mesh position={[0, 0, 0.082]}>
          <planeGeometry args={[5.25, 5.25]} />
          <meshBasicMaterial map={romanOverlayTexture} transparent depthWrite={false} />
        </mesh>
      )}

      {/* 4 CỌC GIỜ CHÍNH (12h, 3h, 6h, 9h) HÌNH THOI VÀNG ĐỒNG HỔ PHÁCH */}
      <group position={[0, 0, 0.09]}>
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (
          <mesh
            key={`main-mark-${i}`}
            position={[Math.sin(ang) * 2.16, Math.cos(ang) * 2.16, 0.02]}
            rotation={[0, 0, -ang]}
            material={materials.warmAmberGold}
          >
            <octahedronGeometry args={[0.08, 0]} />
          </mesh>
        ))}
      </group>

      {/* TẦNG 4: BỘ KIM ĐỒNG HỒ TINH CHỈNH (MŨI KIM LÁ LÚA / KHUYÊN TRÒN CỔ ĐIỂN #FFD700 CÓ VIỀN RÕ RÀNG) */}
      {/* Kim Giờ */}
      <group ref={hourHandRef} position={[0, 0, 0.12]}>
        {/* Lưng kim tương phản nổi bật */}
        <mesh position={[0, 0.52, -0.005]} material={materials.deepBronzeCase}>
          <boxGeometry args={[0.095, 1.25, 0.02]} />
        </mesh>
        {/* Mũi kim lá lúa vàng sáng #ffd700 */}
        <mesh position={[0, 0.6, 0]} material={materials.brightHandGold}>
          <coneGeometry args={[0.08, 1.2, 16]} />
        </mesh>
        {/* Khuyên tròn cổ điển */}
        <mesh position={[0, 0.82, 0]} material={materials.brightHandGold}>
          <torusGeometry args={[0.11, 0.024, 12, 32]} />
        </mesh>
      </group>

      {/* Kim Phút */}
      <group ref={minuteHandRef} position={[0, 0, 0.15]}>
        {/* Lưng kim tương phản nổi bật */}
        <mesh position={[0, 0.78, -0.005]} material={materials.deepBronzeCase}>
          <boxGeometry args={[0.075, 1.85, 0.02]} />
        </mesh>
        {/* Mũi kim dài lá lúa vàng sáng #ffd700 */}
        <mesh position={[0, 0.92, 0]} material={materials.brightHandGold}>
          <coneGeometry args={[0.062, 1.88, 16]} />
        </mesh>
        {/* Khuyên tròn cổ điển */}
        <mesh position={[0, 1.32, 0]} material={materials.brightHandGold}>
          <torusGeometry args={[0.092, 0.02, 12, 32]} />
        </mesh>
        {/* Đối trọng đuôi kim */}
        <mesh position={[0, -0.28, 0]} material={materials.antiqueCopper}>
          <coneGeometry args={[0.055, 0.46, 16]} />
        </mesh>
      </group>

      {/* Kim Giây Thanh Mảnh */}
      <group ref={secondHandRef} position={[0, 0, 0.18]}>
        <mesh position={[0, 0.95, 0]} material={materials.glowingImperialGold}>
          <boxGeometry args={[0.022, 2.35, 0.02]} />
        </mesh>
        <mesh position={[0, -0.35, 0]} material={materials.warmAmberGold}>
          <ringGeometry args={[0.05, 0.09, 24]} />
        </mesh>
      </group>

      {/* Chốt Tâm Đính Vàng Đồng Hổ Phách & Vàng Ròng (Không dùng màu hồng) */}
      <group position={[0, 0, 0.2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.royalGold}>
          <cylinderGeometry args={[0.25, 0.28, 0.06, 32]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.035]} material={materials.warmAmberGold}>
          <cylinderGeometry args={[0.12, 0.14, 0.05, 24]} />
        </mesh>
      </group>
    </group>
  );
};
