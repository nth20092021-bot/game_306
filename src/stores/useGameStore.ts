import { create } from 'zustand';
import type { GamePhase, StudentData, AppSettings, GraphicQuality } from '../types';
import { INITIAL_STUDENTS } from '../data/initialData';
import {
  DEFAULT_FLASHBACK_ITEMS,
  type HistoricalFlashbackItem,
} from '../data/historicalFlashbacks';
import { soundEngine } from '../utils/soundEngine';

interface GameStore {
  phase: GamePhase;
  students: StudentData[];
  chosenStudent: StudentData | null;
  selectedHistory: number[]; // List of student IDs already picked
  settings: AppSettings;
  flashbackItems: HistoricalFlashbackItem[];
  customPhotos: Record<string, string>; // filename -> blob URL
  isSettingsOpen: boolean;

  // 3D dynamic properties
  clockRewindSpeed: number;
  clockGlowIntensity: number;

  // Actions
  setPhase: (phase: GamePhase) => void;
  setClockProperties: (speed: number, glow: number) => void;
  startSequence: () => void;
  revealStudent: () => void;
  resetToIdle: () => void;
  resetSelectedPool: () => void;
  resetStudentsToDefault: () => void;
  setStudents: (students: StudentData[]) => void;
  updateStudent: (id: number, updates: Partial<StudentData>) => void;
  setFlashbackItems: (items: HistoricalFlashbackItem[]) => void;
  updateFlashbackItem: (id: number, updates: Partial<HistoricalFlashbackItem>) => void;
  setCustomPhoto: (filename: string, url: string) => void;
  removeCustomPhoto: (filename: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setIsSettingsOpen: (open: boolean) => void;
}

const STORAGE_KEY_STUDENTS = 'chrono_students_v6';
const STORAGE_KEY_SETTINGS = 'chrono_settings_v1';
const STORAGE_KEY_FLASHBACK_PHOTOS = 'chrono_flashback_custom_photos_v2';

const getInitialStudents = (): StudentData[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Ignore storage parse error
  }
  return INITIAL_STUDENTS;
};

const getInitialFlashbackItems = (): HistoricalFlashbackItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FLASHBACK_PHOTOS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return DEFAULT_FLASHBACK_ITEMS.map((item) => {
          if (parsed[item.id]) {
            return { ...item, imageUrl: parsed[item.id] };
          }
          return item;
        });
      }
    }
  } catch {
    // Ignore storage parse error
  }
  return DEFAULT_FLASHBACK_ITEMS;
};

const getInitialSettings = (): AppSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      return {
        flashbackDuration: 10,
        flashbackScope: 'range_1_6',
        noRepeat: true,
        quality: 'high',
        soundEnabled: true,
        bloomEnabled: true,
        chromaticAberrationEnabled: true,
        ...JSON.parse(saved),
      };
    }
  } catch {
    // Ignore storage parse error
  }
  return {
    flashbackDuration: 10,
    flashbackScope: 'range_1_6',
    noRepeat: true,
    quality: 'high' as GraphicQuality,
    soundEnabled: true,
    bloomEnabled: true,
    chromaticAberrationEnabled: true,
  };
};

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'IDLE',
  students: getInitialStudents(),
  chosenStudent: null,
  selectedHistory: [],
  settings: getInitialSettings(),
  flashbackItems: getInitialFlashbackItems(),
  customPhotos: {},
  isSettingsOpen: false,

  clockRewindSpeed: 1,
  clockGlowIntensity: 1.2,

  setPhase: (phase) => set({ phase }),

  setClockProperties: (clockRewindSpeed, clockGlowIntensity) =>
    set({ clockRewindSpeed, clockGlowIntensity }),

  startSequence: () => {
    const { students, selectedHistory, settings } = get();

    // Lọc danh sách học sinh khả dụng
    let pool = students;
    if (settings.noRepeat) {
      pool = students.filter((s) => !selectedHistory.includes(s.id));
      if (pool.length === 0) {
        pool = students;
        set({ selectedHistory: [] });
      }
    }

    if (pool.length === 0) return;

    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIndex];

    soundEngine.playClick();
    set({
      phase: 'CAMERA_DIVE',
      chosenStudent: chosen,
      clockRewindSpeed: 2,
      clockGlowIntensity: 1.5,
    });
  },

  revealStudent: () => {
    const { chosenStudent, selectedHistory, settings } = get();
    if (chosenStudent && settings.noRepeat) {
      set({
        selectedHistory: [...selectedHistory, chosenStudent.id],
      });
    }
    set({
      phase: 'STUDENT_REVEAL',
      clockRewindSpeed: 0.2,
      clockGlowIntensity: 1.0,
    });
    soundEngine.playStudentRevealFanfare();
  },

  resetToIdle: () => {
    soundEngine.playClick();
    set({
      phase: 'IDLE',
      chosenStudent: null,
      clockRewindSpeed: 1,
      clockGlowIntensity: 1.2,
    });
  },

  resetSelectedPool: () => {
    soundEngine.playClick();
    set({ selectedHistory: [] });
  },

  resetStudentsToDefault: () => {
    soundEngine.playClick();
    set({ students: INITIAL_STUDENTS, selectedHistory: [] });
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    } catch {
      // Ignore
    }
  },

  setStudents: (students) => {
    set({ students });
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch {
      // Ignore
    }
  },

  updateStudent: (id, updates) => {
    const { students } = get();
    const updated = students.map((s) => (s.id === id ? { ...s, ...updates } : s));
    set({ students: updated });
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  },

  setFlashbackItems: (items) => {
    set({ flashbackItems: items });
  },

  updateFlashbackItem: (id, updates) => {
    const { flashbackItems } = get();
    const updated = flashbackItems.map((item) => (item.id === id ? { ...item, ...updates } : item));
    set({ flashbackItems: updated });

    try {
      const customMap: Record<number, string> = {};
      updated.forEach((it) => {
        if (it.imageUrl && !it.imageUrl.startsWith('/assets/flashback/')) {
          customMap[it.id] = it.imageUrl;
        }
      });
      localStorage.setItem(STORAGE_KEY_FLASHBACK_PHOTOS, JSON.stringify(customMap));
    } catch {
      // Ignore
    }
  },

  setCustomPhoto: (filename, url) => {
    const { customPhotos } = get();
    set({ customPhotos: { ...customPhotos, [filename]: url } });
  },

  removeCustomPhoto: (filename) => {
    const { customPhotos } = get();
    const next = { ...customPhotos };
    delete next[filename];
    set({ customPhotos: next });
  },

  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    if (newSettings.soundEnabled !== undefined) {
      soundEngine.isMuted = !newSettings.soundEnabled;
    }
    set({ settings: updated });
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  },

  setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
}));

if (typeof window !== 'undefined') {
  (window as any).__useGameStore = useGameStore;
}
