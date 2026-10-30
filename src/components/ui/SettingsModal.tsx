import React, { useState } from 'react';
import {
  X,
  Users,
  Image as ImageIcon,
  Sliders,
  RotateCcw,
  Upload,
  Trash2,
  Maximize2,
  AlertCircle,
} from 'lucide-react';
import { useGameStore } from '../../stores/useGameStore';
import { Student2DModel } from '../models/Student2DModel';
import type { HistoricalFlashbackItem } from '../../data/historicalFlashbacks';
import { resolveAssetUrl } from '../../data/historicalFlashbacks';
import type { GraphicQuality } from '../../types';

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useGameStore((s) => s.isSettingsOpen);
  const setIsSettingsOpen = useGameStore((s) => s.setIsSettingsOpen);
  const students = useGameStore((s) => s.students);
  const setStudents = useGameStore((s) => s.setStudents);
  const updateStudent = useGameStore((s) => s.updateStudent);
  const selectedHistory = useGameStore((s) => s.selectedHistory);
  const resetSelectedPool = useGameStore((s) => s.resetSelectedPool);
  const resetStudentsToDefault = useGameStore((s) => s.resetStudentsToDefault);
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const flashbackItems = useGameStore((s) => s.flashbackItems);
  const updateFlashbackItem = useGameStore((s) => s.updateFlashbackItem);

  const [activeTab, setActiveTab] = useState<'students' | 'photos' | 'graphics'>('photos');
  const [bulkText, setBulkText] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  // Lưu trạng thái nạp ảnh bị lỗi của từng ảnh
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  if (!isSettingsOpen) return null;

  // Xử lý dán danh sách hàng loạt (mỗi dòng 1 tên)
  const handleApplyBulkStudents = () => {
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length > 0) {
      const newStudents = lines.map((name, idx) => ({
        id: idx + 1,
        name,
        gender: (idx % 2 === 0 ? 'male' : 'female') as 'male' | 'female',
        glasses: false,
      }));
      setStudents(newStudents);
      resetSelectedPool();
      setShowBulkInput(false);
      setBulkText('');
    }
  };

  // Xử lý tải ảnh lên trực tiếp từ máy (URL.createObjectURL)
  const handleFileUpload = (item: HistoricalFlashbackItem, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      updateFlashbackItem(item.id, { imageUrl: blobUrl });
      setImageErrors((prev) => ({ ...prev, [item.fileName]: false }));
    }
  };

  // Khôi phục ảnh mặc định
  const handleResetPhoto = (item: HistoricalFlashbackItem) => {
    updateFlashbackItem(item.id, { imageUrl: resolveAssetUrl(`assets/flashback/${item.fileName}`) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl glass-panel shadow-2xl border border-chrono-gold/30 overflow-hidden text-slate-100">
        {/* --- HEADER MODAL --- */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-chrono-gold/20 bg-chrono-deep/90">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-chrono-gold shadow-[0_0_8px_#d4af37]"></span>
            <h2 className="font-serif text-lg font-bold tracking-wider text-chrono-glow">
              QUẢN LÝ DỰ ÁN ĐỒNG HỒ THỜI GIAN
            </h2>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* --- TABS NAVIGATION --- */}
        <div className="flex border-b border-slate-700/50 bg-slate-900/60 px-6 gap-2">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-semibold tracking-wider transition-colors border-b-2 ${
              activeTab === 'photos'
                ? 'border-chrono-gold text-chrono-gold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon size={16} />
            BỘ SƯU TẬP ẢNH LỊCH SỬ ({flashbackItems.length})
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-semibold tracking-wider transition-colors border-b-2 ${
              activeTab === 'students'
                ? 'border-chrono-gold text-chrono-gold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={16} />
            DANH SÁCH HỌC SINH ({students.length})
          </button>

          <button
            onClick={() => setActiveTab('graphics')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-semibold tracking-wider transition-colors border-b-2 ${
              activeTab === 'graphics'
                ? 'border-chrono-gold text-chrono-gold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={16} />
            THỜI GIAN & ĐỒ HỌA
          </button>
        </div>

        {/* --- MODAL BODY --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BỘ SƯU TẬP ẢNH FLASHBACK VỚI THUMBNAIL THỰC TẾ & THÔNG TIN CHUẨN HOÁ */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-chrono-gold/30 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-chrono-gold flex items-center gap-1.5">
                    <span>📁 Thư mục lưu trữ:</span>
                    <code className="px-2 py-0.5 rounded bg-black/60 text-cyan-300 font-mono text-[11px]">
                      public/assets/flashback/
                    </code>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Toàn bộ 14 mốc lịch sử đã được hiệu đính chuẩn xác theo dòng chảy lịch sử Việt Nam. Bấm vào ảnh để phóng to!
                  </p>
                </div>
              </div>

              {/* GRID 14 ẢNH CÓ THUMBNAIL RÕ RÀNG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
                {flashbackItems.map((item) => {
                  const isCustom = item.imageUrl && !item.imageUrl.includes('assets/flashback/');
                  const isError = imageErrors[item.fileName];

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col rounded-xl overflow-hidden bg-slate-900/60 border border-slate-800 hover:border-chrono-gold/50 transition-all group"
                    >
                      {/* KHUNG THUMBNAIL ẢNH THỰC TẾ */}
                      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
                        {!isError ? (
                          <img
                            src={resolveAssetUrl(item.imageUrl)}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={() => setImageErrors((prev) => ({ ...prev, [item.fileName]: true }))}
                            onLoad={() => setImageErrors((prev) => ({ ...prev, [item.fileName]: false }))}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-3 text-center text-slate-500">
                            <AlertCircle size={24} className="text-amber-500/80 mb-1" />
                            <span className="text-[11px] text-slate-400 font-medium">Chưa có ảnh trong thư mục</span>
                            <span className="text-[10px] text-slate-600 font-mono">Dùng ảnh tải lên</span>
                          </div>
                        )}

                        {/* Nút phóng to ảnh xem thử */}
                        {!isError && (
                          <button
                            onClick={() => setSelectedPreviewImage(item.imageUrl)}
                            title="Phóng to ảnh"
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Maximize2 size={13} />
                          </button>
                        )}

                        {/* Badge số thứ tự */}
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm border border-chrono-gold/40 text-[10px] font-mono font-bold text-chrono-gold">
                          {item.code}
                        </div>
                      </div>

                      {/* THÔNG TIN SỰ KIỆN */}
                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-100 truncate" title={item.title}>
                              {item.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-chrono-cyan/90 font-medium mt-0.5 truncate" title={item.era}>
                            {item.era}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2" title={item.description}>
                            {item.description}
                          </p>

                          {/* Ghi chú lịch sử nếu có (ví dụ #11) */}
                          {item.historicalNote && (
                            <div className="mt-2 p-1.5 rounded bg-amber-500/10 border border-amber-500/25 text-[10px] text-amber-300/90 leading-tight">
                              {item.historicalNote}
                            </div>
                          )}
                        </div>

                        {/* THANH THAO TÁC / TRẠNG THÁI */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                          <span className="text-[10px] font-mono text-slate-400">
                            {item.fileName}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {isCustom ? (
                              <button
                                onClick={() => handleResetPhoto(item)}
                                title="Khôi phục ảnh gốc"
                                className="p-1 rounded text-red-400 hover:text-red-300"
                              >
                                <Trash2 size={13} />
                              </button>
                            ) : null}

                            <label className="cursor-pointer flex items-center gap-1 px-2.5 py-1 text-[11px] rounded glass-btn text-chrono-glow hover:bg-chrono-gold/20">
                              <Upload size={11} />
                              <span>{isCustom ? 'Đổi ảnh' : 'Chọn ảnh khác'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(item, e)}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: QUẢN LÝ 28 HỌC SINH */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-300">
                  Đã chọn:{' '}
                  <span className="text-chrono-gold font-bold">
                    {selectedHistory.length}/{students.length}
                  </span>{' '}
                  học sinh
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={resetSelectedPool}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg glass-btn text-slate-300 hover:text-chrono-glow"
                  >
                    <RotateCcw size={13} />
                    Đặt lại lượt chọn
                  </button>
                  <button
                    onClick={resetStudentsToDefault}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-medium"
                  >
                    <RotateCcw size={13} />
                    Khôi phục 28 bạn mặc định
                  </button>
                  <button
                    onClick={() => setShowBulkInput(!showBulkInput)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-chrono-gold/20 border border-chrono-gold/40 text-chrono-glow hover:bg-chrono-gold/30"
                  >
                    {showBulkInput ? 'Đóng nhập nhanh' : 'Dán danh sách hàng loạt'}
                  </button>
                </div>
              </div>

              {/* KHUNG NHẬP NHANH HÀNG LOẠT */}
              {showBulkInput && (
                <div className="p-4 rounded-xl bg-slate-900 border border-chrono-gold/30 space-y-3">
                  <label className="block text-xs font-semibold text-chrono-gold">
                    Dán danh sách tên học sinh (mỗi học sinh 1 dòng):
                  </label>
                  <textarea
                    rows={5}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="Nguyễn Văn A&#10;Trần Thị B&#10;Lê Hoàng C..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-chrono-gold"
                  ></textarea>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowBulkInput(false)}
                      className="px-3 py-1 text-xs rounded text-slate-400 hover:text-white"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleApplyBulkStudents}
                      className="px-4 py-1.5 text-xs rounded bg-chrono-gold text-slate-950 font-bold hover:bg-chrono-glow"
                    >
                      Áp dụng danh sách mới
                    </button>
                  </div>
                </div>
              )}

              {/* DANH SÁCH CHI TIẾT TỪNG HỌC SINH VỚI TÙY CHỈNH MODEL & GIỚI TÍNH */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {students.map((stu) => {
                  const isPicked = selectedHistory.includes(stu.id);
                  const isMale = stu.gender === 'male';
                  const currentHairColor = stu.hairColor || '#2c221a';

                  const hairColors = [
                    { label: 'Đen tự nhiên', value: '#1a1c22' },
                    { label: 'Hạt dẻ', value: '#2c221a' },
                    { label: 'Nâu sô-cô-la', value: '#3a261a' },
                    { label: 'Nâu sáng', value: '#483224' },
                    { label: 'Đen tuyền', value: '#121316' },
                  ];

                  return (
                    <div
                      key={stu.id}
                      className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${
                        isPicked
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400'
                          : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-chrono-gold/30'
                      }`}
                    >
                      {/* DÒNG 1: THUMBNAIL MODEL 2D, SỐ THỨ TỰ, TÊN VÀ TRẠNG THÁI */}
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {/* Thumbnail 2D Model Học Sinh */}
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-950 border border-chrono-gold/40 flex items-center justify-center shrink-0 shadow-md">
                            <div className="w-[120px] h-[150px] scale-[0.32] origin-top translate-y-[-6px]">
                              <Student2DModel student={stu} showSpotlight={false} showPedestal={false} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-mono font-bold text-chrono-gold/90">
                                #{String(stu.id).padStart(2, '0')}
                              </span>
                              <input
                                type="text"
                                value={stu.name}
                                onChange={(e) => updateStudent(stu.id, { name: e.target.value })}
                                className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-chrono-gold focus:outline-none text-xs font-semibold w-full text-slate-100 truncate"
                              />
                            </div>
                          </div>
                        </div>
                        {isPicked && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                            Đã chọn
                          </span>
                        )}
                      </div>

                      {/* DÒNG 2: NÚT ĐỔI GIỚI TÍNH, THƯ VIỆN 2D, KIỂU TÓC, MÀU TÓC & KÍNH */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-800/80 text-[11px]">
                        {/* Nút Đổi Giới Tính: Nam / Nữ */}
                        <button
                          type="button"
                          onClick={() => {
                            const nextGender = isMale ? 'female' : 'male';
                            updateStudent(stu.id, { gender: nextGender });
                          }}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                            isMale
                              ? 'bg-blue-950/60 border-blue-500/50 text-blue-300 hover:bg-blue-900/50'
                              : 'bg-rose-950/60 border-rose-500/50 text-rose-300 hover:bg-rose-900/50'
                          }`}
                          title="Bấm để đổi giới tính & trang phục"
                        >
                          {isMale ? '👦 Nam (Quần âu)' : '👧 Nữ (Váy xếp ly)'}
                        </button>

                        {/* Bảng Màu Tóc Mini */}
                        <div className="flex items-center gap-1 ml-auto">
                          {hairColors.map((c) => (
                            <button
                              key={c.value}
                              type="button"
                              onClick={() => updateStudent(stu.id, { hairColor: c.value })}
                              title={c.label}
                              className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                                currentHairColor.toLowerCase() === c.value.toLowerCase()
                                  ? 'scale-125 border-chrono-gold ring-1 ring-chrono-gold'
                                  : 'border-slate-700 hover:scale-110'
                              }`}
                              style={{ backgroundColor: c.value }}
                            />
                          ))}

                          {/* Nút Đeo Kính Cận */}
                          <button
                            type="button"
                            onClick={() => updateStudent(stu.id, { glasses: !stu.glasses })}
                            className={`ml-1 px-1.5 py-0.5 rounded text-[10px] border transition-colors ${
                              stu.glasses
                                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                            }`}
                            title="Bật/Tắt kính cận"
                          >
                            👓
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CÀI ĐẶT THỜI GIAN & ĐỒ HỌA */}
          {activeTab === 'graphics' && (
            <div className="space-y-6">
              {/* CHẾ ĐỘ QUAY KHÔNG LẶP LẠI */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-100">
                    Không lặp lại học sinh đã được chọn
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sau khi cả {students.length} học sinh đều được chọn hết, danh sách sẽ tự động khởi động lại từ đầu.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.noRepeat}
                  onChange={(e) => updateSettings({ noRepeat: e.target.checked })}
                  className="w-4 h-4 rounded text-chrono-gold accent-chrono-gold"
                />
              </div>

              {/* CHẾ ĐỘ CHIẾU ẢNH FLASHBACK */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-chrono-gold">
                  Chế Độ Chiếu Ảnh Flashback Ký Ức
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => updateSettings({ flashbackScope: 'range_1_6' })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      settings.flashbackScope === 'range_1_6'
                        ? 'bg-chrono-gold/15 border-chrono-gold text-chrono-glow shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                        : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold font-serif">Ký Ức #01 Đến #06</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-chrono-gold/20 text-chrono-gold border border-chrono-gold/30">Mặc Định</span>
                    </div>
                    <span className="block text-[11px] text-slate-300 mt-1">
                      Chiếu mượt mà 6 mốc từ Hiện đại (2020s) ngược về Tuyên ngôn Độc lập (1945) với camera kỷ niệm điện ảnh.
                    </span>
                  </button>

                  <button
                    onClick={() => updateSettings({ flashbackScope: 'uploaded_11_up' })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      settings.flashbackScope === 'uploaded_11_up'
                        ? 'bg-chrono-gold/15 border-chrono-gold text-chrono-glow shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                        : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold font-serif">Bộ Ảnh #11 Đến #14</span>
                    </div>
                    <span className="block text-[11px] text-slate-300 mt-1">
                      Chiếu 4 mốc cổ đại: Phòng tuyến Như Nguyệt, Bạch Đằng, Hai Bà Trưng và Thời Hùng Vương.
                    </span>
                  </button>

                  <button
                    onClick={() => updateSettings({ flashbackScope: 'all' })}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      settings.flashbackScope === 'all'
                        ? 'bg-chrono-gold/15 border-chrono-gold text-chrono-glow shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                        : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold font-serif">Toàn Bộ 14 Mốc</span>
                    </div>
                    <span className="block text-[11px] text-slate-300 mt-1">
                      Duyệt trọn vẹn tất cả 14 mốc lịch sử từ Hiện đại đến Cội nguồn dựng nước.
                    </span>
                  </button>
                </div>
              </div>

              {/* THỜI LƯỢNG FLASHBACK */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-chrono-gold">
                  Thời Lượng Phân Đoạn Flashback
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { sec: 6, label: '6 Giây', desc: 'Nhanh & Gọn gàng' },
                    { sec: 10, label: '10 Giây', desc: 'Chuẩn Điện Ảnh (Khuyên dùng)' },
                    { sec: 15, label: '15 Giây', desc: 'Hào Hùng & Sâu sắc' },
                  ].map((dur) => (
                    <button
                      key={dur.sec}
                      onClick={() => updateSettings({ flashbackDuration: dur.sec })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settings.flashbackDuration === dur.sec
                          ? 'bg-chrono-gold/15 border-chrono-gold text-chrono-glow'
                          : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="block text-sm font-bold font-serif">{dur.label}</span>
                      <span className="block text-[11px] text-slate-400 mt-1">{dur.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CHẤT LƯỢNG HẬU KỲ ĐỒ HỌA */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-chrono-gold">
                  Chất Lượng Đồ Họa & Hậu Kỳ (Post-Processing)
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'high', label: 'AAA Ultra', desc: 'Đầy đủ Bloom, Lệch sắc & MSAA' },
                    { key: 'medium', label: 'Cân Bằng', desc: 'Bloom nhẹ nhàng, mượt mà' },
                    { key: 'low', label: 'Tối Ưu', desc: 'Tắt hậu kỳ cho máy cấu hình thấp' },
                  ].map((q) => (
                    <button
                      key={q.key}
                      onClick={() => updateSettings({ quality: q.key as GraphicQuality })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settings.quality === q.key
                          ? 'bg-chrono-gold/15 border-chrono-gold text-chrono-glow'
                          : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="block text-sm font-bold font-serif">{q.label}</span>
                      <span className="block text-[11px] text-slate-400 mt-1">{q.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- FOOTER MODAL --- */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-800 bg-chrono-deep/90">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-chrono-gold text-slate-950 hover:bg-chrono-glow transition-colors"
          >
            Đóng Cài Đặt
          </button>
        </div>
      </div>

      {/* --- LIGHTBOX PHÓNG TO ẢNH XEM THỬ --- */}
      {selectedPreviewImage && (
        <div
          onClick={() => setSelectedPreviewImage(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img
              src={resolveAssetUrl(selectedPreviewImage)}
              alt="Xem trước ảnh ký ức"
              className="max-w-full max-h-[80vh] object-contain rounded-xl border border-chrono-gold/50 shadow-2xl"
            />
            <p className="mt-3 text-xs text-slate-400 font-mono">Bấm bất kỳ đâu để đóng</p>
          </div>
        </div>
      )}
    </div>
  );
};
