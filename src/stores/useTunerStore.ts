import { create } from 'zustand';
import type { TuningPreset } from '../types/tuner';

export const PRESETS: Record<string, TuningPreset> = {
  chromatic: { id: 'chromatic', label: '크로매틱', notes: [] },
  guitar: {
    id: 'guitar',
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
  bass: {
    id: 'bass',
    label: '베이스 (4현)',
    notes: [
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
};

interface TunerState {
  isActive: boolean;
  baseA4: number;
  currentPresetId: string;
  setIsActive: (active: boolean) => void;
  setBaseA4: (freq: number) => void;
  setCurrentPresetId: (id: string) => void;
}

export const useTunerStore = create<TunerState>((set) => ({
  isActive: false,
  baseA4: 440,
  currentPresetId: 'guitar',
  setIsActive: (active) => set({ isActive: active }),
  setBaseA4: (freq) => set({ baseA4: freq }),
  setCurrentPresetId: (id) => set({ currentPresetId: id }),
}));