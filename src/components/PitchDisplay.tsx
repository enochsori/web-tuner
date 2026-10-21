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
  const animIdRef = useRef<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const ambientGlowRef = useRef<HTMLDivElement | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);
  const noteTextRef = useRef<HTMLSpanElement | null>(null);
  const octaveTextRef = useRef<HTMLSpanElement | null>(null);
  const freqTextRef = useRef<HTMLSpanElement | null>(null);
  const centsBadgeRef = useRef<HTMLDivElement | null>(null);

  // 모든 현 조율 완료 시 세레모니
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

        if (contentWrapperRef.current) {
          contentWrapperRef.current.style.opacity = isHolding ? '0.6' : '1';
          contentWrapperRef.current.style.transition = 'opacity 0.2s ease-out';
        }

        if (noteTextRef.current) {
          noteTextRef.current.innerText = data.note || data.noteName || '--';
          noteTextRef.current.className = `text-7xl font-black font-mono tracking-tighter transition-all duration-150 ${
            isInTune
              ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.9)]'
              : 'text-zinc-100 drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]'
          }`;
        }

        if (octaveTextRef.current) {
          octaveTextRef.current.innerText = data.octave !== null ? String(data.octave) : '';
          octaveTextRef.current.className = `text-2xl font-black ml-1.5 ${
            isInTune ? 'text-emerald-400' : 'text-zinc-500'
          }`;
        }

        if (freqTextRef.current) {
          freqTextRef.current.innerText = `${data.frequency.toFixed(1)} Hz`;
        }

        if (centsBadgeRef.current) {
          const sign = data.cents > 0 ? '+' : '';
          centsBadgeRef.current.innerText = `${sign}${data.cents.toFixed(1)} C`;
          centsBadgeRef.current.className = `px-2.5 py-0.5 rounded-md border font-mono text-[11px] font-bold transition-all ${
            isInTune
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400'
          }`;
        }

        if (containerRef.current && !isAllTuned) {
          containerRef.current.className = `w-full rounded-2xl p-[2px] transition-all duration-300 relative ${
            isInTune
              ? 'bg-gradient-to-b from-emerald-500 via-zinc-800 to-zinc-950 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
              : 'bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 shadow-xl'
          }`;
        }

        if (ambientGlowRef.current && !isAllTuned) {
          ambientGlowRef.current.className = `absolute -inset-1 rounded-2xl blur-xl transition-all duration-300 pointer-events-none ${
            isInTune ? 'opacity-30 bg-emerald-500' : 'opacity-0 bg-transparent'
          }`;
        }
      } else {
        if (contentWrapperRef.current) {
          contentWrapperRef.current.style.opacity = '1';
        }
        if (noteTextRef.current) {
          noteTextRef.current.innerText = '--';
          noteTextRef.current.className =
            'text-7xl font-black font-mono tracking-tighter text-zinc-600';
        }
        if (octaveTextRef.current) octaveTextRef.current.innerText = '';
        if (freqTextRef.current) freqTextRef.current.innerText = '--.- Hz';

        if (centsBadgeRef.current) {
          centsBadgeRef.current.innerText = '0.0 C';
          centsBadgeRef.current.className =
            'px-2.5 py-0.5 rounded-md border font-mono text-[11px] font-bold bg-zinc-900 border-zinc-800 text-zinc-600';
        }

        if (containerRef.current && !isAllTuned) {
          containerRef.current.className =
            'w-full rounded-2xl p-[2px] transition-all duration-300 relative bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 shadow-xl';
        }
        if (ambientGlowRef.current && !isAllTuned) {
          ambientGlowRef.current.className =
            'absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-all duration-300 pointer-events-none bg-transparent';
        }
      }
    },
  }));

  // PolyTune 스타일 고휘도 수직 LED 미터 캔버스 렌더러
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // 하드웨어 아크릴 패널 배경
      ctx.fillStyle = '#05070a';
      ctx.fillRect(0, 0, width, height);

      const current = pitchRef.current;
      const totalColumns = 25; // 중앙(12) 기준 좌우 12열씩
      const colWidth = 10;
      const colGap = 3;
      const totalMeterWidth = totalColumns * colWidth + (totalColumns - 1) * colGap;
      const startX = (width - totalMeterWidth) / 2;

      const numRows = 7;
      const rowHeight = 7;
      const rowGap = 3;
      const meterTop = 14;

      const centerCol = 12; // 0센트 중앙 인덱스
      const cents = current ? current.cents : 0;
      const isInTune = current ? current.isInTune : false;

      // 센트(-50 ~ +50)를 열 오프셋(-12 ~ +12)으로 매핑
      const activeColOffset = current
        ? Math.round(Math.max(-12, Math.min(12, cents / 4.0)))
        : 0;

      for (let c = 0; c < totalColumns; c++) {
        const x = startX + c * (colWidth + colGap);
        const isCenter = c === centerCol || c === centerCol - 1;

        for (let r = 0; r < numRows; r++) {
          const y = meterTop + r * (rowHeight + rowGap);

          // LED 꺼짐 기본 상태 (어두운 회색 슬롯)
          let ledColor = '#121824';
          let isLit = false;

          if (current) {
            if (isInTune) {
              // 정음일 때: 중앙 2개 열 전체가 밝은 에메랄드 그린 점등
              if (isCenter) {
                ledColor = '#10b981';
                isLit = true;
              }
            } else {
              // 피치가 빗나갔을 때: 해당 오프셋 열에 LED 바 표시
              const targetCol = centerCol + activeColOffset;
              const distanceToTarget = Math.abs(c - targetCol);

              if (distanceToTarget === 0) {
                // 주 바늘 열 (음 높이에 따라 주황/빨강)
                ledColor = activeColOffset < 0 ? '#f97316' : '#ef4444';
                isLit = true;
              } else if (distanceToTarget === 1) {
                // 인접 열 미세 번짐 효과
                ledColor = activeColOffset < 0 ? 'rgba(249, 115, 22, 0.35)' : 'rgba(239, 68, 68, 0.35)';
                isLit = true;
              }
            }
          }

          // LED 도트 그리기
          ctx.beginPath();
          ctx.roundRect(x, y, colWidth, rowHeight, 1.5);
          ctx.fillStyle = ledColor;
          ctx.fill();

          // 점등된 LED 글로우 효과
          if (isLit) {
            ctx.shadowColor = ledColor;
            ctx.shadowBlur = isInTune ? 8 : 4;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // 중앙 타겟 마커 가이드라인
      const centerGuideX = startX + centerCol * (colWidth + colGap) - colGap / 2;
      ctx.strokeStyle = isInTune ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerGuideX, meterTop - 4);
      ctx.lineTo(centerGuideX, meterTop + numRows * (rowHeight + rowGap) + 2);
      ctx.stroke();

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
        className={`w-full rounded-2xl p-[2px] transition-all duration-500 relative ${
          isAllTuned
            ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.5)] animate-pulse'
            : 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 shadow-2xl'
        }`}
      >
        <div
          ref={ambientGlowRef}
          className={`absolute -inset-1 rounded-2xl blur-xl transition-all duration-500 pointer-events-none ${
            isAllTuned ? 'opacity-35 bg-emerald-400' : 'opacity-0 bg-transparent'
          }`}
        />

        {/* 폴리튠 페달 섀시 내부 패널 */}
        <div
          ref={contentWrapperRef}
          className="relative w-full bg-[#0a0d14] rounded-[14px] p-5 flex flex-col items-center overflow-hidden border border-zinc-800/80 shadow-inner"
        >
          {/* 상단 기기 인디케이터 헤더 */}
          <div className="w-full flex justify-between items-center mb-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0f141f] border border-zinc-800">
              <span className="text-[9px] font-mono font-bold text-zinc-500 tracking-wider">REF</span>
              <span ref={freqTextRef} className="text-xs font-mono font-bold text-zinc-300">
                --.- Hz
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                ref={centsBadgeRef}
                className="px-2.5 py-0.5 rounded border font-mono text-[11px] font-bold bg-zinc-900 border-zinc-800 text-zinc-600"
              >
                0.0 C
              </div>
            </div>
          </div>

          {/* PolyTune 수직 LED 매트릭스 캔버스 */}
          <div className="relative w-full flex justify-center my-1 bg-[#05070a] rounded-lg p-1 border border-zinc-900">
            <canvas
              ref={canvasRef}
              width={340}
              height={90}
              className="w-full h-[90px]"
            />
          </div>

          {/* 메인 디지털 노트 디스플레이 */}
          <div className="relative mt-3 mb-1 flex items-baseline justify-center">
            <span
              ref={noteTextRef}
              className="text-7xl font-black font-mono tracking-tighter text-zinc-600"
            >
              --
            </span>
            <span
              ref={octaveTextRef}
              className="text-2xl font-black ml-1.5 text-zinc-600"
            />
          </div>

          {/* 하단 미터 눈금 가이드 */}
          <div className="w-full flex justify-between text-[10px] font-mono font-bold text-zinc-600 px-3 mt-1">
            <span className="text-amber-500/70 font-mono">b FLAT</span>
            <span className="text-emerald-500 font-mono tracking-wider font-extrabold">IN TUNE</span>
            <span className="text-rose-500/70 font-mono"># SHARP</span>
          </div>
        </div>
      </div>
    </div>
  );
});

PitchDisplay.displayName = 'PitchDisplay';