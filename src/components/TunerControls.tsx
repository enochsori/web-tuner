import { Mic, MicOff } from 'lucide-react';
import { useTunerStore, PRESETS } from '../stores/useTunerStore';

export function TunerControls() {
  const { isActive, currentPresetId, setIsActive, setCurrentPresetId } = useTunerStore();

  return (
    <footer className="w-full max-w-md flex flex-col gap-3">
      {/* Preset Selector */}
      <div className="grid grid-cols-4 gap-1.5 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800/80">
        {Object.values(PRESETS).map((p) => (
          <button
            key={p.id}
            onClick={() => setCurrentPresetId(p.id)}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              currentPresetId === p.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Main Mic Button */}
      <button
        onClick={() => setIsActive(!isActive)}
        className={`w-full py-4 rounded-2xl font-extrabold text-base tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg ${
          isActive
            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
            : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-950/40'
        }`}
      >
        {isActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        <span>{isActive ? '튜너 일시 정지' : '튜너 활성화'}</span>
      </button>
    </footer>
  );
}