import { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { useTunerStore, PRESETS } from '../stores/useTunerStore';
import { tonePlayer } from '../audio/TonePlayer';

export function StringBadges() {
  const { currentPresetId, activeStringNumber } = useTunerStore();
  const [playingFreq, setPlayingFreq] = useState<number | null>(null);
  const currentPreset = PRESETS[currentPresetId];

  useEffect(() => {
    tonePlayer.stop();
    setPlayingFreq(null);
  }, [currentPresetId]);

  if (!currentPreset || currentPreset.notes.length === 0) return null;

  const handleStringClick = async (freq: number) => {
    const isPlaying = await tonePlayer.playTone(freq);
    setPlayingFreq(isPlaying ? freq : null);
  };

  return (
    <div className="w-full flex flex-col items-center mt-6">
      <div className="w-full flex justify-center gap-2 px-2 overflow-x-auto">
        {currentPreset.notes.map((item) => {
          const isTarget = activeStringNumber === item.stringNumber;
          const isPlaying = playingFreq === item.freq;

          return (
            <button
              key={item.stringNumber}
              onClick={() => handleStringClick(item.freq)}
              title="클릭하여 기준음 청음 재생"
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 flex flex-col items-center min-w-[56px] active:scale-95 cursor-pointer relative backdrop-blur-md ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] scale-105'
                  : isTarget
                  ? 'bg-gradient-to-b from-emerald-500/25 to-teal-500/10 text-emerald-300 border-2 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)] scale-105'
                  : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800/90 hover:border-zinc-700/80 hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex items-center gap-1">
                <span
                  className={`text-[10px] font-mono tracking-tight ${
                    isPlaying ? 'text-amber-400 font-bold' : isTarget ? 'text-emerald-400 font-bold' : 'text-zinc-500'
                  }`}
                >
                  {item.stringNumber}번
                </span>
                {isPlaying && <Volume2 className="w-2.5 h-2.5 text-amber-400 animate-pulse" />}
              </div>
              <span
                className={`text-sm font-black mt-0.5 tracking-tight ${
                  isPlaying
                    ? 'text-white'
                    : isTarget
                    ? 'text-white drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                    : 'text-zinc-300'
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
      <span className="text-[10px] text-zinc-500 font-mono mt-2 tracking-wide">
        줄 버튼을 누르면 청음용 기준음이 재생됩니다
      </span>
    </div>
  );
}