import { Mic, MicOff } from 'lucide-react';
import { useTunerStore, PRESETS } from '../stores/useTunerStore';

export function TunerControls() {
  const { isActive, setIsActive, currentPresetId, setPreset } = useTunerStore();
  const presetList = Object.values(PRESETS);

  return (
    <div className="w-full max-w-md flex flex-col gap-3 mt-4">
      {/* 악기 및 조율 프리셋 선택 박스 */}
      <div className="bg-[#12161f] border border-zinc-800/80 rounded-2xl p-3 shadow-lg">
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {presetList.map((preset) => {
            const isSelected = currentPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setPreset(preset.id)}
                className={`py-2 px-1 text-center rounded-xl text-xs sm:text-[13px] font-bold transition-all duration-200 cursor-pointer truncate ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                }`}
                title={preset.name}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 하단 튜너 활성화/비활성화 버튼 */}
      <button
        onClick={() => setIsActive(!isActive)}
        className={`w-full py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg active:scale-[0.98] ${
          isActive
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 hover:bg-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
            : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold shadow-[0_0_25px_rgba(16,185,129,0.4)]'
        }`}
      >
        {isActive ? (
          <>
            <MicOff className="w-5 h-5 stroke-[2.5]" />
            튜너 끄기
          </>
        ) : (
          <>
            <Mic className="w-5 h-5 stroke-[2.5]" />
            튜너 활성화
          </>
        )}
      </button>
    </div>
  );
}