/**
 * Lightweight procedural Web Audio synthesizer with soft filtered tones
 * and per-effect debounce to prevent harsh or repetitive audio spam.
 */
export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterFilter: BiquadFilterNode | null = null;
  private lastPlayedAt: Record<string, number> = {};

  private ensureOutput(): { ctx: AudioContext; destination: AudioNode } | null {
    if (typeof window === 'undefined') {
      return null;
    }

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        return null;
      }
      this.ctx = new AudioCtx();
      this.masterFilter = this.ctx.createBiquadFilter();
      this.masterFilter.type = 'lowpass';
      this.masterFilter.frequency.value = 1400;
      this.masterFilter.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    return {
      ctx: this.ctx,
      destination: this.masterFilter ?? this.ctx.destination,
    };
  }

  private canPlay(key: string, minIntervalMs: number): boolean {
    const now = performance.now();
    const prev = this.lastPlayedAt[key] ?? 0;
    if (now - prev < minIntervalMs) {
      return false;
    }
    this.lastPlayedAt[key] = now;
    return true;
  }

  playJump(): void {
    if (!this.canPlay('jump', 120)) return;
    this.playTone(240, 420, 0.08, 'sine', 0.04);
  }

  playLand(): void {
    if (!this.canPlay('land', 180)) return;
    this.playTone(130, 75, 0.055, 'sine', 0.035);
  }

  playSwitch(): void {
    if (!this.canPlay('switch', 100)) return;
    this.playTone(392, 392, 0.05, 'triangle', 0.035, 0);
    this.playTone(523.25, 523.25, 0.06, 'triangle', 0.035, 0.045);
  }

  playGrowVine(): void {
    if (!this.canPlay('vine', 200)) return;
    this.playTone(330, 330, 0.06, 'triangle', 0.04, 0);
    this.playTone(440, 440, 0.06, 'triangle', 0.04, 0.05);
    this.playTone(554, 554, 0.08, 'triangle', 0.04, 0.1);
  }

  playElectricPulse(): void {
    if (!this.canPlay('electric', 200)) return;
    this.playTone(620, 360, 0.07, 'triangle', 0.035, 0);
    this.playTone(480, 720, 0.07, 'sine', 0.035, 0.055);
  }

  playDoorToggle(open: boolean): void {
    if (!this.canPlay('door', 150)) return;
    if (open) {
      this.playTone(392, 523.25, 0.1, 'triangle', 0.035);
    } else {
      this.playTone(392, 261.63, 0.1, 'triangle', 0.03);
    }
  }

  playComplete(): void {
    if (!this.canPlay('complete', 500)) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, index) => {
      this.playTone(freq, freq, 0.11, 'triangle', 0.045, index * 0.08);
    });
  }

  private playTone(
    startFreq: number,
    endFreq: number,
    durationSec: number,
    type: OscillatorType,
    volume: number,
    delaySec = 0,
  ): void {
    const out = this.ensureOutput();
    if (!out) {
      return;
    }

    const { ctx, destination } = out;
    const startTime = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, startTime);
    if (endFreq !== startFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), startTime + durationSec);
    }

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + durationSec);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + durationSec + 0.01);
  }

  destroy(): void {
    if (this.ctx && this.ctx.state !== 'closed') {
      void this.ctx.close();
      this.ctx = null;
      this.masterFilter = null;
    }
  }
}
