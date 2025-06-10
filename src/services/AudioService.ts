export class AudioService {
  private static instance: AudioService;
  private audioCache = new Map<string, HTMLAudioElement>();
  private isEnabled = true;

  private constructor() {
    this.preloadSounds();
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private preloadSounds(): void {
    const sounds = [
      'touchBlue.mp3',
      'touchRed.mp3',
      'levelPassed.mp3',
      'levelLost.mp3',
      'buttonTap.mp3',
      'circleAppear.mp3',
      'delayCount.mp3',
      'timeAlmostUp.mp3',
      // WAV dosyaları
      'Click_-_Tap_Done_Checkbox1.wav',
      'Toy_Done11.wav',
      'Toy_Error9.wav',
      'Fireworks_-_Notification2.wav'
    ];

    sounds.forEach(sound => {
      try {
        const audio = new Audio(`/assets/${sound}`);
        audio.preload = 'auto';
        audio.volume = 0.7;
        this.audioCache.set(sound, audio);
      } catch (error) {
        console.warn(`Failed to preload sound: ${sound}`, error);
      }
    });
  }

  async playSound(soundName: string): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const audio = this.audioCache.get(soundName);
      if (audio) {
        audio.currentTime = 0;
        await audio.play();
      } else {
        console.warn(`Sound not found: ${soundName}`);
      }
    } catch (error) {
      console.warn(`Failed to play sound: ${soundName}`, error);
    }
  }

  // Oyun sesleri
  async playCircleTap(isBlue: boolean): Promise<void> {
    await this.playSound(isBlue ? 'touchBlue.mp3' : 'touchRed.mp3');
  }

  async playButtonTap(): Promise<void> {
    await this.playSound('buttonTap.mp3');
  }

  async playLevelPassed(): Promise<void> {
    await this.playSound('levelPassed.mp3');
  }

  async playGameOver(): Promise<void> {
    await this.playSound('levelLost.mp3');
  }

  async playCountdown(): Promise<void> {
    await this.playSound('delayCount.mp3');
  }

  async playCircleAppear(): Promise<void> {
    await this.playSound('circleAppear.mp3');
  }

  async playTimeWarning(): Promise<void> {
    await this.playSound('timeAlmostUp.mp3');
  }

  // Modern sesler (WAV)
  async playSuccess(): Promise<void> {
    await this.playSound('Toy_Done11.wav');
  }

  async playError(): Promise<void> {
    await this.playSound('Toy_Error9.wav');
  }

  async playVictory(): Promise<void> {
    await this.playSound('Fireworks_-_Notification2.wav');
  }

  async playClick(): Promise<void> {
    await this.playSound('Click_-_Tap_Done_Checkbox1.wav');
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.audioCache.forEach(audio => {
      audio.volume = clampedVolume;
    });
  }
}

export const audioService = AudioService.getInstance(); 