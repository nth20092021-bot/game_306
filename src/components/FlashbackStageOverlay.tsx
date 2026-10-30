import React, { useEffect, useRef, useState } from 'react';
import { type HistoricalFlashbackItem, resolveAssetUrl } from '../data/historicalFlashbacks';
import { soundEngine } from '../utils/soundEngine';

interface FlashbackStageOverlayProps {
  items: HistoricalFlashbackItem[];
  isActive: boolean;
  totalDurationMs?: number;
  onSequenceComplete?: () => void;
}

interface WarpStar {
  x: number;
  y: number;
  z: number;
  prevZ: number;
  color: string;
  size: number;
}

export function cleanFlashbackTitle(rawText = '') {
  return rawText
    .replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{FE0F}\s]+/gu, '')
    .trim();
}

export const FlashbackStageOverlay: React.FC<FlashbackStageOverlayProps> = ({
  items,
  isActive,
  totalDurationMs = 11500,
  onSequenceComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sweepTrigger, setSweepTrigger] = useState(0);
  const warpCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const burstVelocityRef = useRef(1.0);

  const slideDurationMs = Math.max(Math.floor(totalDurationMs / Math.max(items.length, 1)), 760);
  const currentItem = items[currentIndex] || items[0];

  // 1. ENGINE CANVAS 60FPS: VỆT SAO CHẠY NGƯỢC VỀ PHÍA SAU (REVERSE TIME-WARP STARFIELD)
  useEffect(() => {
    if (!isActive) return;
    const canvas = warpCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#fde68a', '#fbbf24', '#fffbeb', '#f59e0b', '#bae6fd'];
    const maxDepth = 1200;
    const starCount = 320;
    const stars: WarpStar[] = Array.from({ length: starCount }, () => {
      const z = Math.random() * maxDepth + 40;
      return {
        x: (Math.random() - 0.5) * width * 2.4,
        y: (Math.random() - 0.5) * height * 2.4,
        z,
        prevZ: z,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 1.0 + Math.random() * 1.8,
      };
    });

    const renderWarp = () => {
      // Làm mờ nhẹ nền tạo vệt đuôi sao (Motion Trail)
      ctx.fillStyle = 'rgba(8, 6, 4, 0.34)';
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.48;

      // Tốc độ vệt sao tăng vọt mỗi khi chuyển cảnh rồi êm dần (Micro-velocity pulse)
      burstVelocityRef.current += (1.0 - burstVelocityRef.current) * 0.08;
      const speed = 18.5 * burstVelocityRef.current;

      for (let i = 0; i < starCount; i++) {
        const s = stars[i];
        s.prevZ = s.z;

        // ĐI LÙI VỀ PHÍA SAU: z tăng dần (các vệt sao từ xung quanh người xem lao thẳng về điểm hút phía sau!)
        s.z += speed;
        if (s.z >= maxDepth) {
          s.z = 35;
          s.prevZ = 35;
          const angle = Math.random() * Math.PI * 2;
          const dist = 180 + Math.random() * Math.max(width, height) * 0.95;
          s.x = Math.cos(angle) * dist;
          s.y = Math.sin(angle) * dist;
        }

        const k = 420 / s.z;
        const px = cx + s.x * k;
        const py = cy + s.y * k;

        const prevK = 420 / Math.max(s.prevZ - speed * 1.9, 25);
        const prevX = cx + s.x * prevK;
        const prevY = cy + s.y * prevK;

        const depthAlpha = Math.min(1, (maxDepth - s.z) / (maxDepth * 0.65)) * Math.min(1, (s.z - 35) / 90);

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(px, py);
        ctx.strokeStyle = s.color;
        ctx.globalAlpha = Math.max(0, depthAlpha * 0.88);
        ctx.lineWidth = Math.max(0.6, s.size * k * 0.55);
        ctx.lineCap = 'round';
        ctx.stroke();

        // Đốm sáng đầu vệt sao
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.8, s.size * k * 0.45), 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = Math.max(0, depthAlpha);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(renderWarp);
    };

    animId = requestAnimationFrame(renderWarp);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive]);

  // 2. BỘ ĐẾM CHUYỂN CẢNH ẢNH LỊCH SỬ & KÍCH HOẠT XUNG TỐC ĐỘ SAO
  useEffect(() => {
    if (!isActive || items.length === 0) {
      setCurrentIndex(0);
      return;
    }

    soundEngine.playCameraShutter();
    burstVelocityRef.current = 2.6;
    setSweepTrigger((prev) => prev + 1);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev < items.length - 1) {
          soundEngine.playCameraShutter();
          burstVelocityRef.current = 2.6;
          setSweepTrigger((s) => s + 1);
          return prev + 1;
        } else {
          clearInterval(interval);
          if (onSequenceComplete) {
            setTimeout(() => onSequenceComplete(), 480);
          }
          return prev;
        }
      });
    }, slideDurationMs);

    return () => clearInterval(interval);
  }, [isActive, items.length, slideDurationMs, onSequenceComplete]);

  if (!isActive || !currentItem) return null;

  const progressPercent = ((currentIndex + 1) / Math.max(items.length, 1)) * 100;

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex flex-col items-center justify-between py-5 px-4 select-none overflow-hidden">
      <style>{`
        @keyframes compassSpinSlow {
          from {
            transform: translate(-50%, -50%) rotate(360deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(0deg);
          }
        }
        @keyframes subtleFloatCard {
          0%, 100% {
            transform: translateY(0px) rotateX(0.8deg) rotateY(-0.8deg);
          }
          50% {
            transform: translateY(-6px) rotateX(-0.8deg) rotateY(0.8deg);
          }
        }
        @keyframes silkyLightWaveSweep {
          0% {
            transform: translate3d(-145%, 0, 0) skewX(-24deg) scaleX(0.8);
            opacity: 0;
          }
          22% {
            opacity: 0.95;
          }
          65% {
            transform: translate3d(145%, 0, 0) skewX(-24deg) scaleX(1.2);
            opacity: 0.75;
          }
          100% {
            transform: translate3d(215%, 0, 0) skewX(-24deg) scaleX(1.0);
            opacity: 0;
          }
        }
        @keyframes shockwavePulse {
          0% {
            transform: translate(-50%, -50%) scale(0.75);
            opacity: 0.65;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.45);
            opacity: 0;
          }
        }
      `}</style>

      {/* 1. CANVAS 3D VỆT SAO CHẠY LÙI VỀ PHÍA SAU (REVERSE STARFIELD) */}
      <canvas ref={warpCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Vòng La Bàn Thời Gian mảnh tinh tế xoay quanh điểm hút trung tâm */}
      <div className="absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2 w-[min(90vw,860px)] aspect-square rounded-full border border-amber-400/20 pointer-events-none">
        <div className="absolute inset-4 rounded-full border border-dashed border-amber-300/25 animate-[spin_28s_linear_infinite_reverse]" />
        <div className="absolute inset-12 rounded-full border border-amber-500/15 animate-[spin_18s_linear_infinite]" />
      </div>

      {/* Xung sóng ánh sáng mảnh mỗi khi chụp ảnh ký ức */}
      <div
        key={`shock-${sweepTrigger}`}
        className="absolute left-1/2 top-[47%] w-[640px] h-[420px] rounded-3xl border border-amber-300/50 pointer-events-none"
        style={{ animation: `shockwavePulse ${slideDurationMs}ms cubic-bezier(0.16, 1, 0.3, 1) forwards` }}
      />

      {/* 2. THANH TRẠNG THÁI & THƯỚC ĐO HÀNH TRÌNH LỊCH SỬ PHÍA TRÊN */}
      <div className="w-full max-w-5xl flex flex-col gap-2 z-10">
        <div className="w-full flex items-center justify-between text-xs uppercase tracking-widest text-amber-200 font-semibold">
          <div className="px-4 py-1.5 rounded-full bg-stone-950/85 border border-amber-400/45 shadow-lg backdrop-blur-md flex items-center gap-2.5">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>KÝ ỨC LỊCH SỬ</span>
            <span className="text-amber-400 font-bold">
              {currentItem.code} ({currentIndex + 1}/{items.length})
            </span>
          </div>

          <div className="px-4 py-1.5 rounded-full bg-stone-950/85 border border-amber-400/40 text-amber-300 backdrop-blur-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400/80 animate-ping" />
            <span className="font-semibold tracking-wider text-xs">ĐANG ĐI NGƯỢC VỀ QUÁ KHỨ</span>
          </div>
        </div>

        {/* Thanh thước đo thời gian tua ngược tinh tế */}
        <div className="w-full h-1 rounded-full bg-stone-900/80 overflow-hidden border border-amber-500/20">
          <div
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-200 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. KHUNG ẢNH KÝ ỨC 3D LƠ LỬNG GIỮA TÂM BÃO SAO BĂNG */}
      <div
        className="relative flex-1 w-full flex items-center justify-center my-2 z-10"
        style={{ perspective: '1400px' }}
      >
        <div
          className="relative w-[min(76vw,740px)] aspect-[16/10]"
          style={{
            transformStyle: 'preserve-3d',
            animation: 'subtleFloatCard 4.5s ease-in-out infinite',
          }}
        >
          {items.map((slide, idx) => {
            const offset = idx - currentIndex;
            if (offset < -1 || offset > 2) return null;
            const isCurrent = offset === 0;
            const isPast = offset === -1;
            const isNext = offset === 1;

            const translateZ = isCurrent ? '0px' : isPast ? '-240px' : isNext ? '140px' : '260px';
            const translateY = isCurrent ? '0px' : isPast ? '-16px' : isNext ? '14px' : '28px';
            const scale = isCurrent ? 1.0 : isPast ? 0.68 : isNext ? 1.14 : 1.25;
            const opacity = isCurrent ? 1 : isPast ? 0 : isNext ? 0.0 : 0;

            return (
              <div
                key={slide.id}
                className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-amber-400/70 shadow-[0_0_90px_rgba(245,158,11,0.42)] bg-stone-950 will-change-transform"
                style={{
                  transition: `all ${Math.round(slideDurationMs * 0.78)}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                  opacity,
                  transform: `translate3d(0px, ${translateY}, ${translateZ}) scale(${scale})`,
                  filter: isCurrent ? 'brightness(1.06) contrast(1.06) sepia(0.1) blur(0px)' : 'brightness(1.3) sepia(0.5) blur(6px)',
                  zIndex: isCurrent ? 10 : isPast ? 5 : 1,
                }}
              >
                <img
                  src={resolveAssetUrl(slide.imageUrl)}
                  alt={slide.title}
                  loading="eager"
                  className="w-full h-full object-cover object-center transition-transform duration-1000 scale-105"
                />

                {/* Lớp phủ chiều sâu điện ảnh */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-transparent to-stone-950/25" />

                {/* Vệt Sáng Ký Ức quét ngang qua bức ảnh */}
                {isCurrent && (
                  <div
                    key={`streak-${sweepTrigger}`}
                    className="absolute -inset-y-24 w-72 pointer-events-none z-10"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(251,191,36,0.45) 32%, rgba(255,255,255,0.95) 50%, rgba(245,158,11,0.45) 68%, rgba(255,255,255,0) 100%)',
                      filter: 'blur(8px)',
                      mixBlendMode: 'screen',
                      animation: `silkyLightWaveSweep ${slideDurationMs}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
                    }}
                  />
                )}

                {/* 4 Góc Khung Ngắm Cổ Điển Tinh Tế */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-300/90 z-20" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-300/90 z-20" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-300/90 z-20" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-300/90 z-20" />

                {/* Nhãn Niên Đại trên góc trái ảnh */}
                <div className="absolute top-4 left-5 px-3 py-1 rounded-md bg-stone-950/85 border border-amber-400/50 text-amber-300 text-xs font-bold tracking-wider z-20 flex items-center gap-2 shadow-md">
                  <span>{slide.code}</span>
                  <span className="text-amber-500">•</span>
                  <span className="text-amber-100">{cleanFlashbackTitle(slide.era)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. BẢNG CHÚ THÍCH LỊCH SỬ CỔ ĐIỂN PHÍA DƯỚI (MỞ RỘNG VÀ CHỐNG RƠI CHỮ) */}
      <div className="w-full max-w-2xl md:max-w-3xl rounded-2xl bg-stone-950/90 border border-amber-500/50 px-6 py-4 text-center backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.85)] z-10 transition-all duration-300">
        <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-1.5 flashback-era">
          {cleanFlashbackTitle(currentItem.era)}
        </div>
        <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-amber-100 tracking-wide uppercase mb-2 leading-snug flashback-title text-balance">
          {cleanFlashbackTitle(currentItem.title)}
        </h3>
        <p className="text-xs md:text-sm text-stone-300 leading-relaxed max-w-2xl mx-auto flashback-description text-balance">
          {currentItem.description}
        </p>
      </div>
    </div>
  );
};
