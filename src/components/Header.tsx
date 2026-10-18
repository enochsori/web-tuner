import { useTunerStore } from '../stores/useTunerStore';

export function Header() {
  const { isActive, baseA4 } = useTunerStore();

  return (
    <header className="w-full max-w-md flex justify-between items-center py-2 border-b border-zinc-800/80">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
        <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">PRO TUNER (YIN DSP)</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
          A4 = {baseA4}Hz
        </span>
      </div>
    </header>
  );
}