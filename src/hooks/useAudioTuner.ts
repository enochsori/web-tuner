import { useEffect, useRef } from 'react';
import { useTunerStore } from '../stores/useTunerStore';
import { YinPitchDetector } from '../audio/YinPitchDetector';
import type { PitchData } from '../types/tuner';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BUFFER_SIZE = 4096;

export function useAudioTuner(onPitchUpdate: (data: PitchData | null) => void) {
  const { isActive, baseA4 } = useTunerStore();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastVibrateTime = useRef(0);

  useEffect(() => {
    if (!isActive) {
      cleanup();
      return;
    }

    const initAudio = async () => {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
        streamRef.current = stream;

        const source = ctx.createMediaStreamSource(stream);

        const hpFilter = ctx.createBiquadFilter();
        hpFilter.type = 'highpass';
        hpFilter.frequency.value = 35;

        const lpFilter = ctx.createBiquadFilter();
        lpFilter.type = 'lowpass';
        lpFilter.frequency.value = 1600;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = BUFFER_SIZE;

        source.connect(hpFilter);
        hpFilter.connect(lpFilter);
        lpFilter.connect(analyser);

        const detector = new YinPitchDetector(BUFFER_SIZE, ctx.sampleRate);
        const buffer = new Float32Array(BUFFER_SIZE);

        const loop = () => {
          analyser.getFloatTimeDomainData(buffer);

          let sumSquares = 0;
          for (let i = 0; i < buffer.length; i++) sumSquares += buffer[i] * buffer[i];
          const rms = Math.sqrt(sumSquares / buffer.length);

          if (rms > 0.008) {
            const { pitch, clarity } = detector.detect(buffer);

            if (pitch >= 35 && pitch <= 1400 && clarity > 0.85) {
              const noteNum = 12 * (Math.log(pitch / baseA4) / Math.log(2));
              const roundedNote = Math.round(noteNum) + 69;
              const perfectFreq = baseA4 * Math.pow(2, (roundedNote - 69) / 12);
              const cents = Math.floor(1200 * (Math.log(pitch / perfectFreq) / Math.log(2)));
              
              const noteName = NOTE_NAMES[roundedNote % 12];
              const octave = Math.floor(roundedNote / 12) - 1;
              const isInTune = Math.abs(cents) <= 3;

              if (isInTune && navigator.vibrate) {
                const now = Date.now();
                if (now - lastVibrateTime.current > 500) {
                  navigator.vibrate(35);
                  lastVibrateTime.current = now;
                }
              }

              onPitchUpdate({
                frequency: pitch,
                note: noteName,
                octave,
                cents,
                clarity,
                isInTune,
              });
            }
          } else {
            onPitchUpdate(null);
          }

          rafIdRef.current = requestAnimationFrame(loop);
        };

        loop();
      } catch (err) {
        console.error('Audio init failed:', err);
      }
    };

    initAudio();

    return () => cleanup();
  }, [isActive, baseA4]);

  const cleanup = () => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    onPitchUpdate(null);
  };
}