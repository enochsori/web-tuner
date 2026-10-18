import { Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { useTunerStore } from '../stores/useTunerStore';

export function Header() {
  const { isActive, baseA4, soundEnabled, setSoundEnabled, theme, toggleTheme } = useTunerStore();

  return (
    <header className="w-full max-w-md flex flex-col gap-2 pt-3 pb-2">
      <div className="flex justify-between items-center px-1">
        {/* 로고 & 상태 인디케이터 */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]'
                  : 'bg-zinc-400 dark:bg-zinc-700'
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

        {/* 우측 컨트롤 (테마 토글, 사운드 토글, A4 주파수) */}
        <div className="flex items-center gap-1.5">
          {/* 다크/라이트 모드 토글 버튼 */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm active:scale-95"
            title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* 사운드 토글 */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-all duration-200 active:scale-95 ${
              soundEnabled
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500'
            }`}
            title="정음 알림음 토글"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* 기준 주파수 뱃지 */}
          <div className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-zinc-900/90 border border-cyan-500/30 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-cyan-700 dark:text-cyan-300 tracking-wider">
              {baseA4}Hz
            </span>
          </div>
        </div>
      </div>

      {/* 헤더 디바이더 라인 */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent mt-1" />
    </header>
  );
}