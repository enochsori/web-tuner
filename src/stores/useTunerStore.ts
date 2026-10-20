import { create } from 'zustand';

export interface NoteInfo {
  stringNumber: number;
  name: string;
  freq: number;
}

export interface Preset {
  id: string;
  name: string;
  notes: NoteInfo[];
}

export const PRESETS: Record<string, Preset> = {
  guitar_std: {
    id: 'guitar_std',
    name: '기타 (Std)',
    notes: [
      { stringNumber: 6, name: 'E2', freq: 82.41 },
      { stringNumber: 5, name: 'A2', freq: 110.0 },
      { stringNumber: 4, name: 'D3', freq: 146.83 },
      { stringNumber: 3, name: 'G3', freq: 196.0 },
      { stringNumber: 2, name: 'B3', freq: 246.94 },
      { stringNumber: 1, name: 'E4', freq: 329.63 },
    ],
  },
  drop_d: {
    id: 'drop_d',
    name: 'Drop D',
    notes: [
      { stringNumber: 6, name: 'D2', freq: 73.42 },
      { stringNumber: 5, name: 'A2', freq: 110.0 },
      { stringNumber: 4, name: 'D3', freq: 146.83 },
      { stringNumber: 3, name: 'G3', freq: 196.0 },
      { stringNumber: 2, name: 'B3', freq: 246.94 },
      { stringNumber: 1, name: 'E4', freq: 329.63 },
    ],
  },
  dadgad: {
    id: 'dadgad',
    name: 'DADGAD',
    notes: [
      { stringNumber: 6, name: 'D2', freq: 73.42 },
      { stringNumber: 5, name: 'A2', freq: 110.0 },
      { stringNumber: 4, name: 'D3', freq: 146.83 },
      { stringNumber: 3, name: 'G3', freq: 196.0 },
      { stringNumber: 2, name: 'A3', freq: 220.0 },
      { stringNumber: 1, name: 'D4', freq: 293.66 },
    ],
  },
  half_step_down: {
    id: 'half_step_down',
    name: '반음 다운 (Eb)',
    notes: [
      { stringNumber: 6, name: 'Eb2', freq: 77.78 },
      { stringNumber: 5, name: 'Ab2', freq: 103.83 },
      { stringNumber: 4, name: 'Db3', freq: 138.59 },
      { stringNumber: 3, name: 'Gb3', freq: 185.0 },
      { stringNumber: 2, name: 'Bb3', freq: 233.08 },
      { stringNumber: 1, name: 'Eb4', freq: 311.13 },
    ],
  },
  open_d: {
    id: 'open_d',
    name: 'Open D',
    notes: [
      { stringNumber: 6, name: 'D2', freq: 73.42 },
      { stringNumber: 5, name: 'A2', freq: 110.0 },
      { stringNumber: 4, name: 'D3', freq: 146.83 },
      { stringNumber: 3, name: 'F#3', freq: 185.0 },
      { stringNumber: 2, name: 'A3', freq: 220.0 },
      { stringNumber: 1, name: 'D4', freq: 293.66 },
    ],
  },
  open_g: {
    id: 'open_g',
    name: 'Open G',
    notes: [
      { stringNumber: 6, name: 'D2', freq: 73.42 },
      { stringNumber: 5, name: 'G2', freq: 98.0 },
      { stringNumber: 4, name: 'D3', freq: 146.83 },
      { stringNumber: 3, name: 'G3', freq: 196.0 },
      { stringNumber: 2, name: 'B3', freq: 246.94 },
      { stringNumber: 1, name: 'D4', freq: 293.66 },
    ],
  },
  bass_4: {
    id: 'bass_4',
    name: '베이스 (4현)',
    notes: [
      { stringNumber: 4, name: 'E1', freq: 41.2 },
      { stringNumber: 3, name: 'A1', freq: 55.0 },
      { stringNumber: 2, name: 'D2', freq: 73.42 },
      { stringNumber: 1, name: 'G2', freq: 98.0 },
    ],
  },
  bass_5: {
    id: 'bass_5',
    name: '베이스 (5현)',
    notes: [
      { stringNumber: 5, name: 'B0', freq: 30.87 },
      { stringNumber: 4, name: 'E1', freq: 41.2 },
      { stringNumber: 3, name: 'A1', freq: 55.0 },
      { stringNumber: 2, name: 'D2', freq: 73.42 },
      { stringNumber: 1, name: 'G2', freq: 98.0 },
    ],
  },
  ukulele: {
    id: 'ukulele',
    name: '우쿨렐레',
    notes: [
      { stringNumber: 4, name: 'G4', freq: 392.0 },
      { stringNumber: 3, name: 'C4', freq: 261.63 },
      { stringNumber: 2, name: 'E4', freq: 329.63 },
      { stringNumber: 1, name: 'A4', freq: 440.0 },
    ],
  },
  chromatic: {
    id: 'chromatic',
    name: '크로매틱',
    notes: [],
  },
};

export interface TunerState {
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;

  baseA4: number;
  setBaseA4: (baseA4: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  currentPresetId: string;
  setPreset: (presetId: string) => void;

  frequency: number;
  cents: number;
  noteName: string;
  octave: number | null;
  activeStringNumber: number | null;
  isInTune: boolean;
  isHolding: boolean;

  tunedStrings: number[];
  markStringTuned: (stringNum: number) => void;
  unmarkStringTuned: (stringNum: number) => void;
  resetTunedStrings: () => void;

  setPitchData: (data: {
    frequency: number;
    cents: number;
    noteName: string;
    octave: number | null;
    activeStringNumber: number | null;
    isInTune: boolean;
    isHolding: boolean;
  }) => void;
  clearPitchData: () => void;
}

export const useTunerStore = create<TunerState>((set) => ({
  isActive: false,
  setIsActive: (isActive) =>
    set({
      isActive,
      ...(isActive
        ? {}
        : {
            frequency: 0,
            cents: 0,
            noteName: '--',
            octave: null,
            activeStringNumber: null,
            isInTune: false,
            isHolding: false,
          }),
    }),

  baseA4: 440,
  setBaseA4: (baseA4) => set({ baseA4 }),

  soundEnabled: true,
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),

  theme: 'dark',
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (nextTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
      return { theme: nextTheme };
    }),

  currentPresetId: 'guitar_std',
  setPreset: (presetId) =>
    set({
      currentPresetId: presetId,
      tunedStrings: [],
      activeStringNumber: null,
      frequency: 0,
      cents: 0,
      noteName: '--',
      octave: null,
      isInTune: false,
      isHolding: false,
    }),

  frequency: 0,
  cents: 0,
  noteName: '--',
  octave: null,
  activeStringNumber: null,
  isInTune: false,
  isHolding: false,

  tunedStrings: [],
  markStringTuned: (stringNum) =>
    set((state) => ({
      tunedStrings: state.tunedStrings.includes(stringNum)
        ? state.tunedStrings
        : [...state.tunedStrings, stringNum],
    })),
  unmarkStringTuned: (stringNum) =>
    set((state) => ({
      tunedStrings: state.tunedStrings.filter((n) => n !== stringNum),
    })),
  resetTunedStrings: () => set({ tunedStrings: [] }),

  setPitchData: (data) => set(data),
  clearPitchData: () =>
    set({
      frequency: 0,
      cents: 0,
      noteName: '--',
      octave: null,
      activeStringNumber: null,
      isInTune: false,
      isHolding: false,
    }),
}));