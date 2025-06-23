import { GAME_CONFIG, AUDIO_FILES } from '@/constants';
import { AudioConfig } from '@/types';

// Environment Configuration
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_CAPACITOR: typeof (window as any).Capacitor !== 'undefined',
  IS_MOBILE: /Mobi|Android/i.test(navigator.userAgent),
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'SpeedyTap',
  VERSION: '2.0.2',
  DESCRIPTION: 'Fast-paced mobile tapping game - Every tap matters!',
  AUTHOR: 'Mesut Taha Güven',
  
  // Game Settings
  GAME: {
    ...GAME_CONFIG,
    AUTO_SAVE: true,
    ANALYTICS_ENABLED: ENV.IS_PRODUCTION,
    DEBUG_MODE: ENV.IS_DEVELOPMENT,
    ENABLE_CHEAT_CODES: ENV.IS_DEVELOPMENT,
    DEFAULT_LEVEL: 1,
    MAX_LEVEL: 999,
    INITIAL_LIVES: 3,
    SCORE_MULTIPLIER: 1.0
  },
  
  // Development Settings
  DEVELOPMENT: {
    WEBPACK_DEV_SERVER: ENV.IS_DEVELOPMENT,
    HOT_RELOAD: ENV.IS_DEVELOPMENT,
    SOURCE_MAPS: ENV.IS_DEVELOPMENT,
    CONSOLE_LOGGING: ENV.IS_DEVELOPMENT
  },
  
  // Performance Settings
  PERFORMANCE: {
    MAX_CIRCLES: 10,
    ANIMATION_FRAME_RATE: 60,
    TARGET_FPS: 60,
    MIN_FPS_THRESHOLD: 45, // Show warning below this FPS
    MEMORY_THRESHOLD: 100, // MB
    CLEANUP_INTERVAL: 30000, // 30 seconds
    ENABLE_LAZY_LOADING: true,
    CACHE_AUDIO_FILES: true,
    OPTIMIZE_IMAGES: true,
    COMPRESS_ASSETS: ENV.IS_PRODUCTION,
    ENABLE_WEB_OPTIMIZATIONS: true,
    ENABLE_PERFORMANCE_MONITOR: ENV.IS_DEVELOPMENT || ENV.IS_CAPACITOR,
    SHOW_FPS_COUNTER: ENV.IS_DEVELOPMENT,
    BATCH_DOM_UPDATES: true,
    USE_REQUEST_ANIMATION_FRAME: true
  },
  
  // Mobile Specific Settings
  MOBILE: {
    VIBRATION_ENABLED: true,
    HAPTIC_FEEDBACK: true,
    PREVENT_ZOOM: true,
    FORCE_PORTRAIT: false,
    STATUS_BAR_STYLE: 'dark',
    ENABLE_HAPTIC_FEEDBACK: true,
    HIDE_ADDRESS_BAR: true,
    FULL_SCREEN_MODE: false
  },
  
  // Audio Settings
  AUDIO: {
    ENABLED: true,
    MASTER_VOLUME: 1.0,
    SFX_VOLUME: 0.8,
    MUSIC_VOLUME: 0.6,
    PRELOAD_ALL: true,
    ENABLE_SOUND: true,
    DEFAULT_VOLUME: 0.7,
    PRELOAD_SOUNDS: true,
    MAX_CONCURRENT_SOUNDS: 8
  },
} as const;

// Audio Files Configuration
export const AUDIO_CONFIG: Record<string, AudioConfig> = {
  [AUDIO_FILES.CIRCLE_APPEAR]: {
    sound: AUDIO_FILES.CIRCLE_APPEAR,
    preload: true,
    volume: 1.0,
    loop: false,
  },
  [AUDIO_FILES.TOUCH_BLUE]: {
    sound: AUDIO_FILES.TOUCH_BLUE,
    preload: true,
    volume: 0.5,
    loop: false,
  },
  [AUDIO_FILES.TOUCH_RED]: {
    sound: AUDIO_FILES.TOUCH_RED,
    preload: true,
    volume: 1.0,
    loop: false,
  },
  [AUDIO_FILES.LEVEL_PASSED]: {
    sound: AUDIO_FILES.LEVEL_PASSED,
    preload: true,
    volume: 1.0,
    loop: false,
  },
  [AUDIO_FILES.LEVEL_LOST]: {
    sound: AUDIO_FILES.LEVEL_LOST,
    preload: true,
    volume: 1.0,
    loop: false,
  },
  [AUDIO_FILES.BUTTON_TAP]: {
    sound: AUDIO_FILES.BUTTON_TAP,
    preload: true,
    volume: 1.0,
    loop: false,
  },
  [AUDIO_FILES.DELAY_COUNT]: {
    sound: AUDIO_FILES.DELAY_COUNT,
    preload: true,
    volume: 1.0,
    loop: false,
  },
  [AUDIO_FILES.TIME_ALMOST_UP]: {
    sound: AUDIO_FILES.TIME_ALMOST_UP,
    preload: true,
    volume: 0.5,
    loop: true,
  },
};

// Development Configuration
export const DEV_CONFIG = {
  SHOW_FPS: ENV.IS_DEVELOPMENT,
  SHOW_DEBUG_INFO: ENV.IS_DEVELOPMENT,
  ENABLE_CONSOLE_LOGS: ENV.IS_DEVELOPMENT,
  BYPASS_SPLASH: false,
  FAST_LEVELS: ENV.IS_DEVELOPMENT,
  UNLIMITED_TIME: false,
} as const;

// Capacitor Configuration
export const CAPACITOR_CONFIG = {
  PLUGINS: {
    STATUS_BAR: {
      style: 'DARK',
      backgroundColor: '#0B1D31',
    },
    SPLASH_SCREEN: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0B1D31',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    HAPTICS: {
      enabled: true,
    },
    KEYBOARD: {
      resize: 'ionic',
    },
  },
} as const;

// Feature Flags
export const FEATURES = {
  HIGH_SCORE_BOARD: true,
  ACHIEVEMENTS: true,
  SETTINGS: true,
  POWER_UPS: false,
  MULTIPLAYER: false,
  THEMES: false,
  STATISTICS: true,
  SHARE_SCORE: ENV.IS_CAPACITOR,
  RATE_APP: ENV.IS_CAPACITOR,
  NOTIFICATIONS: ENV.IS_CAPACITOR,
  ADMIN_PANEL: APP_CONFIG.GAME.DEBUG_MODE,
  ANALYTICS: ENV.IS_PRODUCTION,
  CRASH_REPORTING: ENV.IS_PRODUCTION,
  PERFORMANCE_MONITORING: ENV.IS_PRODUCTION
} as const;

// Error Tracking Configuration
export const ERROR_CONFIG = {
  ENABLED: ENV.IS_PRODUCTION,
  LOG_LEVEL: ENV.IS_DEVELOPMENT ? 'debug' : 'error',
  MAX_LOGS: 100,
  REPORT_CRASHES: ENV.IS_PRODUCTION,
} as const;

// Network Configuration
export const NETWORK_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  OFFLINE_SUPPORT: true,
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
  VALIDATE_SCORES: true,
  ANTI_CHEAT: ENV.IS_PRODUCTION,
  RATE_LIMITING: true,
  MAX_REQUESTS_PER_MINUTE: 60,
} as const;

// Get configuration based on environment
export const getConfig = () => {
  const baseConfig = {
    ...APP_CONFIG,
    ENV,
    AUDIO: AUDIO_CONFIG,
    FEATURES,
    ERROR: ERROR_CONFIG,
    NETWORK: NETWORK_CONFIG,
    SECURITY: SECURITY_CONFIG,
  };

  if (ENV.IS_DEVELOPMENT) {
    return {
      ...baseConfig,
      DEV: DEV_CONFIG,
    };
  }

  if (ENV.IS_CAPACITOR) {
    return {
      ...baseConfig,
      CAPACITOR: CAPACITOR_CONFIG,
    };
  }

  return baseConfig;
};

export default getConfig(); 