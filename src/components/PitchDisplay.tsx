import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useTunerStore, PRESETS } from '../stores/useTunerStore';
import type { PitchData } from '../types/tuner';

export interface PitchDisplayRef {
  update: (data: PitchData | null) => void;
}

export const PitchDisplay = forwardRef<PitchDisplayRef>((_, ref) => {
  const { currentPresetId, tunedStrings } = useTunerStore();
  const [isAllTuned, setIsAllTuned] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pitchRef = useRef<PitchData | null>(null);
  const phaseRef = useRef<number[]>([0, 0, 0]);
  const animIdRef = useRef<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const ambientGlowRef = useRef<HTMLDivElement | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);
  const noteTextRef = useRef<HTMLSpanElement | null>(null);
  const octaveTextRef = useRef<HTMLSpanElement | null>(null);
  const freqTextRef = useRef<HTMLSpanElement | null>(null);
  const centsBadgeRef = useRef<HTMLDivElement | null>(null);
  const centsIndicatorRef = useRef<HTMLDivElement | null>(null);

  // 모든 줄 튜닝 완료 시 3.5초간 세레모니 점등
  useEffect(() => {
    const currentPreset = PRESETS[currentPresetId];
    const totalStrings = currentPreset?.notes?.length || 0;

    if (totalStrings > 0 && tunedStrings.length >= totalStrings) {
      setIsAllTuned(true);
      const timer = setTimeout(() => {
        setIsAllTuned(false);
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      setIsAllTuned(false);
    }
  }, [tunedStrings, currentPresetId]);

  useImperativeHandle(ref, () => ({
    update: (data: PitchData | null) => {
      pitchRef.current = data;

      if (data) {
        const isHolding = data.isHolding ?? false;
        const isInTune = data.isInTune ?? false;

        // 1.2s 홀드 상태일 때 내부 콘텐츠를 60% 투명도로 부드럽게 디밍
        if (contentWrapperRef.current) {
          contentWrapperRef.current.style.opacity = isHolding ? '0.6' : '1';
          contentWrapperRef.current.style.transition = 'opacity 0.25s ease-out';
        }

        if (noteTextRef.current) {
          noteTextRef.current.innerText = data.noteName || '--';
          noteTextRef.current.className = `text-7xl font-black font-mono tracking-tighter transition-all duration-150 ${
            isInTune
              ? 'text-emerald-300 drop-shadow-[0_0_25px_rgba(52,211,153,0.9)]'
              : 'text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-200 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]'
          }`;
        }

        if (octaveTextRef.current) {
          octaveTextRef.current.innerText = data.octave !== null ? String(data.octave) : '';
          octaveTextRef.current.className = `text-2xl font-black ml-1.5 ${
            isInTune ? 'text-emerald-400' : 'text-cyan-400'
          }`;
        }

        if (freqTextRef.current) {
          freqTextRef.current.innerText = `${data.frequency.toFixed(1)} Hz`;
        }

        if (centsBadgeRef.current) {
          const sign = data.cents > 0 ? '+' : '';
          centsBadgeRef.current.innerText = `${sign}${data.cents.toFixed(1)} CENTS`;
          centsBadgeRef.current.className = `px-3 py-1 rounded-lg border font-mono text-xs font-bold transition-all ${
            isInTune
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.6)] animate-pulse'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
          }`;
        }

        if (centsIndicatorRef.current) {
          const clamped = Math.max(-48, Math.min(48, data.cents));
          centsIndicatorRef.current.style.left = `calc(50% + ${clamped}%)`;
          centsIndicatorRef.current.style.opacity = '1';
          centsIndicatorRef.current.className = `absolute top-0 bottom-0 w-2.5 rounded-full transition-all duration-75 ${
            isInTune
              ? 'bg-emerald-300 shadow-[0_0_14px_#6ee7b7]'
              : 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
          }`;
        }

        if (containerRef.current && !isAllTuned) {
          containerRef.current.className = `w-full rounded-3xl p-[1.5px] transition-all duration-300 relative ${
            isInTune
              ? 'bg-gradient-to-b from-emerald-400 via-teal-500 to-emerald-600 shadow-[0_0_35px_rgba(52,211,153,0.45)]'
              : 'bg-gradient-to-b from-cyan-500/50 via-zinc-800 to-zinc-900 shadow-[0_0_25px_rgba(6,182,212,0.18)]'
          }`;
        }

        if (ambientGlowRef.current && !isAllTuned) {
          ambientGlowRef.current.className = `absolute -inset-1 rounded-3xl opacity-25 blur-xl transition-all duration-300 pointer-events-none ${
            isInTune ? 'bg-emerald-400 shadow-[0_0_30px_#34d399]' : 'bg-cyan-400'
          }`;
        }
      } else {
        // 소리가 완전히 사라졌을 때 대기 상태 복귀
        if (contentWrapperRef.current) {
          contentWrapperRef.current.style.opacity = '1';
        }
        if (noteTextRef.current) {
          noteTextRef.current.innerText = '--';
          noteTextRef.current.className =
            'text-7xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400';
        }
        if (octaveTextRef.current) octaveTextRef.current.innerText = '';
        if (freqTextRef.current) freqTextRef.current.innerText = '--.- Hz';

        if (centsBadgeRef.current) {
          centsBadgeRef.current.innerText = '0 CENTS';
          centsBadgeRef.current.className =
            'px-3 py-1 rounded-lg border font-mono text-xs font-bold bg-zinc-900/90 border-zinc-800 text-zinc-500';
        }
        if (centsIndicatorRef.current) {
          centsIndicatorRef.current.style.opacity = '0';
        }
        if (containerRef.current && !isAllTuned) {
          containerRef.current.className =
            'w-full rounded-3xl p-[1.5px] transition-all duration-300 relative bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 shadow-lg';
        }
        if (ambientGlowRef.current && !isAllTuned) {
          ambientGlowRef.current.className =
            'absolute -inset-1 rounded-3xl opacity-0 blur-xl transition-all duration-300 pointer-events-none bg-transparent';
        }
      }
    },
  }));

  // 60FPS 캔버스 스트로브 렌더러
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = '#060a11';
      ctx.fillRect(0, 0, width, height);

      const current = pitchRef.current;
      const numTracks = 3;
      const trackHeight = height / numTracks;

      if (!current) {
        ctx.fillStyle = '#1e293b';
        for (let t = 0; t < numTracks; t++) {
          const y = t * trackHeight;
          const bandCount = 12 * (t + 1);
          const bandWidth = width / bandCount;
          for (let i = 0; i < bandCount; i += 2) {
            ctx.fillRect(i * bandWidth, y + 2, bandWidth, trackHeight - 4);
          }
        }
      } else {
        const cents = current.cents;
        const isInTune = current.isInTune ?? false;
        const isHolding = current.isHolding ?? false;

        // 정음일 때는 거의 멈추며, 홀드 상태일 때는 관성 감속
        const speed = isInTune ? cents * 0.005 : cents * 0.035;

        for (let t = 0; t < numTracks; t++) {
          const y = t * trackHeight;
          const trackMultiplier = t + 1;
          phaseRef.current[t] =
            (phaseRef.current[t] + speed * trackMultiplier) % (Math.PI * 2);

          const bandCount = 10 * trackMultiplier;
          const bandWidth = width / bandCount;
          const offset = (phaseRef.current[t] / (Math.PI * 2)) * (bandWidth * 2);

          // 홀드 시에는 캔버스 패턴도 부드럽게 반투명 처리
          if (isInTune) {
            ctx.fillStyle = isHolding ? 'rgba(52, 211, 153, 0.45)' : '#34d399';
          } else {
            ctx.fillStyle = isHolding ? 'rgba(34, 211, 238, 0.45)' : '#22d3ee';
          }

          for (let x = -bandWidth * 4 + offset; x < width + bandWidth * 4; x += bandWidth * 2) {
            ctx.beginPath();
            ctx.roundRect(x, y + 2, bandWidth, trackHeight - 4, 3);
            ctx.fill();
          }
        }
      }

      animIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-md flex flex-col items-center mt-2">
      <div
        ref={containerRef}
        className={`w-full rounded-3xl p-[1.5px] transition-all duration-500 relative ${
          isAllTuned
            ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 shadow-[0_0_45px_rgba(52,211,153,0.6)] animate-pulse'
            : 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 shadow-lg'
        }`}
      >
        <div
          ref={ambientGlowRef}
          className={`absolute -inset-1 rounded-3xl blur-2xl transition-all duration-500 pointer-events-none ${
            isAllTuned
              ? 'opacity-40 bg-emerald-400 shadow-[0_0_50px_#34d399]'
              : 'opacity-0 bg-transparent'
          }`}
        />

        <div
          ref={contentWrapperRef}
          className="relative w-full bg-[#0a0f16]/95 backdrop-blur-xl rounded-[23px] p-6 flex flex-col items-center overflow-hidden border border-white/5"
        >
          {/* 상단 센트/주파수 헤더 */}
          <div className="w-full flex justify-between items-center mb-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                FREQ
              </span>
              <span ref={freqTextRef} className="text-xs font-mono font-bold text-zinc-200">
                --.- Hz
              </span>
            </div>

            <div
              ref={centsBadgeRef}
              className="px-3 py-1 rounded-lg border font-mono text-xs font-bold bg-zinc-900/90 border-zinc-800 text-zinc-500"
            >
              0 CENTS
            </div>
          </div>

          {/* 스트로브 캔버스 */}
          <div className="relative w-full flex justify-center my-2">
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-emerald-400/80 via-emerald-300 to-emerald-400/80 shadow-[0_0_10px_#34d399] z-10 pointer-events-none" />
            <canvas
              ref={canvasRef}
              width={340}
              height={100}
              className="w-full h-[100px] rounded-xl border border-zinc-800/80 bg-[#05080d]"
            />
          </div>

          {/* 메인 음정 텍스트 */}
          <div className="relative mt-4 flex items-baseline justify-center">
            <span
              ref={noteTextRef}
              className="text-7xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-200 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              --
            </span>
            <span
              ref={octaveTextRef}
              className="text-2xl font-black ml-1.5 text-cyan-400"
            />
          </div>

          {/* 하단 센트 룰러 바 */}
          <div className="w-full mt-5">
            <div className="relative w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_6px_#10b981] z-10" />
              <div
                ref={centsIndicatorRef}
                className="absolute top-0 bottom-0 w-2.5 rounded-full transition-all duration-75 opacity-0 bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                style={{
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-zinc-500 mt-1 px-1">
              <span>-50</span>
              <span className="text-emerald-400 font-bold tracking-wider">PERFECT</span>
              <span>+50</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PitchDisplay.displayName = 'PitchDisplay';