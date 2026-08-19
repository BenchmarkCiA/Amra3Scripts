// Tiny, dependency-free background music: a soft, slow pentatonic melody
// synthesized live with the Web Audio API. Avoids bundling/licensing an
// actual audio file while still giving a calm, kid-friendly ambience.
const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25]; // C D E G A C — no dissonant intervals
const PATTERN = [0, 2, 4, 3, 2, 1, 0, 3, 4, 5, 4, 2]; // gentle up/down melody, indexes into SCALE
const NOTE_LEN = 1.1;
const NOTE_GAP = 0.7;
const SCHEDULE_AHEAD = 0.5;
const TICK_MS = 150;

class BackgroundMusicEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;
  private playing = false;

  start() {
    if (this.playing) return;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.045; // deliberately quiet — ambience, not a soundtrack
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    this.playing = true;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.tick();
  }

  stop() {
    this.playing = false;
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private tick = () => {
    if (!this.playing || !this.ctx || !this.master) return;
    while (this.nextTime < this.ctx.currentTime + SCHEDULE_AHEAD) {
      this.playNote(this.nextTime);
      this.nextTime += NOTE_LEN + NOTE_GAP;
      this.step++;
    }
    this.timer = window.setTimeout(this.tick, TICK_MS);
  };

  private playNote(time: number) {
    if (!this.ctx || !this.master) return;
    const octaveDown = this.step % 24 >= 12; // occasional lower octave for gentle variation
    const freq = SCALE[PATTERN[this.step % PATTERN.length]] * (octaveDown ? 0.5 : 1);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(1, time + 0.2);
    gain.gain.linearRampToValueAtTime(0, time + NOTE_LEN);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(time);
    osc.stop(time + NOTE_LEN + 0.05);
  }
}

export const backgroundMusic = new BackgroundMusicEngine();
