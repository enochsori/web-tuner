class TonePlayer {
    private ctx: AudioContext | null = null;
    private osc: OscillatorNode | null = null;
    private gain: GainNode | null = null;
    private activeFreq: number | null = null;
  
    private initContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }
  
    // 기준음 재생 또는 같은 음일 경우 토글 정지
    playTone(freq: number): boolean {
      this.initContext();
      if (!this.ctx) return false;
  
      // 이미 같은 주파수가 재생 중이면 정지
      if (this.osc && this.activeFreq === freq) {
        this.stop();
        return false;
      }
  
      // 다른 음이 울리고 있었다면 즉시 중단 후 새 음 재생
      this.stopImmediate();
  
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
  
      // 악기 기준음에 어울리는 부드럽고 풍부한 삼각파(Triangle) 사용
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
  
      // 부드러운 페이드 인 (50ms)
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.05);
  
      osc.connect(gain);
      gain.connect(ctx.destination);
  
      osc.start();
  
      this.osc = osc;
      this.gain = gain;
      this.activeFreq = freq;
      return true;
    }
  
    // 부드러운 정지 (Fade-out)
    stop() {
      if (this.osc && this.gain && this.ctx) {
        const ctx = this.ctx;
        const prevOsc = this.osc;
        const prevGain = this.gain;
  
        prevGain.gain.setValueAtTime(prevGain.gain.value, ctx.currentTime);
        prevGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
  
        setTimeout(() => {
          try {
            prevOsc.stop();
            prevOsc.disconnect();
            prevGain.disconnect();
          } catch {
            // 이미 정지된 경우 무시
          }
        }, 90);
  
        this.osc = null;
        this.gain = null;
        this.activeFreq = null;
      }
    }
  
    private stopImmediate() {
      if (this.osc) {
        try {
          this.osc.stop();
          this.osc.disconnect();
        } catch {
          // 무시
        }
        this.osc = null;
        this.gain = null;
        this.activeFreq = null;
      }
    }
  
    getActiveFreq(): number | null {
      return this.activeFreq;
    }
  }
  
  export const tonePlayer = new TonePlayer();