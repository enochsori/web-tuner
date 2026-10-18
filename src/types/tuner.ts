export interface PitchData {
    frequency: number;
    note: string;
    octave: number;
    cents: number;
    clarity: number;
    isInTune: boolean;
    targetStringNumber?: number | null; // 현재 조율 중으로 매칭된 현 번호 (예: 6, 5, 4 등)
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