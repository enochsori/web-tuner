export class YinPitchDetector {
    private threshold: number;
    private sampleRate: number;
    private yinBuffer: Float32Array;
  
    constructor(bufferSize: number, sampleRate: number, threshold = 0.12) {
      this.sampleRate = sampleRate;
      this.threshold = threshold;
      this.yinBuffer = new Float32Array(bufferSize / 2);
    }
  
    public detect(buffer: Float32Array): { pitch: number; clarity: number } {
      const halfBufferSize = buffer.length / 2;
      let runningSum = 0;
      this.yinBuffer[0] = 1;
  
      for (let tau = 1; tau < halfBufferSize; tau++) {
        let diff = 0;
        for (let i = 0; i < halfBufferSize; i++) {
          const delta = buffer[i] - buffer[i + tau];
          diff += delta * delta;
        }
        runningSum += diff;
        this.yinBuffer[tau] = (diff * tau) / (runningSum || 1);
      }
  
      let tauEstimate = -1;
      for (let tau = 2; tau < halfBufferSize; tau++) {
        if (this.yinBuffer[tau] < this.threshold) {
          while (tau + 1 < halfBufferSize && this.yinBuffer[tau + 1] < this.yinBuffer[tau]) {
            tau++;
          }
          tauEstimate = tau;
          break;
        }
      }
  
      if (tauEstimate === -1) {
        return { pitch: -1, clarity: 0 };
      }
  
      let betterTau: number;
      const x0 = tauEstimate < 1 ? tauEstimate : tauEstimate - 1;
      const x2 = tauEstimate + 1 < halfBufferSize ? tauEstimate + 1 : tauEstimate;
      
      if (x0 === tauEstimate) {
        betterTau = this.yinBuffer[tauEstimate] <= this.yinBuffer[x2] ? tauEstimate : x2;
      } else if (x2 === tauEstimate) {
        betterTau = this.yinBuffer[tauEstimate] <= this.yinBuffer[x0] ? tauEstimate : x0;
      } else {
        const s0 = this.yinBuffer[x0];
        const s1 = this.yinBuffer[tauEstimate];
        const s2 = this.yinBuffer[x2];
        betterTau = tauEstimate + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
      }
  
      const pitch = this.sampleRate / betterTau;
      const clarity = 1 - this.yinBuffer[tauEstimate];
      return { pitch, clarity };
    }
  }