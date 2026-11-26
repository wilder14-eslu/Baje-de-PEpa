/**
 * Longcat - Procedural Sound Engine
 * Synthesizes all sound effects in real-time using the Web Audio API.
 * 100% offline, zero external audio asset dependencies.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('longcat_muted') === 'true';
    this.volume = 0.6;
    this.pentatonic = [
      261.63, 293.66, 329.63, 392.00, 440.00, // C4, D4, E4, G4, A4
      523.25, 587.33, 659.25, 783.99, 880.00, // C5, D5, E5, G5, A5
      1046.50, 1174.66, 1318.51, 1567.98       // C6, D6, E6, G6
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('longcat_muted', this.muted);
    return this.muted;
  }

  playStep(index = 0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const note = this.pentatonic[index % this.pentatonic.length];

    // Main tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(note, now);
    osc.frequency.exponentialRampToValueAtTime(note * 1.05, now + 0.08);

    // Subtle harmonic overtone for warmth
    const overtone = this.ctx.createOscillator();
    const overGain = this.ctx.createGain();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(note * 2, now);

    gain.gain.setValueAtTime(0.18 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    overGain.gain.setValueAtTime(0.05 * this.volume, now);
    overGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    overtone.connect(overGain);
    gain.connect(this.ctx.destination);
    overGain.connect(this.ctx.destination);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + 0.13);
    overtone.stop(now + 0.10);
  }

  playBump() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  playMeow() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Classic meow frequency curve: starts mid, rises, then gently drops
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.linearRampToValueAtTime(780, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.32);

    // Formant filter (vocal bandpass for "me-o-w")
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(1400, now + 0.12);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.32);
    filter.Q.value = 3.5;

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.22 * this.volume, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  playPurr() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(65, now);

    // Rapid amplitude modulation for rumbling purr
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(24, now); // 24 Hz purr rumble
    lfoGain.gain.setValueAtTime(0.5, now);

    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    lfo.connect(lfoGain.gain);
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    lfo.start(now);
    osc.stop(now + 0.5);
    lfo.stop(now + 0.5);
  }

  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [
      { f: 523.25, t: 0.00, d: 0.12 }, // C5
      { f: 659.25, t: 0.10, d: 0.12 }, // E5
      { f: 783.99, t: 0.20, d: 0.14 }, // G5
      { f: 1046.5, t: 0.32, d: 0.40 }, // C6
      { f: 1318.5, t: 0.34, d: 0.45 }  // E6 (harmony)
    ];

    notes.forEach(({ f, t, d }) => {
      const start = this.ctx.currentTime + t;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, start);

      gain.gain.setValueAtTime(0.2 * this.volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + d + 0.05);
    });

    // Also trigger a joyful meow shortly after
    setTimeout(() => this.playMeow(), 450);
  }

  playUndo() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);

    gain.gain.setValueAtTime(0.14 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  playStuck() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(293.66, now); // D4
    gain1.gain.setValueAtTime(0.16 * this.volume, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    const start2 = now + 0.12;
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(233.08, start2); // Bb3
    gain2.gain.setValueAtTime(0.18 * this.volume, start2);
    gain2.gain.exponentialRampToValueAtTime(0.001, start2 + 0.2);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(start2);
    osc2.stop(start2 + 0.22);
  }
}

const Audio = new SoundEngine();
if (typeof window !== 'undefined') {
  window.Audio = Audio;
}
