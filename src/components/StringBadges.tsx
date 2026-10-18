import { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { useTunerStore, PRESETS } from '../stores/useTunerStore';
import { tonePlayer } from '../audio/TonePlayer';

export function StringBadges() {
  const { currentPresetId, activeStringNumber } = useTunerStore();
  const [playingFreq, setPlayingFreq] = useState<number | null>(null);
  const currentPreset = PRESETS[currentPresetId];

  // 프리셋이 바뀌면 재생 중이던 기준음 정지
  useEffect(() => {
    tonePlayer.stop();
    setPlayingFreq(null);
  }, [currentPresetId]);

  if (!currentPreset || currentPreset.notes.length === 0) return null;

  const handleStringClick = (freq: number) => {
    const isPlaying = tonePlayer.playTone(freq);
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
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center min-w-[54px] active:scale-95 cursor-pointer relative ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] scale-105'
                  : isTarget
                  ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.35)] scale-105 animate-pulse'
                  : 'bg-zinc-900/90 text-zinc-400 border border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-0.5">
                <span className={`text-[10px] font-semibold ${isPlaying ? 'text-amber-400' : isTarget ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {item.stringNumber}번
                </span>
                {isPlaying && <Volume2 className="w-2.5 h-2.5 text-amber-400 animate-bounce" />}
              </div>
              <span className={`text-sm font-black ${isPlaying ? 'text-white' : isTarget ? 'text-white' : 'text-zinc-200'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
      <span className="text-[10px] text-zinc-600 font-mono mt-2 tracking-wide">
        줄 버튼을 누르면 청음용 기준음이 재생됩니다
      </span>
    </div>
  );
}