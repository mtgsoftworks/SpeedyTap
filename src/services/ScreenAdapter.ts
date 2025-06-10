import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export interface ScreenInfo {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  isFullscreen: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
  devicePixelRatio: number;
}

export interface ViewportSettings {
  gameAreaWidth: number;
  gameAreaHeight: number;
  uiScale: number;
  circleSize: number;
  fontSize: number;
}

export class ScreenAdapter {
  private static instance: ScreenAdapter;
  private screenInfo: ScreenInfo;
  private viewportSettings: ViewportSettings;
  private orientationListeners: ((info: ScreenInfo) => void)[] = [];
  private resizeListeners: ((settings: ViewportSettings) => void)[] = [];

  public static getInstance(): ScreenAdapter {
    if (!ScreenAdapter.instance) {
      ScreenAdapter.instance = new ScreenAdapter();
    }
    return ScreenAdapter.instance;
  }

  constructor() {
    this.screenInfo = this.getInitialScreenInfo();
    this.viewportSettings = this.calculateViewportSettings();
  }

  async initialize() {
    try {
      await this.setupStatusBar();
      await this.setupOrientation();
      this.setupResizeListener();
      this.setupSafeArea();
    } catch (error) {
      console.warn('Ekran adaptasyon servisi başlatılamadı:', error);
    }
  }

  private getInitialScreenInfo(): ScreenInfo {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      isFullscreen: false,
      safeAreaTop: 0,
      safeAreaBottom: 0,
      devicePixelRatio: window.devicePixelRatio || 1
    };
  }

  private async setupStatusBar() {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#000000' });
        await StatusBar.show();
      } catch (error) {
        console.warn('Status bar ayarlanmadı:', error);
      }
    }
  }

  private async setupOrientation() {
    if (Capacitor.isNativePlatform()) {
      try {
        // Tüm yönelimlere izin ver
        await ScreenOrientation.unlock();
        
        // Yönelim değişikliklerini dinle
        ScreenOrientation.addListener('screenOrientationChange', (orientation) => {
          this.handleOrientationChange(orientation.type);
        });
      } catch (error) {
        console.warn('Ekran yönelimi ayarlanmadı:', error);
      }
    }
  }

  private setupResizeListener() {
    let resizeTimeout: number;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        this.updateScreenInfo();
      }, 100);
    });

    // Viewport değişikliklerini dinle
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.updateScreenInfo();
      }, 250);
    });
  }

  private setupSafeArea() {
    // CSS safe area değerlerini oku
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    const safeAreaTop = parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0');
    const safeAreaBottom = parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0');
    
    this.screenInfo.safeAreaTop = safeAreaTop;
    this.screenInfo.safeAreaBottom = safeAreaBottom;
  }

  private handleOrientationChange(orientationType: string) {
    const orientation = orientationType.includes('landscape') ? 'landscape' : 'portrait';
    
    this.screenInfo.orientation = orientation;
    this.updateScreenInfo();
    
    // Yönelim değişikliğinde kısa bir gecikme sonrası güncelle
    setTimeout(() => {
      this.updateScreenInfo();
    }, 300);
  }

  private updateScreenInfo() {
    const oldInfo = { ...this.screenInfo };
    
    this.screenInfo = {
      ...this.screenInfo,
      width: window.innerWidth,
      height: window.innerHeight,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      devicePixelRatio: window.devicePixelRatio || 1
    };

    // Viewport ayarlarını yeniden hesapla
    this.viewportSettings = this.calculateViewportSettings();

    // Değişiklik varsa dinleyicileri bilgilendir
    if (JSON.stringify(oldInfo) !== JSON.stringify(this.screenInfo)) {
      this.orientationListeners.forEach(listener => listener(this.screenInfo));
      this.resizeListeners.forEach(listener => listener(this.viewportSettings));
    }
  }

  private calculateViewportSettings(): ViewportSettings {
    const { width, height, orientation } = this.screenInfo;
    const isSmallScreen = width < 400 || height < 600;
    const isLandscape = orientation === 'landscape';
    
    // UI ölçekleme hesaplama
    let uiScale = 1;
    if (isSmallScreen) {
      uiScale = 0.8;
    } else if (width > 1200) {
      uiScale = 1.2;
    }

    // Oyun alanı boyutları
    const gameAreaWidth = Math.min(width - 40, 500); // Maksimum 500px
    const gameAreaHeight = Math.min(height - 200, 600); // UI için alan bırak

    // Çember boyutu
    let circleSize = 80;
    if (isSmallScreen) {
      circleSize = 60;
    } else if (isLandscape && height < 500) {
      circleSize = 70;
    }

    // Font boyutu
    let fontSize = 16;
    if (isSmallScreen) {
      fontSize = 14;
    } else if (uiScale > 1) {
      fontSize = 18;
    }

    return {
      gameAreaWidth,
      gameAreaHeight,
      uiScale,
      circleSize,
      fontSize
    };
  }

  // Public Methods
  getScreenInfo(): ScreenInfo {
    return { ...this.screenInfo };
  }

  getViewportSettings(): ViewportSettings {
    return { ...this.viewportSettings };
  }

  isLandscape(): boolean {
    return this.screenInfo.orientation === 'landscape';
  }

  isPortrait(): boolean {
    return this.screenInfo.orientation === 'portrait';
  }

  isSmallScreen(): boolean {
    return this.screenInfo.width < 400 || this.screenInfo.height < 600;
  }

  isTallScreen(): boolean {
    return this.screenInfo.height / this.screenInfo.width > 2;
  }

  getOptimalCircleCount(): number {
    const { gameAreaWidth, gameAreaHeight } = this.viewportSettings;
    const area = gameAreaWidth * gameAreaHeight;
    
    // Ekran alanına göre optimal çember sayısı
    if (area < 150000) return 3; // Küçük ekranlar
    if (area < 250000) return 4; // Orta ekranlar  
    return 5; // Büyük ekranlar
  }

  async lockOrientation(orientation: 'portrait' | 'landscape') {
    if (Capacitor.isNativePlatform()) {
      try {
        if (orientation === 'portrait') {
          await ScreenOrientation.lock({ orientation: 'portrait' });
        } else {
          await ScreenOrientation.lock({ orientation: 'landscape' });
        }
      } catch (error) {
        console.warn('Ekran yönelimi kilitlenemedi:', error);
      }
    }
  }

  async unlockOrientation() {
    if (Capacitor.isNativePlatform()) {
      try {
        await ScreenOrientation.unlock();
      } catch (error) {
        console.warn('Ekran yönelimi kilidi açılamadı:', error);
      }
    }
  }

  onOrientationChange(callback: (info: ScreenInfo) => void) {
    this.orientationListeners.push(callback);
    return () => {
      const index = this.orientationListeners.indexOf(callback);
      if (index > -1) {
        this.orientationListeners.splice(index, 1);
      }
    };
  }

  onResize(callback: (settings: ViewportSettings) => void) {
    this.resizeListeners.push(callback);
    return () => {
      const index = this.resizeListeners.indexOf(callback);
      if (index > -1) {
        this.resizeListeners.splice(index, 1);
      }
    };
  }

  // CSS değişkenlerini güncelle
  updateCSSVariables() {
    const root = document.documentElement;
    const { uiScale, circleSize, fontSize } = this.viewportSettings;
    const { safeAreaTop, safeAreaBottom } = this.screenInfo;
    
    root.style.setProperty('--ui-scale', uiScale.toString());
    root.style.setProperty('--circle-size', `${circleSize}px`);
    root.style.setProperty('--font-size', `${fontSize}px`);
    root.style.setProperty('--safe-area-top', `${safeAreaTop}px`);
    root.style.setProperty('--safe-area-bottom', `${safeAreaBottom}px`);
  }
} 