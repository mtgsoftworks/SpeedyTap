// AdMob Service - Revenue Generation
// Manages banner and interstitial ads for SpeedyTap game

import { Capacitor } from '@capacitor/core';
import { LanguageManager } from './i18n';

// AdMob plugin type (lazy loaded)
let AdMob: any;

// Ad Unit IDs
export const AD_UNITS = {
  INTERSTITIAL: 'ca-app-pub-2923372871861852/4040639207',
  BANNER: 'ca-app-pub-2923372871861852/4666227683',
  // Test IDs for development
  TEST_INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  TEST_BANNER: 'ca-app-pub-3940256099942544/6300978111'
} as const;

export class AdMobService {
  private isInitialized = false;
  private isTestMode = false;
  private adMobAvailable = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('📱 ' + LanguageManager.t('console.adMobWebPlatform'));
        return;
      }

      // Lazy load AdMob plugin
      const { AdMob: AdMobPlugin } = await import('@capacitor-community/admob');
      AdMob = AdMobPlugin;
      this.adMobAvailable = true;

      // Check if we're in test mode (development)
      this.isTestMode = process.env.NODE_ENV === 'development';

      await AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: this.isTestMode ? ['YOUR_DEVICE_ID_HERE'] : [],
        initializeForTesting: this.isTestMode
      });

      this.isInitialized = true;
      console.log('🎯 ' + LanguageManager.t('console.adMobStartedSuccessfully'), { testMode: this.isTestMode });

    } catch (error) {
      console.warn('⚠️ AdMob başlatılamadı:', error);
      this.adMobAvailable = false;
    }
  }

  public async showBannerAd(position: 'top' | 'bottom' = 'bottom'): Promise<boolean> {
    if (!this.isAdMobReady()) return false;

    try {
      const adId = this.isTestMode ? AD_UNITS.TEST_BANNER : AD_UNITS.BANNER;
      
      await AdMob.showBanner({
        adId: adId,
        adSize: 'BANNER',
        position: position.toUpperCase(),
        margin: 0,
        isTesting: this.isTestMode
      });

      console.log('🎯 ' + LanguageManager.t('console.bannerAdShown') + ':', { position, testMode: this.isTestMode });
      return true;

    } catch (error) {
      console.error('❌ Banner reklam gösterilemedi:', error);
      return false;
    }
  }

  public async hideBannerAd(): Promise<boolean> {
    if (!this.isAdMobReady()) return false;

    try {
      await AdMob.hideBanner();
      console.log('🎯 ' + LanguageManager.t('console.bannerAdHidden'));
      return true;
    } catch (error) {
      console.error('❌ Banner reklam gizlenemedi:', error);
      return false;
    }
  }

  public async prepareInterstitialAd(): Promise<boolean> {
    if (!this.isAdMobReady()) return false;

    try {
      const adId = this.isTestMode ? AD_UNITS.TEST_INTERSTITIAL : AD_UNITS.INTERSTITIAL;
      
      await AdMob.prepareInterstitial({
        adId: adId,
        isTesting: this.isTestMode
      });

      console.log('🎯 ' + LanguageManager.t('console.interstitialAdPrepared') + ':', { testMode: this.isTestMode });
      return true;

    } catch (error) {
      console.error('❌ Interstitial reklam hazırlanamadı:', error);
      return false;
    }
  }

  public async showInterstitialAd(): Promise<boolean> {
    if (!this.isAdMobReady()) return false;

    try {
      await AdMob.showInterstitial();
      console.log('🎯 ' + LanguageManager.t('console.interstitialAdShown'));
      
      // Automatically prepare next interstitial
      setTimeout(() => {
        this.prepareInterstitialAd();
      }, 1000);

      return true;

    } catch (error) {
      console.error('❌ Interstitial reklam gösterilemedi:', error);
      return false;
    }
  }

  // Game-specific ad strategies
  public async showGameOverAd(): Promise<boolean> {
    console.log('🎮 ' + LanguageManager.t('console.gameEndAdShowing') + '...');
    return await this.showInterstitialAd();
  }

  public async showLevelCompleteAd(level: number): Promise<boolean> {
    // Show interstitial every 3 levels
    if (level % 3 === 0) {
      console.log(`🎮 ${LanguageManager.t('console.levelCompletedAdShowing')} ${level}...`);
      return await this.showInterstitialAd();
    }
    return false;
  }

  public async showMenuBannerAd(): Promise<boolean> {
    console.log('🎮 ' + LanguageManager.t('console.mainMenuBannerAdShowing') + '...');
    return await this.showBannerAd('bottom');
  }

  public async hideMenuBannerAd(): Promise<boolean> {
    console.log('🎮 ' + LanguageManager.t('console.mainMenuBannerAdHiding') + '...');
    return await this.hideBannerAd();
  }

  private isAdMobReady(): boolean {
    if (!this.adMobAvailable) {
      // Silent fail on web platform - this is expected
      return false;
    }

    if (!this.isInitialized) {
      console.warn('🎯 AdMob henüz başlatılmadı');
      return false;
    }

    return true;
  }

  public getAdStatus() {
    return {
      available: this.adMobAvailable,
      initialized: this.isInitialized,
      testMode: this.isTestMode,
      platform: Capacitor.getPlatform()
    };
  }
}

// Global AdMob Service Instance
export const adMobService = new AdMobService(); 