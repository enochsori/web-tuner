import { useEffect, useRef } from 'react';
import { useTunerStore, PRESETS } from '../stores/useTunerStore';
import type { PitchData } from '../types/tuner';

const NOTE_STRINGS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function getChromaticNote(freq: number, baseA4: number) {
  const noteNum = 12 * (Math.log(freq / baseA4) / Math.log(2));
  const rounded = Math.round(noteNum) + 69;
  const cents = Math.round((noteNum - Math.round(noteNum)) * 100);
  const noteName = NOTE_STRINGS[rounded % 12];
  const octave = Math.floor(rounded / 12) - 1;
  return { noteName, octave, cents };
}

// YIN 기반 자기상관(Auto-correlation) 피치 검출
function autoCorrelate(buf: Float32Array, sampleRate: number): number {
  let SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) {
    const val = buf[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);

  // 미세 배경 소음 차단 게이트
  if (rms < 0.008) return -1;

  let r1 = 0;
  let r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < thres) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < thres) {
      r2 = SIZE - i;
      break;
    }
  }

  const trimmedBuf = buf.slice(r1, r2);
  SIZE = trimmedBuf.length;

  const c = new Array(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE - i; j++) {
      c[i] = c[i] + trimmedBuf[j] * trimmedBuf[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;
  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < SIZE; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  let T0 = maxpos;
  const x1 = c[T0 - 1];
  const x2 = c[T0];
  const x3 = c[T0 + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

export function useAudioTuner(onPitchUpdate?: (data: PitchData | null) => void) {
  const {
    isActive,
    baseA4,
    currentPresetId,
    markStringTuned,
    setPitchData,
    clearPitchData,
  } = useTunerStore();

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 정음 체류 시간 측정용 Ref
  const inTuneStartTimeRef = useRef<number | null>(null);
  const lastSoundTimeRef = useRef<number>(0);
  const onPitchUpdateRef = useRef(onPitchUpdate);

  useEffect(() => {
    onPitchUpdateRef.current = onPitchUpdate;
  }, [onPitchUpdate]);

  useEffect(() => {
    if (!isActive) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      clearPitchData();
      onPitchUpdateRef.current?.(null);
      inTuneStartTimeRef.current = null;
      return;
    }

    let isRunning = true;

    async function initAudio() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
        mediaStreamRef.current = stream;

        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);

        // 저주파 럼블 제거 (HPF 30Hz)
        const highpassFilter = ctx.createBiquadFilter();
        highpassFilter.type = 'highpass';
        highpassFilter.frequency.value = 30;

        // 고차 배음 옥타브 점프 억제 (LPF 850Hz)
        const lowpassFilter = ctx.createBiquadFilter();
        lowpassFilter.type = 'lowpass';
        lowpassFilter.frequency.value = 850;
        lowpassFilter.Q.value = 0.7;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;

        source.connect(highpassFilter);
        highpassFilter.connect(lowpassFilter);
        lowpassFilter.connect(analyser);

        analyserRef.current = analyser;
        const buffer = new Float32Array(analyser.fftSize);

        const updatePitchLoop = () => {
          if (!isRunning) return;

          analyser.getFloatTimeDomainData(buffer);
          const detectedFreq = autoCorrelate(buffer, ctx.sampleRate);
          const now = Date.now();

          const currentPreset = PRESETS[currentPresetId];
          const isPresetMode = currentPreset && currentPreset.notes.length > 0;

          if (detectedFreq > 30 && detectedFreq < 3000) {
            lastSoundTimeRef.current = now;

            let noteName = '';
            let octave: number | null = null;
            let cents = 0;
            let activeStringNumber: number | null = null;

            if (isPresetMode) {
              const notes = currentPreset.notes;
              let closestNote = notes[0];
              let minDiff = Infinity;

              for (const n of notes) {
                const adjustedFreq = n.freq * (baseA4 / 440);
                const diff = Math.abs(detectedFreq - adjustedFreq);
                if (diff < minDiff) {
                  minDiff = diff;
                  closestNote = { ...n, freq: adjustedFreq };
                }
              }

              cents = 1200 * Math.log2(detectedFreq / closestNote.freq);
              const noteMatch = closestNote.name.match(/^([A-G][b#]?)([0-9])?$/);
              noteName = noteMatch ? noteMatch[1] : closestNote.name;
              octave = noteMatch && noteMatch[2] ? parseInt(noteMatch[2], 10) : null;
              activeStringNumber = closestNote.stringNumber;
            } else {
              const chromatic = getChromaticNote(detectedFreq, baseA4);
              noteName = chromatic.noteName;
              octave = chromatic.octave;
              cents = chromatic.cents;
            }

            // 조건 1: 오차 ±2.0 센트 이내
            const isInTune = Math.abs(cents) <= 2.0;

            // 조건 2: 0.35초(350ms) 연속 유지 확인
            if (isInTune) {
              if (!inTuneStartTimeRef.current) {
                inTuneStartTimeRef.current = now;
              }
              if (now - inTuneStartTimeRef.current >= 350 && activeStringNumber !== null) {
                markStringTuned(activeStringNumber);
              }
            } else {
              inTuneStartTimeRef.current = null;
            }

            const pitchData: PitchData = {
              frequency: Math.round(detectedFreq * 10) / 10,
              cents: Math.round(cents * 10) / 10,
              note: noteName,
              noteName,
              octave,
              activeStringNumber,
              isInTune,
              isHolding: false,
            };

            onPitchUpdateRef.current?.(pitchData);
            setPitchData(pitchData);
          } else {
            // 소리 끊김 시 타이머 리셋 및 1.2초 홀드
            inTuneStartTimeRef.current = null;

            if (now - lastSoundTimeRef.current < 1200) {
              const state = useTunerStore.getState();
              if (state.frequency > 0) {
                const holdingData: PitchData = {
                  frequency: state.frequency,
                  cents: state.cents,
                  note: state.noteName,
                  noteName: state.noteName,
                  octave: state.octave,
                  activeStringNumber: state.activeStringNumber,
                  isInTune: state.isInTune,
                  isHolding: true,
                };
                onPitchUpdateRef.current?.(holdingData);
                setPitchData(holdingData);
              }
            } else {
              onPitchUpdateRef.current?.(null);
              clearPitchData();
            }
          }

          animationFrameRef.current = requestAnimationFrame(updatePitchLoop);
        };

        updatePitchLoop();
      } catch (err) {
        console.error('마이크 접근 에러:', err);
      }
    }

    initAudio();

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isActive, baseA4, currentPresetId, markStringTuned, setPitchData, clearPitchData]);
}