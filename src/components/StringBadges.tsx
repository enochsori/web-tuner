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
    <div className="w-full max-w-md px-1 mt-4">
      {/* 화면 너비에 맞춰 찌그러짐 없이 꽉 차는 그리드 레이아웃 */}
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2 w-full">
        {currentPreset.notes.map((item) => {
          const isTarget = activeStringNumber === item.stringNumber;
          const isPlaying = playingFreq === item.freq;

          return (
            <button
              key={item.stringNumber}
              onClick={() => handleStringClick(item.freq)}
              className={`py-3 px-1 rounded-2xl transition-all duration-200 flex flex-col items-center justify-center relative cursor-pointer active:scale-95 select-none ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.45)]'
                  : isTarget
                  ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.35)]'
                  : 'bg-white/80 dark:bg-zinc-800/70 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/60 hover:border-slate-300 dark:hover:border-zinc-600 shadow-sm'
              }`}
            >
              {/* 상단 현 번호 및 재생 아이콘 (완전 중앙 정렬) */}
              <div className="flex items-center justify-center gap-0.5 leading-none">
                <span
                  className={`text-[10px] font-mono tracking-tight ${
                    isPlaying
                      ? 'text-amber-400 font-bold'
                      : isTarget
                      ? 'text-emerald-400 font-bold'
                      : 'text-slate-400 dark:text-zinc-500'
                  }`}
                >
                  {item.stringNumber}번
                </span>
                {isPlaying && <Volume2 className="w-2.5 h-2.5 text-amber-400 animate-pulse ml-0.5" />}
              </div>

              {/* 메인 음정명 (중앙 배치) */}
              <span
                className={`text-sm sm:text-base font-black tracking-tight mt-1 leading-none ${
                  isPlaying
                    ? 'text-white'
                    : isTarget
                    ? 'text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                    : 'text-slate-800 dark:text-zinc-100'
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}