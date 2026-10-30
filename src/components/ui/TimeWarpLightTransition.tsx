// src/components/ui/TimeWarpLightTransition.tsx
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';

export const TimeWarpLightTransition: React.FC = () => {
  const phase = useGameStore((s) => s.phase);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    let animId: number;
    let startTime: number | null = null;

    if (phase === 'CAMERA_DIVE') {
      const duration = 2400; // 2.4s dive

      const animateBurst = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const p = Math.min(elapsed / duration, 1);

        // Bừng sáng dần từ tâm: 0s -> 1.0s sáng nhẹ (0 -> 0.25), 1.0s -> 2.4s bùng sáng cực đại phủ trắng màn hình (0.25 -> 1.0)
        let curOpacity = 0;
        if (p > 0.3) {
          const curve = (p - 0.3) / 0.7;
          curOpacity = Math.pow(curve, 1.8);
        }
        setOpacity(curOpacity);

        if (p < 1) {
          animId = requestAnimationFrame(animateBurst);
        } else {
          setOpacity(1);
        }
      };

      animId = requestAnimationFrame(animateBurst);
    } else if (phase === 'FLASHBACK_REWIND') {
      // Khi vừa bước vào Flashback, màn hình đang trắng sáng rực rỡ và mờ dần (Whiteout Dissolve)
      const fadeDuration = 800; // 0.8s
      let fadeStart: number | null = null;

      const animateFadeOut = (timestamp: number) => {
        if (!fadeStart) fadeStart = timestamp;
        const elapsed = timestamp - fadeStart;
        const p = Math.min(elapsed / fadeDuration, 1);
        const curOpacity = 1 - Math.sin((p * Math.PI) / 2); // Easing mượt
        setOpacity(Math.max(0, curOpacity));

        if (p < 1) {
          animId = requestAnimationFrame(animateFadeOut);
        } else {
          setOpacity(0);
        }
      };

      animId = requestAnimationFrame(animateFadeOut);
    } else {
      setOpacity(0);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [phase]);

  if (opacity <= 0.005) return null;

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none transition-none flex items-center justify-center overflow-hidden"
      style={{
        opacity,
        background:
          opacity > 0.82
            ? 'linear-gradient(135deg, #ffffff 0%, #fffbeb 50%, #fef08a 100%)'
            : 'radial-gradient(circle at 50% 50%, rgba(255,255,255,1) 0%, rgba(254,240,138,0.95) 42%, rgba(245,158,11,0.85) 75%, rgba(180,83,9,0.5) 100%)',
        mixBlendMode: opacity > 0.82 ? 'normal' : 'screen',
      }}
    >
      {/* Vòng hào quang bung tỏa từ tâm */}
      <div
        className="w-[120vw] h-[120vw] rounded-full blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #ffffff 0%, rgba(254,240,138,0.8) 45%, transparent 75%)',
          transform: `scale(${0.8 + opacity * 0.8})`,
        }}
      />
    </div>
  );
};
