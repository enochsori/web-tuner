import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { PitchData } from '../types/tuner';

export interface PitchDisplayRef {
  update: (data: PitchData | null) => void;
}

export const PitchDisplay = forwardRef<PitchDisplayRef>((_, ref) => {
  const noteRef = useRef<HTMLHeadingElement>(null);
  const octaveRef = useRef<HTMLSpanElement>(null);
  const freqRef = useRef<HTMLSpanElement>(null);
  const centsRef = useRef<HTMLSpanElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const ledRef = useRef<HTMLDivElement>(null);

  const smoothedCent = useRef(0);

  useImperativeHandle(ref, () => ({
    update(data: PitchData | null) {
      if (!noteRef.current || !octaveRef.current || !freqRef.current || !centsRef.current || !needleRef.current || !ledRef.current) return;

      if (!data) {
        noteRef.current.textContent = '--';
        noteRef.current.className = 'text-8xl sm:text-9xl font-black tracking-tighter text-zinc-700';
        octaveRef.current.textContent = '';
        freqRef.current.textContent = '00.0 Hz';
        centsRef.current.textContent = '0 Cent';
        centsRef.current.className = 'font-mono text-xs px-2 py-0.5 rounded font-bold bg-zinc-800 text-zinc-500';
        needleRef.current.style.transform = 'translateX(-50%) rotate(0deg)';
        needleRef.current.className = 'absolute bottom-2 left-1/2 w-1 h-20 bg-zinc-600 rounded-full origin-bottom -translate-x-1/2';
        ledRef.current.className = 'h-full w-6 bg-zinc-800 rounded-full transition-all';
        return;
      }

      smoothedCent.current = smoothedCent.current * 0.7 + data.cents * 0.3;
      const boundedCent = Math.max(-50, Math.min(50, smoothedCent.current));
      const rotation = (boundedCent / 50) * 45;

      noteRef.current.textContent = data.note;
      octaveRef.current.textContent = String(data.octave);
      freqRef.current.textContent = `${data.frequency.toFixed(1)} Hz`;
      centsRef.current.textContent = `${boundedCent >= 0 ? '+' : ''}${Math.round(boundedCent)} Cent`;
      needleRef.current.style.transform = `translateX(-50%) rotate(${rotation}deg)`;

      if (data.isInTune) {
        noteRef.current.className = 'text-8xl sm:text-9xl font-black tracking-tighter text-emerald-400 drop-shadow-[0_0_35px_rgba(52,211,153,0.5)]';
        needleRef.current.className = 'absolute bottom-2 left-1/2 w-1 h-20 bg-emerald-400 rounded-full origin-bottom -translate-x-1/2 shadow-[0_0_15px_rgba(52,211,153,0.8)]';
        ledRef.current.className = 'h-full w-24 bg-emerald-400 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.8)]';
        centsRef.current.className = 'font-mono text-xs px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
      } else {
        const isClose = Math.abs(boundedCent) <= 10;
        noteRef.current.className = `text-8xl sm:text-9xl font-black tracking-tighter ${isClose ? 'text-amber-400' : 'text-zinc-200'}`;
        needleRef.current.className = 'absolute bottom-2 left-1/2 w-1 h-20 bg-amber-400 rounded-full origin-bottom -translate-x-1/2';
        ledRef.current.className = 'h-full w-10 bg-amber-400/60 rounded-full';
        centsRef.current.className = 'font-mono text-xs px-2 py-0.5 rounded font-bold bg-zinc-800 text-zinc-300';
      }
    },
  }));

  return (
    <div className="w-full flex flex-col items-center justify-center relative">
      {/* Pitch & Note Display */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-baseline justify-center">
          <h1 ref={noteRef} className="text-8xl sm:text-9xl font-black tracking-tighter text-zinc-700 transition-colors">--</h1>
          <span ref={octaveRef} className="text-3xl sm:text-4xl font-bold text-zinc-500 ml-1"></span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span ref={freqRef} className="font-mono text-sm text-zinc-400 font-semibold tracking-wider">00.0 Hz</span>
          <span ref={centsRef} className="font-mono text-xs px-2 py-0.5 rounded font-bold bg-zinc-800 text-zinc-500">0 Cent</span>
        </div>
      </div>

      {/* Cent Arc Meter */}
      <div className="w-full relative flex flex-col items-center">
        <div className="w-full h-32 relative flex items-end justify-center overflow-hidden">
          <div className="absolute inset-x-6 bottom-2 flex justify-between text-[10px] font-mono text-zinc-500">
            <span>-50</span>
            <span>-25</span>
            <span className="text-xs font-bold text-emerald-400">0</span>
            <span>+25</span>
            <span>+50</span>
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0.5 h-14 bg-emerald-400/40 rounded-full" />
          <div ref={needleRef} className="absolute bottom-2 left-1/2 w-1 h-20 bg-zinc-600 rounded-full origin-bottom -translate-x-1/2 shadow-lg" />
        </div>
        <div className="w-full max-w-[260px] h-1.5 rounded-full bg-zinc-900 overflow-hidden relative mt-2 flex items-center justify-center">
          <div ref={ledRef} className="h-full w-6 bg-zinc-800 rounded-full transition-all" />
        </div>
      </div>
    </div>
  );
});

PitchDisplay.displayName = 'PitchDisplay';