import { Device } from '@capacitor/device';

export interface BatteryInfo {
  level: number;
  isCharging: boolean;
  isLowPower: boolean;
}

export interface OptimizationSettings {
  reducedAnimations: boolean;
  lowerFrameRate: boolean;
  dimBackground: boolean;
  disableParticles: boolean;
  reducedHaptics: boolean;
}

export class BatteryOptimizer {
  private static instance: BatteryOptimizer;
  private batteryInfo: BatteryInfo = {
    level: 100,
    isCharging: false,
    isLowPower: false
  };
  private optimizationSettings: OptimizationSettings = {
    reducedAnimations: false,
    lowerFrameRate: false,
    dimBackground: false,
    disableParticles: false,
    reducedHaptics: false
  };
  private batteryListeners: ((info: BatteryInfo) => void)[] = [];
  private optimizationListeners: ((settings: OptimizationSettings) => void)[] = [];

  public static getInstance(): BatteryOptimizer {
    if (!BatteryOptimizer.instance) {
      BatteryOptimizer.instance = new BatteryOptimizer();
    }
    return BatteryOptimizer.instance;
  }

  async initialize() {
    try {
      await this.updateBatteryInfo();
      this.setupBatteryMonitoring();
      this.loadOptimizationSettings();
    } catch (error) {
      console.warn('Batarya optimizasyon servisi başlatılamadı:', error);
    }
  }

  private async updateBatteryInfo() {
    try {
      const info = await Device.getBatteryInfo();
      
      this.batteryInfo = {
        level: info.batteryLevel ? Math.round(info.batteryLevel * 100) : 100,
        isCharging: info.isCharging || false,
        isLowPower: (info.batteryLevel || 1) < 0.2 // %20'nin altı düşük batarya
      };

      // Otomatik optimizasyon
      this.autoOptimize();
      
      // Dinleyicileri bilgilendir
      this.batteryListeners.forEach(listener => listener(this.batteryInfo));
    } catch (error) {
      console.warn('Batarya bilgisi alınamadı:', error);
    }
  }

  private setupBatteryMonitoring() {
    // Her 30 saniyede bir batarya durumunu kontrol et
    setInterval(() => {
      this.updateBatteryInfo();
    }, 30000);

    // Sayfa görünürlüğü değiştiğinde kontrol et
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateBatteryInfo();
      }
    });
  }

  private autoOptimize() {
    const { level, isCharging, isLowPower } = this.batteryInfo;
    
    if (isLowPower || (!isCharging && level < 30)) {
      // Düşük batarya modu
      this.optimizationSettings = {
        reducedAnimations: true,
        lowerFrameRate: true,
        dimBackground: true,
        disableParticles: true,
        reducedHaptics: true
      };
    } else if (!isCharging && level < 50) {
      // Orta batarya tasarruf modu
      this.optimizationSettings = {
        reducedAnimations: true,
        lowerFrameRate: false,
        dimBackground: false,
        disableParticles: true,
        reducedHaptics: false
      };
    } else if (isCharging || level > 70) {
      // Normal mod
      this.optimizationSettings = {
        reducedAnimations: false,
        lowerFrameRate: false,
        dimBackground: false,
        disableParticles: false,
        reducedHaptics: false
      };
    }

    this.saveOptimizationSettings();
    this.optimizationListeners.forEach(listener => listener(this.optimizationSettings));
  }

  private loadOptimizationSettings() {
    try {
      const saved = localStorage.getItem('batteryOptimization');
      if (saved) {
        this.optimizationSettings = { ...this.optimizationSettings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Batarya optimizasyon ayarları yüklenemedi:', error);
    }
  }

  private saveOptimizationSettings() {
    try {
      localStorage.setItem('batteryOptimization', JSON.stringify(this.optimizationSettings));
    } catch (error) {
      console.warn('Batarya optimizasyon ayarları kaydedilemedi:', error);
    }
  }

  // Public Methods
  getBatteryInfo(): BatteryInfo {
    return { ...this.batteryInfo };
  }

  getOptimizationSettings(): OptimizationSettings {
    return { ...this.optimizationSettings };
  }

  setOptimizationSetting(key: keyof OptimizationSettings, value: boolean) {
    this.optimizationSettings[key] = value;
    this.saveOptimizationSettings();
    this.optimizationListeners.forEach(listener => listener(this.optimizationSettings));
  }

  isLowPowerMode(): boolean {
    return this.batteryInfo.isLowPower;
  }

  shouldReducePerformance(): boolean {
    const { level, isCharging } = this.batteryInfo;
    return !isCharging && level < 30;
  }

  getRecommendedFPS(): number {
    if (this.optimizationSettings.lowerFrameRate) {
      return 30; // Düşük batarya modunda 30 FPS
    }
    return 60; // Normal modda 60 FPS
  }

  onBatteryChange(callback: (info: BatteryInfo) => void) {
    this.batteryListeners.push(callback);
    return () => {
      const index = this.batteryListeners.indexOf(callback);
      if (index > -1) {
        this.batteryListeners.splice(index, 1);
      }
    };
  }

  onOptimizationChange(callback: (settings: OptimizationSettings) => void) {
    this.optimizationListeners.push(callback);
    return () => {
      const index = this.optimizationListeners.indexOf(callback);
      if (index > -1) {
        this.optimizationListeners.splice(index, 1);
      }
    };
  }

  // Performans önerileri
  getPerformanceTips(): string[] {
    const tips: string[] = [];
    const { level, isCharging } = this.batteryInfo;

    if (!isCharging && level < 50) {
      tips.push('🔋 Düşük batarya - performans optimizasyonu aktif');
    }
    
    if (this.optimizationSettings.reducedAnimations) {
      tips.push('🎨 Animasyonlar azaltıldı');
    }
    
    if (this.optimizationSettings.lowerFrameRate) {
      tips.push('⚡ FPS 30\'a düşürüldü');
    }
    
    if (this.optimizationSettings.disableParticles) {
      tips.push('✨ Parçacık efektleri kapatıldı');
    }

    return tips;
  }
} 