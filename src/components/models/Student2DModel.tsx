// src/components/models/Student2DModel.tsx
import React, { useMemo } from 'react';
import type { StudentData } from '../../types';

export interface Student2DModelProps {
  student: StudentData;
  scale?: number;
  className?: string;
  showSpotlight?: boolean;
  showPedestal?: boolean;
}

/**
 * Nhận diện giới tính học sinh tự động qua Họ và Tên Tiếng Việt
 */
export function detectGenderByName(fullName = ''): 'male' | 'female' {
  const lower = fullName.trim().toLowerCase();
  const femaleMarkers = [
    'thị', 'hương', 'lan', 'mai', 'linh', 'trang', 'ngọc', 'thảo', 'hà',
    'vy', 'nhi', 'châu', 'quỳnh', 'phương', 'yến', 'tuyết', 'trúc', 'đào',
    'hoa', 'hồng', 'nhung', 'thư', 'ân', 'my', 'trâm', 'ngân', 'huyền',
    'diệp', 'anh', 'uyên', 'tiên', 'chi', 'dung', 'hạnh', 'hiền', 'khánh'
  ];
  const maleOverrides = [
    'đình', 'văn', 'hữu', 'đức', 'mạnh', 'quốc', 'tuấn', 'hùng',
    'phong', 'nam', 'triết', 'hoàn', 'thuận', 'nhân', 'phúc'
  ];
  if (maleOverrides.some((m) => lower.includes(` ${m} `) || lower.endsWith(` ${m}`))) {
    return 'male';
  }
  return femaleMarkers.some((f) => lower.includes(f)) ? 'female' : 'male';
}

/**
 * Component Model Nhân Vật Học Sinh 2D Đa Lớp Cao Cấp (Live2D-Style Layered SVG)
 * - Đã BỎ KHĂN QUÀNG CỔ theo yêu cầu người dùng, thay bằng đồng phục học sinh thanh lịch
 *   (Cổ áo sơ mi trắng tinh khôi bẻ ve gọn gàng, nơ ruy băng nữ / cà vạt nam sang trọng).
 * - Sân khấu bệ đứng Hoàng Gia Ánh Vàng (Royal Gold Stage) & hào quang ấm áp.
 * - Khuôn mặt anime tinh tế: ánh mắt long lanh 3 tầng có đốm sao, tóc layer mượt mà,
 *   chuyển động thở, vẫy tay chúc mừng, chớp mắt tự nhiên.
 */
export const Student2DModel: React.FC<Student2DModelProps> = ({
  student,
  scale = 1,
  className = '',
  showSpotlight = true,
  showPedestal = true,
}) => {
  const resolvedGender = useMemo(() => {
    if (student.gender) return student.gender;
    return detectGenderByName(student.name);
  }, [student]);

  const isFemale = resolvedGender === 'female';
  const hairColor = student.hairColor || '#2a201b';

  return (
    <div
      className={`student-2d-stage-wrapper ${className}`}
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
      }}
    >
      {/* 1. CHÙM SÁNG SPOTLIGHT VÀNG ẤM CHIẾU TỪ ĐỈNH SÂN KHẤU */}
      {showSpotlight && <div className="student-2d-spotlight" />}

      {/* 2. HÀO QUANG NỀN TÔN VINH HỌC SINH (WARM GOLDEN AURA) */}
      {showSpotlight && <div className="student-2d-aura" />}

      {/* 3. KHUNG HÌNH NHÂN VẬT 2D ĐA LỚP */}
      <div className="student-2d-character-box">
        <svg viewBox="0 0 400 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Gradient Da Anime Hồng Hào Mịn Màng */}
            <radialGradient id="skinGrad" cx="50%" cy="42%" r="55%">
              <stop offset="0%" stopColor="#FFF5ED" />
              <stop offset="68%" stopColor="#FFE5D2" />
              <stop offset="100%" stopColor="#F5C3A4" />
            </radialGradient>

            {/* Gradient Tóc Nâu Đen Óng Ả Tự Nhiên */}
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="20%" y2="100%">
              <stop offset="0%" stopColor={hairColor} />
              <stop offset="50%" stopColor="#251b18" />
              <stop offset="100%" stopColor="#140d0c" />
            </linearGradient>

            {/* Vệt Sáng Bóng Tóc Anime (Angel Halo Highlight) */}
            <linearGradient id="hairHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9C7A72" stopOpacity="0" />
              <stop offset="25%" stopColor="#B6938B" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#E2C5BF" stopOpacity="0.9" />
              <stop offset="75%" stopColor="#B6938B" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#9C7A72" stopOpacity="0" />
            </linearGradient>

            {/* Gradient Tròng Mắt Anime Long Lanh 4 Tầng */}
            <linearGradient id="irisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#190F0B" />
              <stop offset="42%" stopColor="#4A2514" />
              <stop offset="78%" stopColor="#B06524" />
              <stop offset="100%" stopColor="#F5B242" />
            </linearGradient>

            {/* Gradient Áo Sơ Mi Trắng Tinh Khôi */}
            <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="75%" stopColor="#F4F7FC" />
              <stop offset="100%" stopColor="#D9E2EE" />
            </linearGradient>

            {/* Gradient Cổ Áo Trắng Gập (White Collar Lapel) */}
            <linearGradient id="collarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E6ECF5" />
            </linearGradient>

            {/* Gradient Cà Vạt / Nơ Học Sinh Xanh Navy Sang Trọng */}
            <linearGradient id="tieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2B3C63" />
              <stop offset="50%" stopColor="#1E2B49" />
              <stop offset="100%" stopColor="#121B30" />
            </linearGradient>

            {/* Gradient Váy / Quần Xanh Tím Than Đồng Phục */}
            <linearGradient id="navyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2A3859" />
              <stop offset="60%" stopColor="#1C263E" />
              <stop offset="100%" stopColor="#101728" />
            </linearGradient>

            {/* Má Hồng Dịu Dàng */}
            <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF708A" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#FF708A" stopOpacity="0" />
            </radialGradient>

            {/* Ánh Kim Vàng Huy Hiệu & Viền */}
            <linearGradient id="goldAccentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE082" />
              <stop offset="60%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#997A1E" />
            </linearGradient>
          </defs>

          {/* ==========================================
               LỚP 1: TÓC DÀI PHÍA SAU LƯNG (DÀNH CHO NỮ)
               ========================================== */}
          {isFemale && (
            <g className="rig-hair-back">
              {/* Suối tóc dài uốn lượn mềm mại qua vai */}
              <path
                d="M 105 140
                   C 76 205, 70 285, 86 355
                   C 98 340, 110 328, 118 358
                   C 138 344, 165 366, 200 368
                   C 235 366, 262 344, 282 358
                   C 290 328, 302 340, 314 355
                   C 330 285, 324 205, 295 140 Z"
                fill="url(#hairGrad)"
                stroke="#180F0D"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
              {/* Các đường vân sợi tóc uốn lượn sau lưng */}
              <path
                d="M 118 190 C 100 252, 104 308, 115 348"
                stroke="#120B0A"
                strokeWidth="2.2"
                fill="none"
                opacity="0.65"
              />
              <path
                d="M 282 190 C 300 252, 296 308, 285 348"
                stroke="#120B0A"
                strokeWidth="2.2"
                fill="none"
                opacity="0.65"
              />
            </g>
          )}

          {/* ==========================================
               LỚP 2: ĐÔI CHÂN, TẤT TRẮNG & GIÀY HỌC SINH
               ========================================== */}
          <g id="legs-and-shoes">
            {/* Chân trái */}
            <path
              d="M 164 365 L 166 435 L 188 435 L 190 365 Z"
              fill="url(#skinGrad)"
              stroke="#4A2E24"
              strokeWidth="2.2"
            />
            {/* Chân phải */}
            <path
              d="M 210 365 L 212 435 L 234 435 L 236 365 Z"
              fill="url(#skinGrad)"
              stroke="#4A2E24"
              strokeWidth="2.2"
            />

            {/* Tất trắng cao cổ có sọc navy tinh tế */}
            <path
              d="M 164 402 Q 177 406 189 402 L 188 442 L 165 442 Z"
              fill="#FFFFFF"
              stroke="#B8C4D4"
              strokeWidth="2"
            />
            <path
              d="M 211 402 Q 223 406 236 402 L 235 442 L 212 442 Z"
              fill="#FFFFFF"
              stroke="#B8C4D4"
              strokeWidth="2"
            />
            <line x1="164" y1="408" x2="189" y2="408" stroke="#1E2B49" strokeWidth="2.5" />
            <line x1="211" y1="408" x2="236" y2="408" stroke="#1E2B49" strokeWidth="2.5" />

            {/* Giày học sinh màu đen bóng có quai cài */}
            <ellipse cx="175" cy="447" rx="18" ry="11" fill="#181920" stroke="#090A0F" strokeWidth="2.5" />
            <ellipse cx="225" cy="447" rx="18" ry="11" fill="#181920" stroke="#090A0F" strokeWidth="2.5" />
            <path d="M 162 442 Q 175 447 188 442" stroke="#2E3244" strokeWidth="2.5" fill="none" />
            <path d="M 212 442 Q 225 447 238 442" stroke="#2E3244" strokeWidth="2.5" fill="none" />
            <ellipse cx="169" cy="446" rx="5" ry="2.2" fill="#FFFFFF" opacity="0.45" />
            <ellipse cx="219" cy="446" rx="5" ry="2.2" fill="#FFFFFF" opacity="0.45" />
          </g>

          {/* ==========================================
               LỚP 3: THÂN TRÊN CÓ NHỊP THỞ (BREATHING RIG)
               ========================================== */}
          <g className="rig-breathe">
            {/* TAY PHẢI (Buông nhẹ tự nhiên theo dáng đứng thanh lịch) */}
            <g className="rig-right-arm">
              <path
                d="M 148 258 C 132 280, 122 308, 116 328 C 113 336, 125 340, 130 332 C 138 314, 148 292, 158 272 Z"
                fill="url(#skinGrad)"
                stroke="#4A2E24"
                strokeWidth="2.2"
              />
              {/* Bàn tay phải */}
              <circle cx="120" cy="333" r="9.5" fill="url(#skinGrad)" stroke="#4A2E24" strokeWidth="2.2" />
              {/* Tay áo sơ mi trắng viền navy */}
              <path
                d="M 155 246 C 140 252, 130 272, 126 288 L 152 298 C 156 284, 162 268, 165 256 Z"
                fill="url(#shirtGrad)"
                stroke="#9AA8BC"
                strokeWidth="2.2"
              />
              <path d="M 127 285 L 151 295" stroke="#1E2B49" strokeWidth="3.5" strokeLinecap="round" />
            </g>

            {/* TAY TRÁI GIƠ LÊN VẪY CHÀO CHÚC MỪNG (WAVING ARM RIG - LIỀN KHỐI KHÔNG HỞ VAI) */}
            <g className="rig-waving-arm">
              {/* Cánh tay vươn lên chào (Skin forearm) */}
              <path
                d="M 252 242 L 296 202 C 302 192, 314 200, 307 210 L 268 250 Z"
                fill="url(#skinGrad)"
                stroke="#4A2E24"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              {/* Bàn tay vẫy chào ngón tay thon thả */}
              <g transform="translate(306, 196) rotate(-25)">
                <ellipse cx="0" cy="0" rx="10" ry="9" fill="url(#skinGrad)" stroke="#4A2E24" strokeWidth="2" />
                <ellipse
                  cx="-9"
                  cy="-2"
                  rx="3.2"
                  ry="6"
                  transform="rotate(-35 -9 -2)"
                  fill="url(#skinGrad)"
                  stroke="#4A2E24"
                  strokeWidth="1.6"
                />
                <ellipse
                  cx="-4"
                  cy="-9"
                  rx="2.8"
                  ry="6.5"
                  transform="rotate(-12 -4 -9)"
                  fill="url(#skinGrad)"
                  stroke="#4A2E24"
                  strokeWidth="1.6"
                />
                <ellipse cx="1.5" cy="-10" rx="2.8" ry="7" fill="url(#skinGrad)" stroke="#4A2E24" strokeWidth="1.6" />
                <ellipse
                  cx="6.5"
                  cy="-8.5"
                  rx="2.6"
                  ry="6"
                  transform="rotate(15 6.5 -8.5)"
                  fill="url(#skinGrad)"
                  stroke="#4A2E24"
                  strokeWidth="1.6"
                />
              </g>
              {/* Ống tay áo sơ mi ngắn (Short sleeve ôm gọn vai, liền khối với thân áo) */}
              <path
                d="M 244 242 C 252 238, 264 232, 272 234 L 275 244 C 265 252, 255 256, 246 256 Z"
                fill="url(#shirtGrad)"
                stroke="#9AA8BC"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              {/* Đường viền navy ở mép ống tay áo */}
              <path d="M 272 234 L 275 244" stroke="#1E2B49" strokeWidth="3.5" strokeLinecap="round" />
            </g>

            {/* CHÂN VÁY XẾP LY (NỮ) HOẶC QUẦN ÂU (NAM) */}
            {isFemale ? (
              <g id="pleated-skirt">
                <path
                  d="M 152 322 L 134 382 Q 200 394 266 382 L 248 322 Z"
                  fill="url(#navyGrad)"
                  stroke="#0E1422"
                  strokeWidth="2.6"
                  strokeLinejoin="round"
                />
                {/* Đường xếp ly sắc nét */}
                <path d="M 166 324 L 154 383" stroke="#101728" strokeWidth="2.4" />
                <path d="M 182 325 L 175 386" stroke="#101728" strokeWidth="2.4" />
                <path d="M 200 326 L 200 388" stroke="#101728" strokeWidth="2.4" />
                <path d="M 218 325 L 225 386" stroke="#101728" strokeWidth="2.4" />
                <path d="M 234 324 L 246 383" stroke="#101728" strokeWidth="2.4" />
                {/* Dải viền chân váy */}
                <path d="M 146 376 Q 200 386 254 376" stroke="#3B4E78" strokeWidth="1.8" fill="none" opacity="0.75" />
              </g>
            ) : (
              <g id="male-trousers">
                <path
                  d="M 154 322 L 156 392 L 194 392 L 198 348 L 202 348 L 206 392 L 244 392 L 246 322 Z"
                  fill="url(#navyGrad)"
                  stroke="#0E1422"
                  strokeWidth="2.6"
                  strokeLinejoin="round"
                />
                <line x1="175" y1="332" x2="175" y2="388" stroke="#33446B" strokeWidth="1.8" opacity="0.6" />
                <line x1="225" y1="332" x2="225" y2="388" stroke="#33446B" strokeWidth="1.8" opacity="0.6" />
              </g>
            )}

            {/* THÂN ÁO SƠ MI TRẮNG TINH KHÔI & CÚC ÁO NGỌC TRAI */}
            <g id="white-shirt-torso">
              <path
                d="M 152 242 C 150 272, 150 302, 149 326 Q 200 335 251 326 C 250 302, 250 272, 248 242 Z"
                fill="url(#shirtGrad)"
                stroke="#9AA8BC"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Nẹp áo sơ mi ở giữa */}
              <line x1="200" y1="248" x2="200" y2="326" stroke="#C5D0E0" strokeWidth="2.2" />

              {/* Hàng cúc áo ngọc trai thanh lịch */}
              <circle cx="200" cy="275" r="2.4" fill="#FFFFFF" stroke="#9AA8BC" strokeWidth="1.2" />
              <circle cx="200" cy="295" r="2.4" fill="#FFFFFF" stroke="#9AA8BC" strokeWidth="1.2" />
              <circle cx="200" cy="315" r="2.4" fill="#FFFFFF" stroke="#9AA8BC" strokeWidth="1.2" />

              {/* Huy hiệu trường học trên ngực trái (Khiên vàng danh dự) */}
              <g transform="translate(228, 282)">
                <path
                  d="M -9 -10 L 9 -10 L 9 1 C 9 8, 0 12, 0 12 C 0 12, -9 8, -9 1 Z"
                  fill="url(#goldAccentGrad)"
                  stroke="#7A5614"
                  strokeWidth="1.6"
                />
                <path
                  d="M -5.5 -6.5 L 5.5 -6.5 L 5.5 0.5 C 5.5 5, 0 8, 0 8 C 0 8, -5.5 5, -5.5 0.5 Z"
                  fill="#1E2B49"
                />
                <circle cx="0" cy="-1.5" r="2" fill="#FFE082" />
              </g>
            </g>

            {/* CỔ ÁO HỌC SINH THANH LỊCH (ĐÃ BỎ HOÀN TOÀN KHĂN QUÀNG CỔ THEO YÊU CẦU) */}
            <g id="student-school-collar">
              {/* Cổ học sinh tự nhiên */}
              <path
                d="M 184 222 L 184 246 Q 200 252 216 246 L 216 222 Z"
                fill="url(#skinGrad)"
                stroke="#4A2E24"
                strokeWidth="2"
              />
              <path d="M 185 226 Q 200 236 215 226 Z" fill="#D99B78" opacity="0.6" />

              {/* Hai lá cổ áo sơ mi trắng bẻ gọn gàng, tinh khôi */}
              <g id="white-shirt-collar-lapels">
                {/* Lá cổ trái */}
                <path
                  d="M 197 242 L 164 249 L 182 268 L 198 247 Z"
                  fill="url(#collarGrad)"
                  stroke="#8C9CB2"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                {/* Lá cổ phải */}
                <path
                  d="M 203 242 L 236 249 L 218 268 L 202 247 Z"
                  fill="url(#collarGrad)"
                  stroke="#8C9CB2"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                {/* Chân cổ ôm sau gáy */}
                <path
                  d="M 174 242 Q 200 248 226 242"
                  stroke="#A4B2C6"
                  strokeWidth="2"
                  fill="none"
                />
              </g>

              {/* PHỤ KIỆN ĐỒNG PHỤC HỌC SINH THANH LỊCH: NƠ RUY BĂNG CHO NỮ / CÀ VẠT CHO NAM */}
              {isFemale ? (
                /* Nơ bướm học sinh nữ xanh navy viền vàng cực xinh */
                <g id="school-ribbon-bow" transform="translate(200, 250)">
                  {/* Cánh nơ trái */}
                  <path
                    d="M -2 0 C -16 -6, -24 6, -14 16 C -6 18, -3 6, -2 0 Z"
                    fill="url(#tieGrad)"
                    stroke="#0E172A"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  {/* Cánh nơ phải */}
                  <path
                    d="M 2 0 C 16 -6, 24 6, 14 16 C 6 18, 3 6, 2 0 Z"
                    fill="url(#tieGrad)"
                    stroke="#0E172A"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  {/* Dải tà nơ rủ xuống */}
                  <path
                    d="M -3 3 L -10 24 L -4 21 L -1 5 Z"
                    fill="url(#tieGrad)"
                    stroke="#0E172A"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M 3 3 L 10 24 L 4 21 L 1 5 Z"
                    fill="url(#tieGrad)"
                    stroke="#0E172A"
                    strokeWidth="1.6"
                  />
                  {/* Nút thắt trung tâm đính ghim vàng */}
                  <ellipse cx="0" cy="2" rx="4.5" ry="4" fill="url(#goldAccentGrad)" stroke="#7A5614" strokeWidth="1.4" />
                </g>
              ) : (
                /* Cà vạt học sinh nam xanh navy vát nhọn có sọc vàng tinh tế */
                <g id="school-necktie" transform="translate(200, 245)">
                  {/* Củ ấu nút thắt cà vạt */}
                  <polygon
                    points="-5,0 5,0 3.5,8 -3.5,8"
                    fill="url(#tieGrad)"
                    stroke="#0E172A"
                    strokeWidth="1.8"
                  />
                  {/* Thân cà vạt vát nhọn phía dưới */}
                  <polygon
                    points="-4,8 4,8 6,42 0,50 -6,42"
                    fill="url(#tieGrad)"
                    stroke="#0E172A"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  {/* Sọc vát vàng phong cách trường học */}
                  <line x1="-5" y1="20" x2="3" y2="28" stroke="#FFE082" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="-4" y1="28" x2="4" y2="36" stroke="#FFE082" strokeWidth="1.6" strokeLinecap="round" />
                </g>
              )}
            </g>

            {/* ==========================================
                 LỚP 4: ĐẦU, KHUÔN MẶT ANIME & TÓC (HEAD RIG)
                 ========================================== */}
            <g className="rig-head">
              {/* Đôi tai hai bên */}
              <ellipse
                cx="110"
                cy="175"
                rx="14"
                ry="18"
                transform="rotate(-10 110 175)"
                fill="url(#skinGrad)"
                stroke="#4A2E24"
                strokeWidth="2.4"
              />
              <path d="M 106 170 Q 112 175 108 182" stroke="#D18E6B" strokeWidth="2.2" fill="none" />
              <ellipse
                cx="290"
                cy="175"
                rx="14"
                ry="18"
                transform="rotate(10 290 175)"
                fill="url(#skinGrad)"
                stroke="#4A2E24"
                strokeWidth="2.4"
              />
              <path d="M 294 170 Q 288 175 292 182" stroke="#D18E6B" strokeWidth="2.2" fill="none" />

              {/* Khuôn mặt bầu bĩnh đáng yêu Chibi */}
              <path
                d="M 114 142
                   C 110 185, 122 232, 200 234
                   C 278 232, 290 185, 286 142
                   C 282 88, 248 66, 200 66
                   C 152 66, 118 88, 114 142 Z"
                fill="url(#skinGrad)"
                stroke="#4A2E24"
                strokeWidth="2.8"
                strokeLinejoin="round"
              />

              {/* ĐÔI MẮT ANIME LONG LANH (CÓ AUTO-BLINK) */}
              <g className="rig-eye-blink">
                {/* Mắt Trái */}
                <g transform="translate(156, 168)">
                  <ellipse cx="0" cy="0" rx="20" ry="22" fill="#FFFFFF" />
                  <ellipse cx="1" cy="1" rx="15.5" ry="18.5" fill="url(#irisGrad)" />
                  <ellipse cx="1" cy="2" rx="7.5" ry="9.5" fill="#120906" />
                  {/* Đốm sao long lanh trong mắt */}
                  <circle cx="-5.5" cy="-7" r="5.8" fill="#FFFFFF" />
                  <circle cx="6.5" cy="6.5" r="2.8" fill="#FFFFFF" />
                  <circle cx="-6" cy="7" r="1.6" fill="#FFE6B3" />
                  {/* Đường viền mí mắt trên dày & sắc sảo */}
                  <path
                    d="M -22 -6 C -16 -24, 16 -24, 22 -5"
                    stroke="#1E1210"
                    strokeWidth="5.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path d="M -22 -6 L -26 -11" stroke="#1E1210" strokeWidth="3.2" strokeLinecap="round" />
                </g>

                {/* Mắt Phải */}
                <g transform="translate(244, 168)">
                  <ellipse cx="0" cy="0" rx="20" ry="22" fill="#FFFFFF" />
                  <ellipse cx="-1" cy="1" rx="15.5" ry="18.5" fill="url(#irisGrad)" />
                  <ellipse cx="-1" cy="2" rx="7.5" ry="9.5" fill="#120906" />
                  {/* Đốm sao long lanh */}
                  <circle cx="-6.5" cy="-7" r="5.8" fill="#FFFFFF" />
                  <circle cx="5.5" cy="6.5" r="2.8" fill="#FFFFFF" />
                  <circle cx="-7" cy="7" r="1.6" fill="#FFE6B3" />
                  {/* Đường viền mí mắt */}
                  <path
                    d="M -22 -5 C -16 -24, 16 -24, 22 -6"
                    stroke="#1E1210"
                    strokeWidth="5.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path d="M 22 -6 L 26 -11" stroke="#1E1210" strokeWidth="3.2" strokeLinecap="round" />
                </g>
              </g>

              {/* Đôi lông mày thanh thoát */}
              <path
                d="M 136 135 Q 156 126 174 134"
                stroke="#2B1B17"
                strokeWidth="3.2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 226 134 Q 244 126 264 135"
                stroke="#2B1B17"
                strokeWidth="3.2"
                fill="none"
                strokeLinecap="round"
              />

              {/* Mũi nhỏ xinh & Đôi má ửng hồng */}
              <path
                d="M 199 182 Q 202 185 200 188"
                stroke="#CC8B6B"
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
              />
              <ellipse cx="134" cy="192" rx="16" ry="9.5" fill="url(#blushGrad)" />
              <ellipse cx="266" cy="192" rx="16" ry="9.5" fill="url(#blushGrad)" />

              {/* Miệng cười rạng rỡ đáng yêu */}
              <path
                d="M 186 198 Q 200 203 214 198 C 215 214, 185 214, 186 198 Z"
                fill="#A82431"
                stroke="#4A181E"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <path d="M 191 206 Q 200 201 209 206 C 207 212, 193 212, 191 206 Z" fill="#FF7588" />

              {/* Kính cận mạ vàng (nếu học sinh có kính) */}
              {student.glasses && (
                <g stroke="#d4af37" strokeWidth="2.5" fill="none">
                  <circle cx="156" cy="168" r="23" />
                  <circle cx="244" cy="168" r="23" />
                  <path d="M 179 168 Q 200 164 221 168" />
                </g>
              )}

              {/* ==========================================
                   LỚP 5: TÓC MÁI TỈA LAYER & LỌN TÓC MAI
                   ========================================== */}
              <g id="front-hair-and-bangs">
                {/* Vòm tóc trên đỉnh đầu & tóc mái tỉa lọn bay bổng (KHÔNG che mắt) */}
                <path
                  d="M 104 152
                     C 98 92, 142 52, 200 52
                     C 258 52, 302 92, 296 152
                     C 288 128, 275 112, 264 138
                     C 256 116, 240 102, 226 142
                     C 218 112, 206 98, 196 144
                     C 184 108, 168 102, 156 138
                     C 144 114, 128 116, 104 152 Z"
                  fill="url(#hairGrad)"
                  stroke="#160F0E"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />

                {/* Vệt sáng bóng tóc Anime (Angel Halo Highlight) */}
                <path d="M 134 98 Q 200 78 266 98 Q 200 90 134 98 Z" fill="url(#hairHighlight)" />

                {isFemale ? (
                  <>
                    {/* Hai lọn tóc mai dài mềm mại ôm má dành cho Học Sinh Nữ */}
                    <g className="rig-hair-lock-left">
                      <path
                        d="M 104 138
                           C 96 182, 100 232, 114 276
                           C 122 256, 126 218, 122 162 Z"
                        fill="url(#hairGrad)"
                        stroke="#160F0E"
                        strokeWidth="2.6"
                        strokeLinejoin="round"
                      />
                    </g>
                    <g className="rig-hair-lock-right">
                      <path
                        d="M 296 138
                           C 304 182, 300 232, 286 276
                           C 278 256, 274 218, 278 162 Z"
                        fill="url(#hairGrad)"
                        stroke="#160F0E"
                        strokeWidth="2.6"
                        strokeLinejoin="round"
                      />
                    </g>
                  </>
                ) : (
                  <>
                    {/* Tóc mai gọn gàng năng động cho Học Sinh Nam */}
                    <path
                      d="M 104 136 C 102 158, 106 176, 114 188 C 118 172, 120 156, 118 142 Z"
                      fill="url(#hairGrad)"
                      stroke="#160F0E"
                      strokeWidth="2.4"
                    />
                    <path
                      d="M 296 136 C 298 158, 294 176, 286 188 C 282 172, 280 156, 282 142 Z"
                      fill="url(#hairGrad)"
                      stroke="#160F0E"
                      strokeWidth="2.4"
                    />
                  </>
                )}
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* 4. BỆ ĐỨNG HOÀNG GIA ÁNH VÀNG DƯỚI CHÂN (ROYAL GOLD PEDESTAL) */}
      {showPedestal && <div className="student-2d-pedestal" />}
    </div>
  );
};
