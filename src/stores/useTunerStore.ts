import { create } from 'zustand';
import type { TuningPreset } from '../types/tuner';

export const PRESETS: Record<string, TuningPreset> = {
  guitar_std: {
    id: 'guitar_std',
    label: '기타 (Std)',
    notes: [
      { name: 'E2', freq: 82.41, stringNumber: 6 },
      { name: 'A2', freq: 110.0, stringNumber: 5 },
      { name: 'D3', freq: 146.83, stringNumber: 4 },
      { name: 'G3', freq: 196.0, stringNumber: 3 },
      { name: 'B3', freq: 246.94, stringNumber: 2 },
      { name: 'E4', freq: 329.63, stringNumber: 1 },
    ],
  },
  guitar_drop_d: {
    id: 'guitar_drop_d',
    label: 'Drop D',
    notes: [
      { name: 'D2', freq: 73.42, stringNumber: 6 },
      { name: 'A2', freq: 110.0, stringNumber: 5 },
      { name: 'D3', freq: 146.83, stringNumber: 4 },
      { name: 'G3', freq: 196.0, stringNumber: 3 },
      { name: 'B3', freq: 246.94, stringNumber: 2 },
      { name: 'E4', freq: 329.63, stringNumber: 1 },
    ],
  },
  guitar_dadgad: {
    id: 'guitar_dadgad',
    label: 'DADGAD',
    notes: [
      { name: 'D2', freq: 73.42, stringNumber: 6 },
      { name: 'A2', freq: 110.0, stringNumber: 5 },
      { name: 'D3', freq: 146.83, stringNumber: 4 },
      { name: 'G3', freq: 196.0, stringNumber: 3 },
      { name: 'A3', freq: 220.0, stringNumber: 2 },
      { name: 'D4', freq: 293.66, stringNumber: 1 },
    ],
  },
  guitar_half_down: {
    id: 'guitar_half_down',
    label: '반음 다운 (Eb)',
    notes: [
      { name: 'Eb2', freq: 77.78, stringNumber: 6 },
      { name: 'Ab2', freq: 103.83, stringNumber: 5 },
      { name: 'Db3', freq: 138.59, stringNumber: 4 },
      { name: 'Gb3', freq: 185.0, stringNumber: 3 },
      { name: 'Bb3', freq: 233.08, stringNumber: 2 },
      { name: 'Eb4', freq: 311.13, stringNumber: 1 },
    ],
  },
  guitar_open_d: {
    id: 'guitar_open_d',
    label: 'Open D',
    notes: [
      { name: 'D2', freq: 73.42, stringNumber: 6 },
      { name: 'A2', freq: 110.0, stringNumber: 5 },
      { name: 'D3', freq: 146.83, stringNumber: 4 },
      { name: 'F#3', freq: 185.0, stringNumber: 3 },
      { name: 'A3', freq: 220.0, stringNumber: 2 },
      { name: 'D4', freq: 293.66, stringNumber: 1 },
    ],
  },
  guitar_open_g: {
    id: 'guitar_open_g',
    label: 'Open G',
    notes: [
      { name: 'D2', freq: 73.42, stringNumber: 6 },
      { name: 'G2', freq: 98.0, stringNumber: 5 },
      { name: 'D3', freq: 146.83, stringNumber: 4 },
      { name: 'G3', freq: 196.0, stringNumber: 3 },
      { name: 'B3', freq: 246.94, stringNumber: 2 },
      { name: 'D4', freq: 293.66, stringNumber: 1 },
    ],
  },
  bass_4: {
    id: 'bass_4',
    label: '베이스 (4현)',
    notes: [
      { name: 'E1', freq: 41.2, stringNumber: 4 },
      { name: 'A1', freq: 55.0, stringNumber: 3 },
      { name: 'D2', freq: 73.42, stringNumber: 2 },
      { name: 'G2', freq: 98.0, stringNumber: 1 },
    ],
  },
  bass_5: {
    id: 'bass_5',
    label: '베이스 (5현)',
    notes: [
      { name: 'B0', freq: 30.87, stringNumber: 5 },
      { name: 'E1', freq: 41.2, stringNumber: 4 },
      { name: 'A1', freq: 55.0, stringNumber: 3 },
      { name: 'D2', freq: 73.42, stringNumber: 2 },
      { name: 'G2', freq: 98.0, stringNumber: 1 },
    ],
  },
  ukulele: {
    id: 'ukulele',
    label: '우쿨렐레',
    notes: [
      { name: 'G4', freq: 392.0, stringNumber: 4 },
      { name: 'C4', freq: 261.63, stringNumber: 3 },
      { name: 'E4', freq: 329.63, stringNumber: 2 },
      { name: 'A4', freq: 440.0, stringNumber: 1 },
    ],
  },
  chromatic: { id: 'chromatic', label: '크로매틱', notes: [] },
};

export type ThemeMode = 'dark' | 'light';

interface TunerState {
  isActive: boolean;
  baseA4: number;
  currentPresetId: string;
  soundEnabled: boolean;
  activeStringNumber: number | null;
  theme: ThemeMode;
  setIsActive: (active: boolean) => void;
  setBaseA4: (freq: number) => void;
  setCurrentPresetId: (id: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setActiveStringNumber: (num: number | null) => void;
  toggleTheme: () => void;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('tuner-theme') as ThemeMode;
    if (saved === 'dark' || saved === 'light') return saved;
  }
  return 'dark';
};

const initialTheme = getInitialTheme();

if (typeof document !== 'undefined') {
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const useTunerStore = create<TunerState>((set, get) => ({
  isActive: false,
  baseA4: 440,
  currentPresetId: 'guitar_std',
  soundEnabled: true,
  activeStringNumber: null,
  theme: initialTheme,

  setIsActive: (active) => set({ isActive: active }),
  setBaseA4: (freq) => set({ baseA4: freq }),
  setCurrentPresetId: (id) => set({ currentPresetId: id, activeStringNumber: null }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  setActiveStringNumber: (num) => set({ activeStringNumber: num }),

  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof document !== 'undefined') {
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('tuner-theme', nextTheme);
    }
    set({ theme: nextTheme });
  },
}));