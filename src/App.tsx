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

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#050811]">
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
