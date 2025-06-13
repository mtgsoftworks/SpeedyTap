import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mtgsoftworks.speedytap',
  appName: 'SpeedyTap',
  webDir: 'dist',
  
  // Android optimizasyonları
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
    hostname: 'speedytap.local',
    url: undefined,
    cleartext: false
  },

  // Sadece Android platform
  platforms: ['android'],

  plugins: {
    // Splash Screen
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1e3a8a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },

    // Status Bar
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1e3a8a',
      overlaysWebView: false
    },

    // AdMob Configuration
    AdMob: {
      appId: 'ca-app-pub-2923372871861852~6427894520',
      initializeForTesting: true,
      testingDevices: ['YOUR_DEVICE_ID_HERE'],
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
      maxAdContentRating: 'G'
    },

    ScreenOrientation: {
      orientations: ['portrait']
    },

    Haptics: {},

    Device: {}
  },

  // Android-specific ayarlar
  android: {
    buildOptions: {
      keystorePath: 'android.keystore',
      keystoreAlias: 'speedytap',
      signingType: 'apksigner'
    },
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
