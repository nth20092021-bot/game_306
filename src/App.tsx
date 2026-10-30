import React, { useMemo } from 'react';
import { Experience } from './components/3d/Experience';
import { MainHUD } from './components/ui/MainHUD';
import { SettingsModal } from './components/ui/SettingsModal';
import { FlashbackStageOverlay } from './components/FlashbackStageOverlay';
import { TimeWarpLightTransition } from './components/ui/TimeWarpLightTransition';
import { useGameStore } from './stores/useGameStore';

export const App: React.FC = () => {
  const phase = useGameStore((s) => s.phase);
  const setPhase = useGameStore((s) => s.setPhase);
  const flashbackItems = useGameStore((s) => s.flashbackItems);
  const settings = useGameStore((s) => s.settings);

  // Lọc danh sách ảnh theo cài đặt:
  // Mặc định 'range_1_6': phát ngược từ ảnh #06 về ảnh #01 (flashback_06.jpg -> flashback_01.jpg)
  const displayItems = useMemo(() => {
    if (settings.flashbackScope === 'range_1_6') {
      const filtered = flashbackItems.filter((it) => it.id >= 1 && it.id <= 6);
      const list = filtered.length > 0 ? filtered : flashbackItems.slice(0, 6);
      return [...list].sort((a, b) => b.id - a.id);
    }
    if (settings.flashbackScope === 'uploaded_11_up') {
      const filtered = flashbackItems.filter((it) => it.id >= 11);
      return filtered.length > 0 ? filtered : flashbackItems;
    }
    return flashbackItems;
  }, [flashbackItems, settings.flashbackScope]);

  const totalDurationMs =
    settings.flashbackScope === 'range_1_6'
      ? Math.max(displayItems.length * 1400, 8400)
      : settings.flashbackScope === 'uploaded_11_up'
      ? Math.max(displayItems.length * 1350, 5400)
      : settings.flashbackDuration * 1000;

  // Phát hiện nếu đang chạy trong trình duyệt nhúng của Messenger/Facebook
  const isMessenger = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
    return /FBAN|FBAV|FB_IAB|Messenger|FB4A|FBIOS/i.test(ua);
  }, []);

  const handleOpenChrome = () => {
    const rawUrl = window.location.href.replace(/^https?:\/\//i, '');
    if (/Android/i.test(navigator.userAgent)) {
      window.location.href = `intent://${rawUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    } else {
      window.location.href = `googlechromes://${rawUrl}`;
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#050811]">
      {/* BANNER HƯỚNG DẪN MỞ BẰNG CHROME KHI ĐANG Ở TRONG MESSENGER */}
      {isMessenger && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between shadow-2xl border-b border-amber-400/40">
          <div className="flex items-center gap-2">
            <span className="text-base animate-bounce">👉</span>
            <span>
              Đang mở trong Messenger. Vui lòng bấm <strong className="text-amber-200">⋯</strong> (góc trên bên phải) ➔ chọn <strong>"Mở trong Chrome"</strong> để mượt mà nhất!
            </span>
          </div>
          <button
            onClick={handleOpenChrome}
            className="ml-3 shrink-0 px-3.5 py-1 bg-white text-slate-900 font-bold rounded-full shadow hover:bg-amber-100 text-xs transition-colors"
          >
            Mở Chrome
          </button>
        </div>
      )}

      {/* KHÔNG GIAN 3D WEBGL AAA CHÍNH */}
      <Experience />

      {/* GIAO DIỆN TỐI GIẢN ĐIỆN ẢNH (CINEMATIC HUD) */}
      <MainHUD />

      {/* HIỆU ỨNG PHÁT SÁNG BỪNG MÀN HÌNH CHỐNG CHỚP ĐEN (LIGHT WARP TRANSITION) */}
      <TimeWarpLightTransition />

      {/* TẦNG HIỂN THỊ FLASHBACK CHÍNH DIỆN: ĐẢM BẢO 100% HIỆN ẢNH + VỆT SÁNG KÝ ỨC + TIẾNG CHỤP ẢNH */}
      <FlashbackStageOverlay
        items={displayItems}
        isActive={phase === 'FLASHBACK_REWIND'}
        totalDurationMs={totalDurationMs}
        onSequenceComplete={() => setPhase('CLIMAX_BURST')}
      />

      {/* MODAL CÀI ĐẶT 28 HỌC SINH & ẢNH LỊCH SỬ */}
      <SettingsModal />
    </main>
  );
};

export default App;
