import { useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { PitchDisplay } from './components/PitchDisplay';
import type { PitchDisplayRef } from './components/PitchDisplay';
import { StringBadges } from './components/StringBadges';
import { TunerControls } from './components/TunerControls';
import { useAudioTuner } from './hooks/useAudioTuner';
import type { PitchData } from './types/tuner';

export default function App() {
  const pitchDisplayRef = useRef<PitchDisplayRef>(null);

  const handlePitchUpdate = useCallback((data: PitchData | null) => {
    pitchDisplayRef.current?.update(data);
  }, []);

  useAudioTuner(handlePitchUpdate);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#0c1017] text-zinc-800 dark:text-zinc-100 flex flex-col items-center justify-between p-4 transition-colors duration-300">
      <Header />
      <main className="w-full max-w-md flex-1 flex flex-col items-center justify-center relative">
        <PitchDisplay ref={pitchDisplayRef} />
        <StringBadges />
      </main>
      <TunerControls />
    </div>
  );
}