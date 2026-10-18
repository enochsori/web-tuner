export interface PitchData {
    frequency: number;
    note: string;
    octave: number;
    cents: number;
    clarity: number;
    isInTune: boolean;
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