import { useState, useEffect } from 'react';
import { Volume2, Check } from 'lucide-react';
import { useTunerStore, PRESETS } from '../stores/useTunerStore';
import { tonePlayer } from '../audio/TonePlayer';

export function StringBadges() {
  const { currentPresetId, activeStringNumber, tunedStrings } = useTunerStore();
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
    <div className="w-full max-w-md px-1 mt-4 flex flex-col items-center">
      {/* 4줄, 5줄, 6줄 악기 모두 일정한 크기로 가운데 정렬되는 컨테이너 */}
      <div className="flex justify-center items-center gap-2 sm:gap-3 w-full">
        {currentPreset.notes.map((item) => {
          const isTarget = activeStringNumber === item.stringNumber;
          const isPlaying = playingFreq === item.freq;
          const isTuned = tunedStrings?.includes(item.stringNumber);

          return (
            <button
              key={item.stringNumber}
              onClick={() => handleStringClick(item.freq)}
              className={`w-[52px] sm:w-[58px] h-[64px] sm:h-[70px] rounded-2xl sm:rounded-3xl transition-all duration-300 flex flex-col items-center justify-center relative cursor-pointer active:scale-95 select-none shrink-0 border ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-105'
                  : isTarget
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.4)] scale-105'
                  : isTuned
                  ? 'bg-[#121b18] text-emerald-400 border-emerald-500/70 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                  : 'bg-[#151921]/90 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-[#1a202c]'
              }`}
            >
              {/* 상단: 현 번호 및 아이콘 (체크마크/재생) */}
              <div className="flex items-center justify-center gap-0.5 leading-none">
                <span
                  className={`text-[11px] font-mono tracking-tight ${
                    isPlaying
                      ? 'text-amber-400 font-bold'
                      : isTarget
                      ? 'text-emerald-400 font-bold'
                      : isTuned
                      ? 'text-emerald-500 font-semibold'
                      : 'text-zinc-500'
                  }`}
                >
                  {item.stringNumber}번
                </span>

                {isPlaying ? (
                  <Volume2 className="w-2.5 h-2.5 text-amber-400 animate-pulse ml-0.5" />
                ) : isTuned ? (
                  <Check className="w-3 h-3 text-emerald-400 stroke-[3] ml-0.5" />
                ) : null}
              </div>

              {/* 메인 음정명 (E1, A1, D2, G2...) */}
              <span
                className={`text-base sm:text-lg font-black tracking-tight mt-1 leading-none ${
                  isPlaying
                    ? 'text-white'
                    : isTarget
                    ? 'text-emerald-300 drop-shadow-[0_0_6px_rgba(52,211,153,0.7)]'
                    : isTuned
                    ? 'text-emerald-400'
                    : 'text-zinc-100'
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* 가이드 텍스트 (다크 모드 기준) */}
      <p className="text-[12px] text-zinc-500 mt-2.5 tracking-tight font-medium">
        줄 버튼을 누르면 청음용 기준음이 재생됩니다
      </p>
    </div>
  );
}