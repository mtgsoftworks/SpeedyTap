import { PageType } from '@/types';

// Game Constants
export const GAME_CONFIG = {
  INITIAL_LEVEL: 1,
  INITIAL_TIME: 7,
  INITIAL_TAP_VALUE: 3,
  INITIAL_TAPS_GOAL: 5,
  INITIAL_GOOD_CIRCLES: 1,
  INITIAL_EVIL_CIRCLES: 4,
  TIME_INCREMENT: 1,
  TAP_VALUE_INCREMENT: 2,
  TAPS_GOAL_INCREMENT: 1,
  EVIL_CIRCLES_INCREMENT: 1,
  BONUS_MULTIPLIER: 10,
  PROGRESS_UPDATE_INTERVAL: 100, // ms
} as const;

// Audio Constants
export const AUDIO_FILES = {
  CIRCLE_APPEAR: 'circleAppear',
  TOUCH_BLUE: 'touchBlue',
  TOUCH_RED: 'touchRed',
  LEVEL_PASSED: 'levelPassed',
  LEVEL_LOST: 'levelLost',
  BUTTON_TAP: 'buttonTap',
  DELAY_COUNT: 'delayCount',
  TIME_ALMOST_UP: 'timeAlmostUp',
} as const;

// Page Navigation Constants
export const PAGES: Record<string, PageType> = {
  SPLASH: 'splash',
  WELCOME: 'welcome',
  GAME_MENU: 'gameMenu',
  TUTORIAL: 'tutorial',
  PLAY_DELAY: 'playDelay',
  PLAY_AREA: 'playArea',
  PAUSE_MENU: 'pauseMenu',
  LEVEL_PASSED: 'levelPassed',
  YOU_LOST: 'youLost',
  HIGH_SCORE: 'highScore',
  ABOUT: 'about',
  SETTINGS: 'settings',
  ACHIEVEMENTS: 'achievements',
} as const;

// Animation Constants
export const ANIMATIONS = {
  FADE_OUT_DURATION: 1500,
  DELAY_COUNT_INTERVAL: 500,
  CIRCLE_SPAWN_DELAY: 50,
  PROGRESS_UPDATE_FREQUENCY: 10, // Update every 100ms (1000ms / 10)
} as const;

// Mobile Constants
export const MOBILE = {
  VIBRATION_GOOD_TAP: 50,
  VIBRATION_BAD_TAP: [100, 50, 100],
  BREAKPOINT_MOBILE: 768,
  SAFE_AREA_FALLBACK: 0,
} as const;

// Circle Constants
export const CIRCLE = {
  MIN_SIZE: 60,
  MAX_SIZE: 80,
  MOBILE_SIZE: 80,
  ANIMATION_CLASSES: {
    GROW: 'grow-animation',
    BURST: 'burst-animation',
    FADE_OUT: 'fadeOut-animation',
    SWITCH_COLORS: 'switchColors-animation',
  },
} as const;

// CSS Classes
export const CSS_CLASSES = {
  PAGES: {
    SPLASH: 'page-splash',
    WELCOME: 'page-welcome',
    GAME_MENU: 'page-game-menu',
    TUTORIAL: 'page-tutorial',
    PLAY_DELAY: 'page-play-delay',
    PLAY_AREA: 'page-play-area',
    PAUSE_MENU: 'page-pause-menu',
    LEVEL_PASSED: 'page-level-passed',
    YOU_LOST: 'page-you-lost',
    HIGH_SCORE: 'page-high-score',
    ABOUT: 'page-about',
    SETTINGS: 'page-settings',
    ACHIEVEMENTS: 'page-achievements',
  },
  CIRCLES: {
    BASE: 'tpbl-circle',
    GOOD: 'c-blue good-circle',
    EVIL: 'c-red evil-circle',
  },
  STATES: {
    HIDDEN: 'hidden',
    VISIBLE: 'visible',
    ACTIVE: 'active',
  },
} as const;

// Storage Keys (for localStorage)
export const STORAGE_KEYS = {
  HIGH_SCORE: 'speedytap_high_score',
  CURRENT_LEVEL: 'speedytap_current_level',
  SETTINGS: 'speedytap_settings',
  GAME_STATE: 'speedytap_game_state',
  ACHIEVEMENTS: 'speedytap_achievements',
  USER_STATS: 'speedytap_user_stats',
  ACHIEVEMENT_PROGRESS: 'speedytap_achievement_progress',
} as const;

// Game States
export const GAME_STATES = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
  LEVEL_COMPLETE: 'levelComplete',
} as const;

// Event Names
export const EVENTS = {
  GAME_START: 'gameStart',
  GAME_PAUSE: 'gamePause',
  GAME_RESUME: 'gameResume',
  GAME_OVER: 'gameOver',
  LEVEL_COMPLETE: 'levelComplete',
  SCORE_UPDATE: 'scoreUpdate',
  TIME_UPDATE: 'timeUpdate',
  CIRCLE_TAP: 'circleTap',
  ACHIEVEMENT_UNLOCKED: 'achievementUnlocked',
  SETTINGS_CHANGED: 'settingsChanged',
} as const;

// Device Detection
export const DEVICE = {
  TOUCH_EVENTS: ['touchstart', 'touchmove', 'touchend'],
  MOUSE_EVENTS: ['mousedown', 'mousemove', 'mouseup'],
  POINTER_EVENTS: ['pointerdown', 'pointermove', 'pointerup'],
} as const;

// =============================================
// ACHIEVEMENTS SYSTEM CONSTANTS
// =============================================

export const ACHIEVEMENT_DEFINITIONS = [
  // GAMEPLAY ACHIEVEMENTS
  {
    id: 'first_game',
    titleKey: 'achievements.titles.firstStep',
    descriptionKey: 'achievements.descriptions.completeFirstGame',
    category: 'gameplay',
    rarity: 'common',
    icon: '🚀',
    condition: { type: 'games_played', target: 1 },
    reward: { type: 'points', value: 100 }
  },
  {
    id: 'level_10',
    titleKey: 'achievements.titles.risingUp',
    descriptionKey: 'achievements.descriptions.reachLevel10',
    category: 'gameplay',
    rarity: 'common',
    icon: '📈',
    condition: { type: 'level', target: 10 },
    reward: { type: 'points', value: 250 }
  },
  {
    id: 'level_25',
    titleKey: 'achievements.titles.gettingBetter',
    descriptionKey: 'achievements.descriptions.reachLevel25',
    category: 'gameplay',
    rarity: 'rare',
    icon: '⭐',
    condition: { type: 'level', target: 25 },
    reward: { type: 'points', value: 500 }
  },
  {
    id: 'level_50',
    titleKey: 'achievements.titles.halfwayThere',
    descriptionKey: 'achievements.descriptions.reachLevel50',
    category: 'gameplay',
    rarity: 'epic',
    icon: '🎯',
    condition: { type: 'level', target: 50 },
    reward: { type: 'points', value: 1000 }
  },
  {
    id: 'level_100',
    titleKey: 'achievements.titles.powerOfHundred',
    descriptionKey: 'achievements.descriptions.reachLevel100',
    category: 'gameplay',
    rarity: 'legendary',
    icon: '👑',
    condition: { type: 'level', target: 100 },
    reward: { type: 'points', value: 2500 }
  },

  // SCORE ACHIEVEMENTS
  {
    id: 'score_1000',
    titleKey: 'achievements.titles.thousandClub',
    descriptionKey: 'achievements.descriptions.score1000Points',
    category: 'score',
    rarity: 'common',
    icon: '💯',
    condition: { type: 'score', target: 1000 },
    reward: { type: 'points', value: 150 }
  },
  {
    id: 'score_5000',
    titleKey: 'achievements.titles.fiveByFive',
    descriptionKey: 'achievements.descriptions.score5000Points',
    category: 'score',
    rarity: 'rare',
    icon: '💎',
    condition: { type: 'score', target: 5000 },
    reward: { type: 'points', value: 300 }
  },
  {
    id: 'score_10000',
    titleKey: 'achievements.titles.fiveDigits',
    descriptionKey: 'achievements.descriptions.score10000Points',
    category: 'score',
    rarity: 'epic',
    icon: '🏆',
    condition: { type: 'score', target: 10000 },
    reward: { type: 'points', value: 750 }
  },
  {
    id: 'score_25000',
    titleKey: 'achievements.titles.scoreMonster',
    descriptionKey: 'achievements.descriptions.score25000Points',
    category: 'score',
    rarity: 'legendary',
    icon: '🔥',
    condition: { type: 'score', target: 25000 },
    reward: { type: 'points', value: 1500 }
  },

  // CONSISTENCY ACHIEVEMENTS
  {
    id: 'perfect_game',
    titleKey: 'achievements.titles.perfection',
    descriptionKey: 'achievements.descriptions.finishGameWithoutMistakes',
    category: 'consistency',
    rarity: 'rare',
    icon: '✨',
    condition: { type: 'perfect_games', target: 1 },
    reward: { type: 'points', value: 400 }
  },
  {
    id: 'streak_5',
    titleKey: 'achievements.titles.luckyHands',
    descriptionKey: 'achievements.descriptions.make5CorrectTaps',
    category: 'consistency',
    rarity: 'common',
    icon: '👍',
    condition: { type: 'streak', target: 5 },
    reward: { type: 'points', value: 200 }
  },
  {
    id: 'streak_15',
    titleKey: 'achievements.titles.fireLine',
    descriptionKey: 'achievements.descriptions.make15CorrectTaps',
    category: 'consistency',
    rarity: 'epic',
    icon: '🔥',
    condition: { type: 'streak', target: 15 },
    reward: { type: 'points', value: 600 }
  },

  // SPECIAL ACHIEVEMENTS
  {
    id: 'speedrun_10',
    titleKey: 'achievements.titles.quickStart',
    descriptionKey: 'achievements.descriptions.pass10LevelsIn10Seconds',
    category: 'speed',
    rarity: 'epic',
    icon: '⚡',
    condition: { type: 'custom', target: 1 },
    reward: { type: 'points', value: 800 },
    hidden: true
  },
  {
    id: 'marathon_player',
    titleKey: 'achievements.titles.marathonPlayer',
    descriptionKey: 'achievements.descriptions.play100Games',
    category: 'special',
    rarity: 'rare',
    icon: '🏃‍♂️',
    condition: { type: 'games_played', target: 100, cumulative: true },
    reward: { type: 'points', value: 500 }
  },
  {
    id: 'dedication',
    titleKey: 'achievements.titles.addicted',
    descriptionKey: 'achievements.descriptions.playFor7ConsecutiveDays',
    category: 'special',
    rarity: 'legendary',
    icon: '📅',
    condition: { type: 'custom', target: 7 },
    reward: { type: 'points', value: 2000 },
    hidden: true
  }
] as const;

// =============================================
// SETTINGS DEFAULTS
// =============================================

export const DEFAULT_SETTINGS = {
  audio: {
    masterVolume: 0.7,
    sfxVolume: 0.8,
    musicVolume: 0.6,
    soundEnabled: true,
    hapticFeedback: true,
  },
  gameplay: {
    difficulty: 'normal' as 'easy' | 'normal' | 'hard',
    autoResume: true,
    showHints: true,
    pauseOnFocusLoss: true,
    confirmExit: true,
  },
  visual: {
    theme: 'dark' as 'light' | 'dark' | 'auto',
    animations: true,
    particles: true,
    screenShake: true,
    reducedMotion: false,
    showFPS: false,
  },
  accessibility: {
    highContrast: false,
    largeText: false,
    colorBlindMode: 'none' as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia',
    voiceOver: false,
    buttonHints: false,
  },
  data: {
    analyticsEnabled: true,
    crashReporting: true,
    autoBackup: true,
    shareUsageData: false,
  },
  version: '0.2.0',
  lastUpdated: Date.now(),
};

// =============================================
// ACHIEVEMENT CATEGORIES & RARITIES
// =============================================

export const ACHIEVEMENT_CATEGORIES = {
  gameplay: { nameKey: 'achievements.categories.gameplay', icon: '🎮', color: '#58D1FF' },
  score: { nameKey: 'achievements.categories.score', icon: '📊', color: '#FFB800' },
  speed: { nameKey: 'achievements.categories.speed', icon: '⚡', color: '#FF1344' },
  consistency: { nameKey: 'achievements.categories.consistency', icon: '🎯', color: '#00FF6B' },
  special: { nameKey: 'achievements.categories.special', icon: '🌟', color: '#9C27B0' },
} as const;

export const ACHIEVEMENT_RARITIES = {
  common: { nameKey: 'achievements.rarities.common', color: '#B8C5D1', glow: '#B8C5D1' },
  rare: { nameKey: 'achievements.rarities.rare', color: '#58D1FF', glow: '#58D1FF' },
  epic: { nameKey: 'achievements.rarities.epic', color: '#9C27B0', glow: '#9C27B0' },
  legendary: { nameKey: 'achievements.rarities.legendary', color: '#FFB800', glow: '#FFB800' },
} as const; 