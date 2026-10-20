export interface PitchData {
    frequency: number;
    note: string;
    noteName?: string; // 하위 호환 및 신규 디스플레이용
    octave: number | null;
    cents: number;
    clarity?: number;
    isInTune: boolean;
    isHolding?: boolean; // 1.2초 서스테인 홀드 디밍 상태 플래그
    targetStringNumber?: number | null; // 현재 조율 중으로 매칭된 현 번호 (예: 6, 5, 4 등)
    activeStringNumber?: number | null;
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