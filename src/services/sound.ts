/**
 * Procedural Web Audio API Sound Synthesizer for Arcade Claw Machine
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private motorOsc: OscillatorNode | null = null;
  private motorGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && this.motorGain) {
      this.stopMotor();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Coin insertion clink & mechanical latch
   */
  public playCoin() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Metallic chime 1
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1975.53, now); // B6
    osc1.frequency.exponentialRampToValueAtTime(3951.07, now + 0.08); // B7
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.36);

    // Metallic chime 2 (delayed bell)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2637.02, now + 0.09); // E7
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.35, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.51);
  }

  /**
   * Button micro-switch click
   */
  public playButtonClick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Continuous crane servo motor sound
   */
  public startMotor(speedMultiplier = 1.0) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    if (this.motorOsc) return;

    const now = this.ctx.currentTime;
    this.motorOsc = this.ctx.createOscillator();
    this.motorGain = this.ctx.createGain();

    this.motorOsc.type = 'sawtooth';
    this.motorOsc.frequency.setValueAtTime(110 * speedMultiplier, now);
    
    // Low pass filter for muffled cabinet servo sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    this.motorGain.gain.setValueAtTime(0.01, now);
    this.motorGain.gain.linearRampToValueAtTime(0.08, now + 0.05);

    this.motorOsc.connect(filter);
    filter.connect(this.motorGain);
    this.motorGain.connect(this.ctx.destination);

    this.motorOsc.start(now);
  }

  public updateMotorSpeed(speedMultiplier: number) {
    if (this.motorOsc && this.ctx) {
      this.motorOsc.frequency.setTargetAtTime(110 * speedMultiplier, this.ctx.currentTime, 0.05);
    }
  }

  public stopMotor() {
    if (this.motorOsc && this.ctx && this.motorGain) {
      const now = this.ctx.currentTime;
      this.motorGain.gain.linearRampToValueAtTime(0.001, now + 0.05);
      const osc = this.motorOsc;
      setTimeout(() => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      }, 60);
      this.motorOsc = null;
      this.motorGain = null;
    }
  }

  /**
   * Pneumatic claw cable drop sound
   */
  public playDrop() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.6);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.61);
  }

  /**
   * Claw closes and snaps shut
   */
  public playClawGrab(hasDoll = false) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Metallic clamp click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    if (hasDoll) {
      // Soft muffled squish impact
      const squish = this.ctx.createOscillator();
      const squishGain = this.ctx.createGain();
      squish.type = 'triangle';
      squish.frequency.setValueAtTime(140, now + 0.05);
      squish.frequency.exponentialRampToValueAtTime(60, now + 0.2);
      squishGain.gain.setValueAtTime(0.2, now + 0.05);
      squishGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      squish.connect(squishGain);
      squishGain.connect(this.ctx.destination);
      squish.start(now + 0.05);
      squish.stop(now + 0.23);
    }
  }

  /**
   * Heartbeat / tension suspense pulse while lifting
   */
  public playTensionPulse() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.15);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  /**
   * Sad/shocking slip sound when doll slips out of claw!
   */
  public playSlip() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Descending slide whistle
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.35);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);

    // Heavy thud on impact
    setTimeout(() => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const thud = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(120, t);
      thud.frequency.exponentialRampToValueAtTime(35, t + 0.2);
      thudGain.gain.setValueAtTime(0.3, t);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      thud.connect(thudGain);
      thudGain.connect(this.ctx.destination);
      thud.start(t);
      thud.stop(t + 0.23);
    }, 280);
  }

  /**
   * Plastic flapper door sound when doll drops into chute
   */
  public playChuteDrop() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.25);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Triumphant 8-note arcade victory fanfare!
   */
  public playWin() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [
      { f: 523.25, d: 0.1 },  // C5
      { f: 659.25, d: 0.1 },  // E5
      { f: 783.99, d: 0.1 },  // G5
      { f: 1046.50, d: 0.18 },// C6
      { f: 880.00, d: 0.1 },  // A5
      { f: 987.77, d: 0.1 },  // B5
      { f: 1046.50, d: 0.35 } // C6 (long)
    ];

    let time = this.ctx.currentTime + 0.05;
    for (const note of notes) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, time);

      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + note.d + 0.02);

      time += note.d + 0.04;
    }
  }

  /**
   * Cabinet shake sound
   */
  public playCabinetShake() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.33);
  }
}

export const sound = new SoundService();
