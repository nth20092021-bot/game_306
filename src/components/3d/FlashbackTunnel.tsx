import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FLASHBACK_ITEMS } from '../../data/initialData';
import { useGameStore } from '../../stores/useGameStore';

// Tạo Canvas Procedural Texture cho thẻ Ký Ức Thời Gian (Fallback khi file ảnh chưa có)
function createHologramFallbackTexture(
  id: number,
  title: string,
  era: string,
  filename: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 576; // 16:9 standard
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Nền không gian thời gian huyền bí
    const grad = ctx.createLinearGradient(0, 0, 1024, 576);
    grad.addColorStop(0, '#060a14');
    grad.addColorStop(0.5, '#0e1628');
    grad.addColorStop(1, '#080d1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 576);

    // 2. Lưới không gian thời gian (Temporal Grid)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 576);
      ctx.stroke();
    }
    for (let y = 0; y < 576; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // 3. Vòng tròn cổ ngữ ma thuật ở trung tâm
    ctx.save();
    ctx.translate(512, 288);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 190, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 150, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 4. Viền khung vàng đồng chạm trổ (Ornate Gold Frame)
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 6;
    ctx.strokeRect(24, 24, 1024 - 48, 576 - 48);

    ctx.strokeStyle = 'rgba(255, 223, 128, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(34, 34, 1024 - 68, 576 - 68);

    // 5. Nội dung chữ
    ctx.fillStyle = '#f59e0b';
    ctx.font = '700 24px "Cinzel", "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.fillText(`KÝ ỨC THỜI GIAN #${String(id).padStart(2, '0')}`, 512, 110);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 44px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(title.toUpperCase(), 512, 250);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`❖  ${era}  ❖`, 512, 315);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '400 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`public/assets/flashback/${filename}`, 512, 470);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

// Single Monolith Component
interface MonolithProps {
  item: (typeof FLASHBACK_ITEMS)[0];
  index: number;
  phase: string;
}

const Monolith: React.FC<MonolithProps> = ({ item, index, phase }) => {
  const meshRef = useRef<THREE.Group>(null);
  const customPhotos = useGameStore((s) => s.customPhotos);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // Fallback procedural texture
  const fallbackTexture = useMemo(
    () => createHologramFallbackTexture(item.id, item.title, item.era, item.filename),
    [item]
  );

  useEffect(() => {
    let isCancelled = false;
    const loader = new THREE.TextureLoader();

    // Check if custom uploaded photo exists for this file, else load from assets
    const customUrl = customPhotos[item.filename];
    const imageSrc = customUrl || `/assets/flashback/${item.filename}`;

    loader.load(
      imageSrc,
      (loadedTex) => {
        if (!isCancelled) {
          loadedTex.colorSpace = THREE.SRGBColorSpace;
          loadedTex.minFilter = THREE.LinearFilter;
          loadedTex.magFilter = THREE.LinearFilter;
          loadedTex.generateMipmaps = false;
          loadedTex.needsUpdate = true;
          setTexture(loadedTex);
        }
      },
      undefined,
      () => {
        if (!isCancelled) {
          setTexture(fallbackTexture);
        }
      }
    );

    return () => {
      isCancelled = true;
    };
  }, [item.filename, customPhotos, fallbackTexture]);

  // Vị trí trục Z dọc theo đường hầm thời gian
  // Bố trí đều đặn từ z = -10 đến -90
  const initialZ = useMemo(() => {
    return -8 - index * 6.5;
  }, [index]);

  // Đặt thẻ gần trung tâm tầm nhìn hơn để người xem nhìn rõ từng bức ảnh (x = ±1.15)
  const xOffset = useMemo(() => {
    return (index % 2 === 0 ? 1 : -1) * 1.15;
  }, [index]);

  const yOffset = useMemo(() => {
    return (index % 3 === 0 ? 0.2 : index % 3 === 1 ? -0.15 : 0.05);
  }, [index]);

  const rotationY = useMemo(() => {
    return (index % 2 === 0 ? -1 : 1) * 0.12;
  }, [index]);

  // Vật liệu khung viền vàng đồng cao cấp
  const frameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#d4af37'),
        metalness: 0.95,
        roughness: 0.2,
      }),
    []
  );

  const glowBorderMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#ffdf80'),
        emissive: new THREE.Color('#f59e0b'),
        emissiveIntensity: 1.8,
        roughness: 0.1,
      }),
    []
  );

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (phase === 'FLASHBACK_REWIND') {
      // Tốc độ bay lướt vừa phải để mắt kịp nhìn rõ từng bức ảnh
      const speed = 20;
      meshRef.current.position.z += delta * speed;

      // Chuyển động bồng bềnh uốn lượn nhẹ
      meshRef.current.position.y =
        yOffset + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5 + index) * 0.03;

      // Khi thẻ bay vượt qua sau lưng camera (z > 5), thu nhỏ mượt mà
      const distFromCam = meshRef.current.position.z - 2;
      if (distFromCam > 1.5) {
        meshRef.current.scale.setScalar(Math.max(0.01, 1 - (distFromCam - 1.5) * 0.5));
      } else {
        meshRef.current.scale.setScalar(1);
      }
    } else {
      // Đặt lại vị trí ban đầu
      meshRef.current.position.set(xOffset, yOffset, initialZ);
      meshRef.current.scale.setScalar(1);
    }
  });

  const finalTex = texture || fallbackTexture;

  return (
    <group ref={meshRef} position={[xOffset, yOffset, initialZ]} rotation={[0, rotationY, 0]}>
      {/* KHUNG NỀN MONOLITH PHA LÊ */}
      <mesh material={frameMaterial}>
        <boxGeometry args={[4.8, 2.85, 0.08]} />
      </mesh>

      {/* VIỀN HÀO QUANG PHÁT SÁNG */}
      <mesh position={[0, 0, 0.02]} material={glowBorderMaterial}>
        <boxGeometry args={[4.64, 2.7, 0.06]} />
      </mesh>

      {/* MẶT ẢNH LỊCH SỬ CHÍNH (MeshBasicMaterial để ảnh sáng tự nhiên, sắc nét nhất) */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[4.5, 2.55]} />
        <meshBasicMaterial
          map={finalTex}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

export const FlashbackTunnel: React.FC = () => {
  const phase = useGameStore((s) => s.phase);
  const groupRef = useRef<THREE.Group>(null);
  const playedPassRef = useRef<Record<number, boolean>>({});

  useEffect(() => {
    if (phase === 'FLASHBACK_REWIND') {
      playedPassRef.current = {};
    }
  }, [phase]);

  // Kích hoạt âm thanh vút gió khi từng ảnh bay qua
  useFrame(() => {
    if (phase === 'FLASHBACK_REWIND' && groupRef.current) {
      // Nhẹ nhàng phát tiếng woosh định kỳ
    }
  });

  if (phase === 'IDLE' || phase === 'STUDENT_REVEAL') {
    return null; // Tối ưu: ẩn hoàn toàn khi không trong pha tua ngược
  }

  return (
    <group ref={groupRef}>
      {FLASHBACK_ITEMS.map((item, idx) => (
        <Monolith
          key={item.id}
          item={item}
          index={idx}
          phase={phase}
        />
      ))}
    </group>
  );
};
