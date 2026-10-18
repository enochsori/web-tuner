import { Volume2, VolumeX, Sun, Moon, ChevronDown } from 'lucide-react';
import { useTunerStore } from '../stores/useTunerStore';

const PITCH_OPTIONS = [
  { val: 440, label: '440 Hz (Standard)' },
  { val: 442, label: '442 Hz (Orchestra)' },
  { val: 441, label: '441 Hz (Studio)' },
  { val: 443, label: '443 Hz (Concert)' },
  { val: 432, label: '432 Hz (Verdi / Healing)' },
];

export function Header() {
  const { isActive, baseA4, setBaseA4, soundEnabled, setSoundEnabled, theme, toggleTheme } = useTunerStore();

  return (
    <header className="w-full max-w-md flex flex-col gap-2 pt-3 pb-2 select-none relative">
      <div className="flex justify-between items-center px-1">
        {/* 좌측 로고 & 활성 인디케이터 */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isActive ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-zinc-400 dark:bg-zinc-700'
              }`}
            />
            {isActive && (
              <div className="absolute w-5 h-5 rounded-full bg-emerald-500/30 animate-ping" />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 uppercase">
              STROBE DSP
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono font-semibold">
              PRO
            </span>
          </div>
        </div>

        {/* 우측 3개 컨트롤 (높이 h-9 통일) */}
        <div className="flex items-center gap-2">
          {/* 다크/라이트 테마 버튼 */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* 사운드 알림음 토글 버튼 */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all shadow-sm active:scale-95 cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-white dark:bg-zinc-900/90 border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500'
            }`}
            title="정음 알림음 토글"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* A4 기준 주파수 셀렉트 박스 */}
          <div className="relative h-9 rounded-xl border border-cyan-500/30 bg-white dark:bg-zinc-900/90 hover:border-cyan-500/60 shadow-sm flex items-center px-2.5 gap-1.5 transition-all">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse pointer-events-none" />
            <span className="text-xs font-mono font-bold text-cyan-700 dark:text-cyan-300 tracking-wider pointer-events-none">
              {baseA4}Hz
            </span>
            <ChevronDown className="w-3 h-3 text-cyan-600 dark:text-cyan-400 pointer-events-none ml-0.5" />

            {/* 실제 선택 동작을 처리하는 투명 select 오버레이 */}
            <select
              value={baseA4}
              onChange={(e) => setBaseA4(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-sm"
              title="기준 주파수 선택"
            >
              {PITCH_OPTIONS.map((item) => (
                <option key={item.val} value={item.val} className="text-slate-900 bg-white dark:text-white dark:bg-zinc-900">
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 헤더 하단 디바이더 라인 */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent mt-1" />
    </header>
  );
}