class TonePlayer {
    private ctx: AudioContext | null = null;
    private primaryOsc: OscillatorNode | null = null;
    private harmonicOsc: OscillatorNode | null = null;
    private gainNode: GainNode | null = null;
    private filterNode: AudioNode | null = null;
    private activeFreq: number | null = null;
  
    private async ensureContext(): Promise<AudioContext | null> {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
  
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
  
      return this.ctx;
    }
  
    async playTone(freq: number): Promise<boolean> {
      const ctx = await this.ensureContext();
      if (!ctx) return false;
  
      // 이미 같은 주파수가 재생 중이면 정지 (토글)
      if (this.primaryOsc && this.activeFreq === freq) {
        this.stop();
        return false;
      }
  
      this.stopImmediate();
  
      const now = ctx.currentTime;
  
      // 1. 메인 톱니파 (날카로운 기본 피치감)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, now);
  
      // 2. 1옥타브 위 배음 (피치 윤곽 강조)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq * 2, now);
  
      const harmonicGain = ctx.createGain();
      harmonicGain.gain.setValueAtTime(0.35, now);
      osc2.connect(harmonicGain);
  
      // 3. 브라이트 필터 (3.2kHz 로우패스)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.Q.setValueAtTime(1.5, now);
  
      // 4. 마스터 게인
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.linearRampToValueAtTime(0.2, now + 0.02);
  
      // 오디오 그래프 라우팅
      osc1.connect(filter);
      harmonicGain.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);
  
      osc1.start(now);
      osc2.start(now);
  
      this.primaryOsc = osc1;
      this.harmonicOsc = osc2;
      this.filterNode = filter;
      this.gainNode = masterGain;
      this.activeFreq = freq;
  
      return true;
    }
  
    stop() {
      if (this.primaryOsc && this.gainNode && this.ctx) {
        const ctx = this.ctx;
        const osc1 = this.primaryOsc;
        const osc2 = this.harmonicOsc;
        const gain = this.gainNode;
        const filter = this.filterNode;
        const now = ctx.currentTime;
  
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  
        setTimeout(() => {
          try {
            osc1.stop();
            osc1.disconnect();
            if (osc2) {
              osc2.stop();
              osc2.disconnect();
            }
            if (filter) {
              filter.disconnect();
            }
            gain.disconnect();
          } catch {
            // ignore
          }
        }, 70);
  
        this.primaryOsc = null;
        this.harmonicOsc = null;
        this.filterNode = null;
        this.gainNode = null;
        this.activeFreq = null;
      }
    }
  
    private stopImmediate() {
      if (this.primaryOsc) {
        try {
          this.primaryOsc.stop();
          this.primaryOsc.disconnect();
          if (this.harmonicOsc) {
            this.harmonicOsc.stop();
            this.harmonicOsc.disconnect();
          }
          if (this.filterNode) {
            this.filterNode.disconnect();
          }
          if (this.gainNode) {
            this.gainNode.disconnect();
          }
        } catch {
          // ignore
        }
        this.primaryOsc = null;
        this.harmonicOsc = null;
        this.filterNode = null;
        this.gainNode = null;
        this.activeFreq = null;
      }
    }
  
    getActiveFreq(): number | null {
      return this.activeFreq;
    }
  }
  
  export const tonePlayer = new TonePlayer();