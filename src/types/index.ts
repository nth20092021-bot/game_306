import type { StudentData, HairStyle, AvatarModelType } from '../components/models/ChibiStudentModel';

export type GamePhase =
  | 'IDLE'               // Tĩnh lặng giữa dòng thời gian
  | 'CAMERA_DIVE'        // Lao vào tâm đồng hồ (0s -> 2.5s)
  | 'FLASHBACK_REWIND'   // Phân cảnh ảnh ký ức tua ngược thời gian
  | 'CLIMAX_BURST'       // Điểm kỳ dị thời gian & bùng nổ xung kích
  | 'STUDENT_REVEAL';    // Vinh danh học sinh Chibi 3D

export interface FlashbackItem {
  id: number;
  filename: string;
  title: string;
  era: string;
  description: string;
  aspectRatio: string;
}

export type GraphicQuality = 'high' | 'medium' | 'low';

export interface AppSettings {
  flashbackDuration: number; // in seconds: 6, 10, or 15
  flashbackScope: 'range_1_6' | 'all' | 'uploaded_11_up'; // 'range_1_6' = Phát từ ảnh 1 đến ảnh 6 (mặc định), 'all' = Toàn bộ 14 mốc
  noRepeat: boolean;
  quality: GraphicQuality;
  soundEnabled: boolean;
  bloomEnabled: boolean;
  chromaticAberrationEnabled: boolean;
}

export type { StudentData, HairStyle, AvatarModelType };
