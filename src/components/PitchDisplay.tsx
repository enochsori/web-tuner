import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import type { PitchData } from '../types/tuner';

export interface PitchDisplayRef {
  update: (data: PitchData | null) => void;
}

export const PitchDisplay = forwardRef<PitchDisplayRef>((_, ref) => {
  const noteRef = useRef<HTMLHeadingElement>(null);
  const octaveRef = useRef<HTMLSpanElement>(null);
  const freqRef = useRef<HTMLSpanElement>(null);
  const centsRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 실시간 애니메이션용 ref
  const pitchDataRef = useRef<PitchData | null>(null);
  const offsetRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafRef = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    update(data: PitchData | null) {
      pitchDataRef.current = data;

      if (!noteRef.current || !octaveRef.current || !freqRef.current || !centsRef.current) return;

      if (!data) {
        noteRef.current.textContent = '--';
        noteRef.current.className = 'text-8xl sm:text-9xl font-black tracking-tighter text-zinc-700 transition-colors';
        octaveRef.current.textContent = '';
        freqRef.current.textContent = '00.0 Hz';
        centsRef.current.textContent = '0 Cent';
        centsRef.current.className = 'font-mono text-xs px-2 py-0.5 rounded font-bold bg-zinc-800 text-zinc-500';
        return;
      }

      const boundedCent = Math.max(-50, Math.min(50, data.cents));
      noteRef.current.textContent = data.note;
      octaveRef.current.textContent = String(data.octave);
      freqRef.current.textContent = `${data.frequency.toFixed(1)} Hz`;
      centsRef.current.textContent = `${boundedCent >= 0 ? '+' : ''}${Math.round(boundedCent)} Cent`;

      if (data.isInTune) {
        noteRef.current.className = 'text-8xl sm:text-9xl font-black tracking-tighter text-emerald-400 drop-shadow-[0_0_40px_rgba(52,211,153,0.6)] transition-colors';
        centsRef.current.className = 'font-mono text-xs px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.3)]';
      } else {
        const isClose = Math.abs(boundedCent) <= 10;
        noteRef.current.className = `text-8xl sm:text-9xl font-black tracking-tighter ${isClose ? 'text-amber-400' : 'text-zinc-200'} transition-colors`;
        centsRef.current.className = 'font-mono text-xs px-2 py-0.5 rounded font-bold bg-zinc-800 text-zinc-300';
      }
    },
  }));

  // 스트로브 Canvas 고성능 60fps 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (time: number) => {
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      const data = pitchDataRef.current;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 배경 그리드 가이드
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, width, height);

      if (data && data.frequency > 0) {
        // Cents에 정비례하는 스트로브 회전 속도 (In-Tune일 때 0에 수렴하여 완전 정지)
        const speed = (data.cents / 50) * 320; // 픽셀 이동 속도
        offsetRef.current = (offsetRef.current + speed * dt) % 60;

        const isInTune = data.isInTune;
        const mainColor = isInTune ? '#34d399' : Math.abs(data.cents) <= 10 ? '#fbbf24' : '#94a3b8';

        // 3단 스트로브 트랙 렌더링 (Peterson 스타일 3단 디스크 패턴)
        const tracks = [
          { y: 8, h: 22, bandW: 24, mult: 1.0 },
          { y: 34, h: 18, bandW: 16, mult: 0.75 },
          { y: 56, h: 14, bandW: 12, mult: 0.5 },
        ];

        tracks.forEach((track) => {
          ctx.fillStyle = mainColor;
          const bandSpacing = track.bandW * 2;
          const trackOffset = (offsetRef.current * track.mult) % bandSpacing;
          const totalBands = Math.ceil(width / bandSpacing) + 3;

          for (let i = -2; i < totalBands; i++) {
            const x = i * bandSpacing + trackOffset;
            ctx.fillRect(x, track.y, track.bandW, track.h);
          }
        });

        // 중앙 타겟 정렬 바 & 조준선
        ctx.fillStyle = isInTune ? '#10b981' : '#f59e0b';
        ctx.shadowColor = isInTune ? 'rgba(52,211,153,0.9)' : 'rgba(245,158,11,0.6)';
        ctx.shadowBlur = isInTune ? 14 : 6;
        ctx.fillRect(width / 2 - 2, 0, 4, height);
        ctx.shadowBlur = 0; // 초기화
      } else {
        // 미입력 대기 상태 가이드 라인
        ctx.fillStyle = '#27272a';
        ctx.fillRect(width / 2 - 1, 0, 2, height);

        // 연한 눈금 표시
        ctx.fillStyle = '#18181b';
        for (let x = 20; x < width; x += 40) {
          ctx.fillRect(x, height / 2 - 4, 2, 8);
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center relative">
      {/* 음정 표시 */}
      <div className="flex flex-col items-center mb-4">
        <div className="flex items-baseline justify-center">
          <h1 ref={noteRef} className="text-8xl sm:text-9xl font-black tracking-tighter text-zinc-700 transition-colors">--</h1>
          <span ref={octaveRef} className="text-3xl sm:text-4xl font-bold text-zinc-500 ml-1"></span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span ref={freqRef} className="font-mono text-sm text-zinc-400 font-semibold tracking-wider">00.0 Hz</span>
          <span ref={centsRef} className="font-mono text-xs px-2 py-0.5 rounded font-bold bg-zinc-800 text-zinc-500">0 Cent</span>
        </div>
      </div>

      {/* 대형 프로 스트로브 디스크 디스플레이 */}
      <div className="w-full max-w-[340px] flex flex-col items-center">
        <div className="w-full h-20 bg-zinc-950 border border-zinc-800/90 rounded-2xl overflow-hidden relative shadow-[inset_0_2px_12px_rgba(0,0,0,0.8)] flex items-center justify-center">
          <canvas ref={canvasRef} width={340} height={80} className="w-full h-full" />
          
          {/* 눈금 가이드 오버레이 */}
          <div className="absolute inset-x-3 bottom-1 flex justify-between text-[9px] font-mono text-zinc-600 pointer-events-none select-none">
            <span>FLAT ◀</span>
            <span className="text-zinc-500 font-bold">STROBE TARGET</span>
            <span>▶ SHARP</span>
          </div>
        </div>
      </div>
    </div>
  );
});

PitchDisplay.displayName = 'PitchDisplay';