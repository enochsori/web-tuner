import { useTunerStore, PRESETS } from '../stores/useTunerStore';

export function StringBadges() {
  const { currentPresetId } = useTunerStore();
  const currentPreset = PRESETS[currentPresetId];

  if (!currentPreset || currentPreset.notes.length === 0) return null;

  return (
    <div className="w-full flex justify-center gap-2 mt-8 px-2 overflow-x-auto">
      {currentPreset.notes.map((item) => (
        <div
          key={item.stringNumber}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900/90 text-zinc-400 border border-zinc-800/80 flex flex-col items-center min-w-[52px]"
        >
          <span className="text-[10px] text-zinc-500">{item.stringNumber}번</span>
          <span className="text-zinc-200">{item.name}</span>
        </div>
      ))}
    </div>
  );
}