// src/components/FlashbackMemorySequence.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../utils/soundEngine';

export interface HistoricalSlide {
  id: string;
  title: string;
  era: string;
  imageUrl: string;
  description?: string;
}

interface FlashbackMemorySequenceProps {
  slides: HistoricalSlide[];
  active: boolean;
  /** Thời gian hiển thị mỗi bức ảnh ký ức (giây), mặc định 1.35s để nhìn rõ chi tiết + nghe tiếng chụp ảnh */
  slideDuration?: number;
  onComplete?: () => void;
  onSlideChange?: (index: number, slide: HistoricalSlide) => void;
}

const memoryCardVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const memoryCardFragmentShader = `
  uniform sampler2D uTexture;
  uniform float uHasTexture;
  uniform float uProgress; // 0.0 -> 1.0 trong vòng đời của 1 bức ảnh
  uniform vec3 uFallbackColor;
  varying vec2 vUv;

  void main() {
    // 1. Hiệu ứng Zoom nhẹ nhàng kiểu phim tài liệu (Ken Burns Effect)
    vec2 centeredUv = (vUv - 0.5) * (1.0 - uProgress * 0.07) + 0.5;

    // 2. Lấy màu ảnh gốc trung thực, sắc nét (không áp sepia làm nhạt màu ảnh thật của người dùng)
    vec3 baseColor = uFallbackColor;
    if (uHasTexture > 0.5) {
      vec4 texColor = texture2D(uTexture, centeredUv);
      baseColor = texColor.rgb;
    }

    // 3. VỆT SÁNG KÝ ỨC QUÉT NGANG (MEMORY LIGHT STREAK)
    // Quét mượt mà từ trái qua phải trong 55% thời gian đầu của bức ảnh
    float streakPos = mix(-0.6, 1.6, clamp(uProgress * 2.0, 0.0, 1.0));
    float diagCoord = vUv.x * 0.85 + vUv.y * 0.35;
    float streakBeam = smoothstep(0.24, 0.0, abs(diagCoord - streakPos));
    float streakCore = smoothstep(0.07, 0.0, abs(diagCoord - streakPos));

    // Chớp sáng màn trập máy ảnh cơ (Shutter Flash) ở 0.0 -> 0.10 đầu tiên
    float shutterFlash = smoothstep(0.12, 0.0, uProgress) * 0.45;

    // Viền khung ảnh phát sáng vàng kim tinh tế
    float border = smoothstep(0.018, 0.0, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));

    vec3 streakColor = vec3(1.0, 0.94, 0.78) * streakBeam * 0.75 + vec3(1.0, 1.0, 1.0) * streakCore * 0.95;
    vec3 finalRgb = baseColor + streakColor + vec3(shutterFlash) + vec3(0.95, 0.82, 0.45) * border * 0.5;

    // 4. HIỆU ỨNG HIỆN LÊN RÕ NÉT RỒI MỜ DẦN CHUYỂN QUA KÝ ỨC KHÁC (SMOOTH FADE IN & FADE OUT)
    // Hiện lên ngay trong 8% đầu, giữ nguyên 100% rõ nét suốt 77%, rồi mờ dần ở 15% cuối
    float fadeIn = smoothstep(0.0, 0.08, uProgress);
    float fadeOut = 1.0 - smoothstep(0.85, 1.0, uProgress);
    float alpha = fadeIn * fadeOut;

    gl_FragColor = vec4(finalRgb, alpha);
  }
`;

export const FlashbackMemorySequence: React.FC<FlashbackMemorySequenceProps> = ({
  slides,
  active,
  slideDuration = 1.35,
  onComplete,
  onSlideChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const localTimerRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);
  const lightStreakMeshRef = useRef<THREE.Mesh>(null);
  const textureCacheRef = useRef<Map<string, THREE.Texture>>(new Map());
  const [hasValidTexture, setHasValidTexture] = useState(false);

  const currentSlide = slides[currentIndex] || slides[0] || {
    id: '11',
    title: 'KÝ ỨC THỜI GIAN',
    era: 'TƯ LIỆU LỊCH SỬ',
    imageUrl: '/assets/flashback/flashback_11.jpg',
  };

  const uniforms = useMemo(
    () => ({
      uTexture: { value: new THREE.Texture() },
      uHasTexture: { value: 0.0 },
      uProgress: { value: 0.0 },
      uFallbackColor: { value: new THREE.Color('#0d1527') },
    }),
    []
  );

  // 1. TIỀN TẢI (PRELOAD) TOÀN BỘ TEXTURE LÊN BỘ NHỚ GPU NGAY LẬP TỨC
  // Để khi chuyển slide là hiện ảnh tức thì trong 0ms, không bị nháy đen hay trễ mạng!
  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const loader = new THREE.TextureLoader();

    slides.forEach((slide) => {
      if (!textureCacheRef.current.has(slide.imageUrl)) {
        loader.load(
          slide.imageUrl,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.generateMipmaps = true;
            textureCacheRef.current.set(slide.imageUrl, tex);

            // Nếu đây là slide đang chọn, gán ngay vào uniform
            if (slide.imageUrl === currentSlide.imageUrl) {
              uniforms.uTexture.value = tex;
              uniforms.uHasTexture.value = 1.0;
              setHasValidTexture(true);
            }
          },
          undefined,
          () => {
            // Không tải được ảnh
          }
        );
      }
    });
  }, [slides, currentSlide.imageUrl, uniforms]);

  // 2. GÁN TEXTURE KHI CHUYỂN SANG SLIDE MỚI
  useEffect(() => {
    if (!active) {
      setCurrentIndex(0);
      localTimerRef.current = 0;
      return;
    }

    if (onSlideChange && slides[currentIndex]) {
      onSlideChange(currentIndex, slides[currentIndex]);
    }

    const cached = textureCacheRef.current.get(currentSlide.imageUrl);
    if (cached) {
      uniforms.uTexture.value = cached;
      uniforms.uHasTexture.value = 1.0;
      setHasValidTexture(true);
    } else {
      // Tải khẩn cấp nếu chưa có trong cache
      const loader = new THREE.TextureLoader();
      loader.load(
        currentSlide.imageUrl,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          textureCacheRef.current.set(currentSlide.imageUrl, tex);
          uniforms.uTexture.value = tex;
          uniforms.uHasTexture.value = 1.0;
          setHasValidTexture(true);
        },
        undefined,
        () => {
          uniforms.uHasTexture.value = 0.0;
          setHasValidTexture(false);
        }
      );
    }

    // Phát âm thanh chụp ảnh cơ ("TÁCH - XOẠCH!") đồng bộ với mỗi bức ảnh
    soundEngine.playCameraShutter();
  }, [currentIndex, active, currentSlide.imageUrl, uniforms, slides, onSlideChange]);

  // 3. VÒNG LẶP RENDER & CẬP NHẬT HIỆU ỨNG TRÔI 3D
  useFrame((_, delta) => {
    if (!active) return;

    localTimerRef.current += delta;
    const progress = Math.min(localTimerRef.current / slideDuration, 1.0);
    uniforms.uProgress.value = progress;

    // Chuyển động trôi nhẹ của bức ảnh về phía người xem (Ken Burns 3D float)
    if (groupRef.current) {
      groupRef.current.position.z = THREE.MathUtils.lerp(-0.25, 0.35, progress);
      groupRef.current.rotation.z = Math.sin(currentIndex * 1.5) * 0.015 * (1 - progress);
    }

    // Vệt sáng ký ức 3D (Light Streak Ribbon) quét nhanh qua mặt bức ảnh
    if (lightStreakMeshRef.current) {
      const streakX = THREE.MathUtils.lerp(-5.0, 5.0, Math.min(progress * 1.9, 1.0));
      lightStreakMeshRef.current.position.x = streakX;
      const mat = lightStreakMeshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.sin(Math.min(progress * 1.9, 1.0) * Math.PI) * 0.85;
    }

    // Chuyển sang bức ảnh ký ức tiếp theo
    if (localTimerRef.current >= slideDuration) {
      localTimerRef.current = 0;
      if (currentIndex < slides.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (onComplete) {
        onComplete();
      }
    }
  });

  if (!active) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* KHUNG ẢNH KÝ ỨC LỊCH SỬ 16:9 CHUẨN ĐIỆN ẢNH */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[4.8, 2.7, 32, 32]} />
        <shaderMaterial
          vertexShader={memoryCardVertexShader}
          fragmentShader={memoryCardFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* VỆT SÁNG KÝ ỨC 3D LƯỚT NGANG (MEMORY LIGHT STREAK RIBBON) */}
      <mesh ref={lightStreakMeshRef} position={[-5.0, 0, 0.08]} rotation={[0, 0, -0.32]}>
        <planeGeometry args={[0.75, 4.0]} />
        <meshBasicMaterial
          color="#fef08a"
          transparent
          opacity={0.0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* THÔNG TIN KÝ ỨC VÀ NIÊN ĐẠI PHÍA DƯỚI KHUNG HÌNH */}
      <group position={[0, -1.58, 0.05]}>
        {/* Nền badge bóng mờ bảo đảm chữ luôn đọc rõ trên mọi nền */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[4.6, 0.38]} />
          <meshBasicMaterial color="#020617" transparent opacity={0.65} depthWrite={false} />
        </mesh>

        <Text
          position={[0, 0, 0]}
          fontSize={0.165}
          color="#fde047"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor="#0f172a"
        >
          {`${currentSlide.era} — ${currentSlide.title}`}
        </Text>
      </group>

      {/* Thông báo nếu chưa có ảnh trong thư mục */}
      {!hasValidTexture && (
        <Text
          position={[0, 0, 0.05]}
          fontSize={0.14}
          color="#cbd5e1"
          anchorX="center"
          anchorY="middle"
        >
          {`[Ký ức #${currentSlide.id}: Đang nạp ${currentSlide.imageUrl}]`}
        </Text>
      )}
    </group>
  );
};
