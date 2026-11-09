// Procedural Sound Generator via Web Audio API - Zero Asset 404s!
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private bgmGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (!this.enabled && this.bgmGain) {
      this.bgmGain.gain.setValueAtTime(0, this.ctx!.currentTime);
    } else if (this.enabled && this.bgmGain) {
      this.bgmGain.gain.setValueAtTime(0.06, this.ctx!.currentTime);
    }
    return this.enabled;
  }

  public swordSwing() {
    if (!this.enabled) return;
    this.initCtx();
    const now = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx!.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public swordHit() {
    if (!this.enabled) return;
    this.initCtx();
    const now = this.ctx!.currentTime;

    // Metal clink + low thud
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public monsterHit() {
    if (!this.enabled) return;
    this.initCtx();
    const now = this.ctx!.currentTime;

    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public dodgeRoll() {
    if (!this.enabled) return;
    this.initCtx();
    const now = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.18);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public whirlwind() {
    if (!this.enabled) return;
    this.initCtx();
    const now = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(360, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  public aetherBeam() {
    if (!this.enabled) return;
    this.initCtx();
    const now = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.4);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  public heal() {
    if (!this.enabled) return;
    this.initCtx();
    const now = this.ctx!.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.12, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });
  }

  public levelUp() {
    if (!this.enabled) return;
    this.initCtx();
    const now = this.ctx!.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.25, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.35);
    });
  }

  public itemDrop() {
    if (!this.enabled) return;
    this.initCtx();
    const now = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.2);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  public startBGM() {
    if (this.isBgmPlaying || !this.enabled) return;
    this.initCtx();
    this.isBgmPlaying = true;

    // Ambient relaxing fantasy arpeggio chord cycle
    const chords = [
      [261.63, 329.63, 392.00], // C
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [196.00, 246.94, 293.66], // G
    ];

    let chordIdx = 0;
    const playChordStep = () => {
      if (!this.isBgmPlaying) return;
      if (!this.enabled) {
        setTimeout(playChordStep, 2400);
        return;
      }
      const chord = chords[chordIdx % chords.length];
      chordIdx++;
      const now = this.ctx!.currentTime;

      chord.forEach((note, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now + i * 0.3);

        const vol = 0.04;
        gain.gain.setValueAtTime(0.001, now + i * 0.3);
        gain.gain.linearRampToValueAtTime(vol, now + i * 0.3 + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.3 + 2.0);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.3);
        osc.stop(now + i * 0.3 + 2.1);
      });

      setTimeout(playChordStep, 2200);
    };

    playChordStep();
  }
}

export const sound = new SoundManager();
