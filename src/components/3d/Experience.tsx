import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import confetti from 'canvas-confetti';
import { TimeRewindClockModel } from '../models/TimeRewindClockModel';
import { TemporalParticles } from './TemporalParticles';
import { ShockwaveRing } from './ShockwaveRing';
import { CinematicCameraRig } from './CinematicCameraRig';
import { LightingAndEnvironment } from './LightingAndEnvironment';
import { PostProcessingPipeline } from './PostProcessingPipeline';
import { useGameStore } from '../../stores/useGameStore';

export const Experience: React.FC = () => {
  const phase = useGameStore((s) => s.phase);
  const clockRewindSpeed = useGameStore((s) => s.clockRewindSpeed);
  const clockGlowIntensity = useGameStore((s) => s.clockGlowIntensity);

  // Bảo vệ DeltaTime khi chuyển tab lâu không bị giật lag
  useEffect(() => {
    const onVisibilityChange = () => {
      // Khi tab hoạt động lại, tránh dồn đống animation
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  // Bắn pháo hoa giấy chúc mừng CHỈ KHI Ở PHA STUDENT_REVEAL (tuyệt đối không bắn lúc đang chạy Flashback)
  useEffect(() => {
    if (phase !== 'STUDENT_REVEAL') {
      confetti.reset();
      return;
    }

    const colors = ['#fbbf24', '#f59e0b', '#38bdf8', '#e11d48', '#ffffff', '#a855f7'];

    // 1. Pháo nổ tung cánh sao ban đầu rực rỡ
    confetti({
      particleCount: 90,
      spread: 90,
      origin: { y: 0.65 },
      colors: colors,
    });

    // 2. Mưa pháo hoa giấy rơi liên tục 4 giây chúc mừng
    let animId: number;
    const end = Date.now() + 4000;

    const frame = () => {
      if (Date.now() >= end) return;
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.72 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.72 },
        colors: colors,
      });
      animId = requestAnimationFrame(frame);
    };

    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
      confetti.reset();
    };
  }, [phase]);

  // Chỉ hiện Đồng Hồ trong pha IDLE và CAMERA_DIVE!
  const showClock = phase === 'IDLE' || phase === 'CAMERA_DIVE';

  return (
    <div className="relative w-full h-full select-none">
      <Canvas
        shadows
        camera={{ position: [0, 0, 7.8], fov: 46, near: 0.1, far: 200 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        dpr={[1, 2]}
      >
        <LightingAndEnvironment />
        <CinematicCameraRig />

        {/* MÔ HÌNH ĐỒNG HỒ CỔ ĐIỂN TUA NGƯỢC THỜI GIAN */}
        {showClock && (
          <group position={[0, 0, 0]}>
            <TimeRewindClockModel
              rewindSpeed={clockRewindSpeed}
              glowIntensity={clockGlowIntensity}
              scale={1}
            />
          </group>
        )}

        {/* PHẦN ĂN MỪNG DÙNG MODEL HỌC SINH 2D TRÊN HUD (THEO YÊU CẦU: KHÔNG CẦN NHÂN VẬT 3D) */}

        {/* HỆ THỐNG HẠT BỤI VÀNG THỜI GIAN BAY XUYÊN KHÔNG GIAN */}
        <TemporalParticles />

        {/* SÓNG XUNG KÍCH ĐIỂM KỲ DỊ */}
        <ShockwaveRing />

        {/* HẬU KỲ ĐIỆN ẢNH AAA (ĐÃ GIẢM BLOOM CHỐNG CHÁY SÁNG ÁO TRẮNG) */}
        <PostProcessingPipeline />
      </Canvas>
    </div>
  );
};
