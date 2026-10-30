import React from 'react';
import { Settings, Volume2, VolumeX, RotateCcw, Play } from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';
import { Student2DModel } from '../models/Student2DModel';

export const MainHUD: React.FC = () => {
  const phase = useGameStore((s) => s.phase);
  const chosenStudent = useGameStore((s) => s.chosenStudent);
  const settings = useGameStore((s) => s.settings);
  const startSequence = useGameStore((s) => s.startSequence);
  const resetToIdle = useGameStore((s) => s.resetToIdle);
  const setIsSettingsOpen = useGameStore((s) => s.setIsSettingsOpen);
  const updateSettings = useGameStore((s) => s.updateSettings);

  const isIdle = phase === 'IDLE';
  const isReveal = phase === 'STUDENT_REVEAL';
  const isCinematicRunning = !isIdle && !isReveal;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden z-20">
      {/* --- HEADER PHÍA TRÊN --- */}
      <header
        className={`flex items-start justify-between transition-opacity duration-700 ${
          isCinematicRunning ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* TIÊU ĐỀ TỐI GIẢN (CHỈ ĐỂ CHỮ: ĐỒNG HỒ THỜI GIAN) */}
        <div>
          {isIdle && (
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-slate-100 drop-shadow-md">
              ĐỒNG HỒ THỜI GIAN
            </h1>
          )}
        </div>

        {/* NÚT TIỆN ÍCH GÓC PHẢI (ÂM THANH & CÀI ĐẶT) */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Nút bật/tắt âm thanh */}
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            aria-label="Bật tắt âm thanh"
            className="w-10 h-10 rounded-full flex items-center justify-center glass-btn text-slate-300 hover:text-chrono-glow"
          >
            {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Nút bánh răng cài đặt */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Cài đặt hệ thống"
            className="w-10 h-10 rounded-full flex items-center justify-center glass-btn text-slate-300 hover:text-chrono-glow group"
          >
            <Settings size={18} className="group-hover:rotate-45 transition-transform duration-300" />
          </button>
        </div>
      </header>

      {/* --- SÂN KHẤU VINH DANH HỌC SINH 2D (LIVE2D-STYLE LAYERED SVG) --- */}
      {isReveal && chosenStudent && (
        <div className="pointer-events-auto flex-1 flex flex-col items-center justify-center my-auto z-20 animate-fade-in">
          {/* Nhân Vật Học Sinh 2D Đa Lớp (Spotlight vàng ấm + Bục Neon 2.5D phát sáng) */}
          <Student2DModel
            student={chosenStudent}
            showSpotlight={true}
            showPedestal={true}
          />

          {/* Huy Hiệu Tên Học Sinh Tối Giản Duy Nhất (CHỈ HIỆN TÊN HỌC SINH) */}
          <div className="mt-3 px-10 py-3.5 rounded-3xl glass-panel border border-chrono-gold/70 shadow-[0_0_35px_rgba(212,175,55,0.4)] backdrop-blur-2xl">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wider drop-shadow-lg">
              {chosenStudent.name.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* --- KHU VỰC ĐIỀU KHIỂN PHÍA DƯỚI --- */}
      <footer className="pointer-events-auto flex flex-col items-center justify-center mb-2 z-20">
        {/* NÚT BẮT ĐẦU (GIAO DIỆN CHÍNH IDLE) */}
        {isIdle && (
          <div className="flex flex-col items-center">
            <button
              onClick={startSequence}
              className="relative group px-12 py-4 rounded-full overflow-hidden glass-btn border border-chrono-gold/50 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {/* Ánh sáng quét viền hào quang */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-chrono-gold/20 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out"></div>

              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-chrono-gold shadow-[0_0_12px_#d4af37]"></span>
                <span className="font-serif text-lg tracking-[0.25em] font-bold text-slate-100 group-hover:text-chrono-glow transition-colors">
                  BẮT ĐẦU
                </span>
              </div>
            </button>
          </div>
        )}

        {/* CẶP NÚT THAO TÁC TIẾP TỤC TRONG PHA VINH DANH */}
        {isReveal && chosenStudent && (
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in mt-1">
            {/* Nút Quay Tiếp */}
            <button
              onClick={startSequence}
              className="px-8 py-3 rounded-full flex items-center gap-2.5 glass-btn border-chrono-gold/60 text-chrono-glow font-serif tracking-wider font-semibold text-sm shadow-xl hover:scale-105 active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              QUAY TIẾP
            </button>

            {/* Nút Trở Về Đồng Hồ */}
            <button
              onClick={resetToIdle}
              className="px-7 py-3 rounded-full flex items-center gap-2 glass-btn text-slate-300 hover:text-white font-sans text-sm tracking-wide hover:scale-105 active:scale-95"
            >
              <RotateCcw size={15} />
              TRỞ VỀ ĐỒNG HỒ
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};
