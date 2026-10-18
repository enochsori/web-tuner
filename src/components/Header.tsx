import { Volume2, VolumeX } from 'lucide-react';
import { useTunerStore } from '../stores/useTunerStore'; // <-- import type이 아니라 import { useTunerStore } 여야 합니다

export function Header() {
  const { isActive, baseA4, soundEnabled, setSoundEnabled } = useTunerStore();

  return (
    <header className="w-full max-w-md flex justify-between items-center py-2 border-b border-zinc-800/80">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
        <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">STROBE TUNER</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-1.5 rounded-lg border text-xs transition-colors ${
            soundEnabled
              ? 'bg-zinc-900 border-zinc-800 text-emerald-400'
              : 'bg-zinc-900/50 border-zinc-800/40 text-zinc-600'
          }`}
          title="튜닝 완료 챠임음 On/Off"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
          A4 = {baseA4}Hz
        </span>
      </div>
    </header>
  );
}