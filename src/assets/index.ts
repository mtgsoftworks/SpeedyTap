// Assets Index - Simple Audio Management
// Import CSS
import './style.css';
import { LanguageManager } from '@/utils/i18n';

// Audio Manager Class for centralized audio handling
export class AudioManager {
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private volume = 0.7;
  private muted = false;

  constructor() {
    this.preloadAudio();
  }

  private preloadAudio(): void {
    // Audio files that exist in src/assets/audio/ - using webpack processed URLs
    const audioFiles = {
      'circleAppear': require('./audio/circleAppear.mp3'),
      'touchBlue': require('./audio/touchBlue.mp3'),
      'touchRed': require('./audio/touchRed.mp3'),
      'levelPassed': require('./audio/levelPassed.mp3'),
      'levelLost': require('./audio/levelLost.mp3'),
      'buttonTap': require('./audio/buttonTap.mp3'),
      'delayCount': require('./audio/delayCount.mp3'),
      'timeAlmostUp': require('./audio/timeAlmostUp.mp3')
    };

    Object.entries(audioFiles).forEach(([name, url]) => {
      try {
        const audio = new Audio(url);
        audio.preload = 'auto';
        audio.volume = this.volume;
        this.audioElements.set(name, audio);
      } catch (error) {
        console.warn(`Ses elementi oluşturulamadı: ${name}`, error);
      }
    });
    
    console.log('🔊 ' + LanguageManager.t('debug.audioFilesPreloaded') + ':', this.audioElements.size, LanguageManager.t('debug.files'));
  }

  public play(soundName: string): void {
    if (this.muted) return;

    const audio = this.audioElements.get(soundName);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.warn(`Ses çalınamadı (${soundName}):`, error);
      });
    } else {
      console.warn(`Ses dosyası bulunamadı: ${soundName}`);
    }
  }

  public stop(soundName: string): void {
    const audio = this.audioElements.get(soundName);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.audioElements.forEach(audio => {
      audio.volume = this.volume;
    });
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.audioElements.forEach(audio => {
        audio.pause();
      });
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public isMuted(): boolean {
    return this.muted;
  }
}

// Global Audio Manager Instance
export const audioManager = new AudioManager(); 