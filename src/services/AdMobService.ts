import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

export class AdMobService {
  private static instance: AdMobService;
  
  // Test Reklam ID'leri (development için)
  private testBannerAdId = 'ca-app-pub-3940256099942544/6300978111';
  private testInterstitialAdId = 'ca-app-pub-3940256099942544/1033173712';
  
  // Production Reklam ID'leri
  private prodBannerAdId = 'ca-app-pub-2923372871861852/4666227683';
  private prodInterstitialAdId = 'ca-app-pub-2923372871861852/4040639207';
  
  private isInitialized = false;
  private bannerShown = false;
  private isProduction = false; // Environment değişkeni ile kontrol edilebilir

  private constructor() {
    // Production mode kontrolü (environment variable ile)
    this.isProduction = import.meta.env.PROD || false;
  }

  public static getInstance(): AdMobService {
    if (!AdMobService.instance) {
      AdMobService.instance = new AdMobService();
    }
    return AdMobService.instance;
  }

  private getBannerAdId(): string {
    return this.isProduction ? this.prodBannerAdId : this.testBannerAdId;
  }

  private getInterstitialAdId(): string {
    return this.isProduction ? this.prodInterstitialAdId : this.testInterstitialAdId;
  }

  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      await AdMob.initialize({
        testingDevices: this.isProduction ? [] : ['YOUR_DEVICE_ID'], // Test mode için device ID
        initializeForTesting: !this.isProduction // Test/Prod mode
      });

      this.isInitialized = true;
      console.log(`AdMob initialized successfully - ${this.isProduction ? 'PRODUCTION' : 'TEST'} mode`);
    } catch (error) {
      console.error('AdMob initialization failed:', error);
    }
  }

  async showBannerAd(): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (this.bannerShown) {
        return;
      }

      const options = {
        adId: this.getBannerAdId(),
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: !this.isProduction
      };

      await AdMob.showBanner(options);
      this.bannerShown = true;
      console.log('Banner ad shown:', this.isProduction ? 'REAL' : 'TEST');
    } catch (error) {
      console.error('Failed to show banner ad:', error);
    }
  }

  async hideBannerAd(): Promise<void> {
    try {
      await AdMob.hideBanner();
      this.bannerShown = false;
      console.log('Banner ad hidden');
    } catch (error) {
      console.error('Failed to hide banner ad:', error);
    }
  }

  async showInterstitialAd(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const options = {
        adId: this.getInterstitialAdId(),
        isTesting: !this.isProduction
      };

      await AdMob.prepareInterstitial(options);
      await AdMob.showInterstitial();
      console.log('Interstitial ad shown:', this.isProduction ? 'REAL' : 'TEST');
      return true;
    } catch (error) {
      console.error('Failed to show interstitial ad:', error);
      return false;
    }
  }

  async removeBannerAd(): Promise<void> {
    try {
      await AdMob.removeBanner();
      this.bannerShown = false;
      console.log('Banner ad removed');
    } catch (error) {
      console.error('Failed to remove banner ad:', error);
    }
  }

  // Oyun sonu, level geçişi gibi durumlar için interstitial göster
  async showGameEndAd(): Promise<boolean> {
    return this.showInterstitialAd();
  }

  // Oyun menu'da banner göster
  async showMenuBanner(): Promise<void> {
    await this.showBannerAd();
  }

  // Oyun sırasında banner'ı gizle
  async hideGameBanner(): Promise<void> {
    await this.hideBannerAd();
  }

  // Debug bilgileri için
  getAdStatus(): { isProduction: boolean; bannerShown: boolean; isInitialized: boolean } {
    return {
      isProduction: this.isProduction,
      bannerShown: this.bannerShown,
      isInitialized: this.isInitialized
    };
  }
}

export const adMobService = AdMobService.getInstance(); 