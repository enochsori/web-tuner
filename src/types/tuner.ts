export interface PitchData {
    frequency: number;
    note: string;
    noteName: string;
    octave: number | null;
    cents: number;
    clarity?: number;
    isInTune: boolean;
    isHolding: boolean;
    activeStringNumber: number | null; // 물음표(?) 제거하여 number | null 로 통일
    targetStringNumber?: number | null;
  }
  
  export interface PresetNote {
    name: string;
    freq: number;
    stringNumber: number;
  }
  
  export interface TuningPreset {
    id: string;
    label: string;
    notes: PresetNote[];
  }