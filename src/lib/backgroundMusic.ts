// Background music: the family's own kid-friendly track, looped quietly.
// Served as a static asset (public/audio/background-music.mp3) rather than
// bundled through the JS build, so it doesn't bloat the app bundle.
const AUDIO_SRC = '/audio/background-music.mp3';
const VOLUME = 0.35; // deliberately quiet — ambience, not a soundtrack

class BackgroundMusicEngine {
  private audio: HTMLAudioElement | null = null;

  private ensureAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio(AUDIO_SRC);
      this.audio.loop = true;
      this.audio.volume = VOLUME;
      this.audio.preload = 'auto';
    }
    return this.audio;
  }

  start() {
    const audio = this.ensureAudio();
    if (!audio.paused) return;
    void audio.play().catch(() => {
      // Browsers block audio until a user gesture happens on the page;
      // useBackgroundMusic retries this on the next tap/keypress.
    });
  }

  stop() {
    this.audio?.pause();
  }
}

export const backgroundMusic = new BackgroundMusicEngine();
