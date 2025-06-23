// Game State Types
export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  level: number;
  timeLeft: number;
  tapCount: number;
  highScore: number;
}

// Level Configuration
export interface LevelConfig {
  levelNum: number;
  time: number;
  tapValue: number;
  tapsGoal: number;
  goodCirclesCount: number;
  evilCirclesCount: number;
}

// Circle Types
export interface Circle {
  id: string;
  x: number;
  y: number;
  type: 'good' | 'evil';
  element: HTMLElement;
}

// Audio Types
export interface AudioConfig {
  sound: string;
  preload: boolean;
  volume: number;
  loop: boolean;
  audioPlayer?: HTMLAudioElement;
}

// Page Types
export type PageType = 
  | 'splash'
  | 'welcome'
  | 'gameMenu'
  | 'tutorial'
  | 'playDelay'
  | 'playArea'
  | 'pauseMenu'
  | 'levelPassed'
  | 'youLost'
  | 'highScore'
  | 'about'
  | 'settings'
  | 'achievements';

// Navigation Types
export interface PageManager {
  currentPage: PageType;
  showPage: (page: PageType) => void;
  hidePage: (page: PageType) => void;
}

// Engine Types
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// Mobile Optimization Types
export interface MobileFeatures {
  hasVibration: boolean;
  isTouchDevice: boolean;
  screenSize: Size;
  safeArea: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Theme Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    error: string;
    warning: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fonts: {
    family: string;
    sizes: {
      small: string;
      medium: string;
      large: string;
      xlarge: string;
    };
  };
} 

// =============================================
// ACHIEVEMENTS SYSTEM TYPES
// =============================================

export type AchievementCategory = 
  | 'gameplay' 
  | 'score' 
  | 'speed' 
  | 'consistency' 
  | 'special';

export type AchievementRarity = 
  | 'common' 
  | 'rare' 
  | 'epic' 
  | 'legendary';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  condition: AchievementCondition;
  reward?: {
    type: 'points' | 'unlock' | 'cosmetic';
    value: number | string;
  };
  hidden?: boolean; // Gizli başarımlar
}

export interface AchievementCondition {
  type: 'score' | 'level' | 'games_played' | 'perfect_games' | 'streak' | 'time' | 'custom';
  target: number;
  comparison?: 'greater' | 'equal' | 'less';
  cumulative?: boolean; // Kümülatif mi yoksa tek seferde mi
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: number; // timestamp
  progress: number; // 0-100
  isUnlocked: boolean;
  notificationShown?: boolean;
}

export interface AchievementProgress {
  [achievementId: string]: {
    current: number;
    target: number;
    percentage: number;
  };
}

// =============================================
// SETTINGS SYSTEM TYPES  
// =============================================

export interface UserSettings {
  audio: AudioSettings;
  gameplay: GameplaySettings;
  visual: VisualSettings;
  accessibility: AccessibilitySettings;
  data: DataSettings;
  version: string;
  lastUpdated: number;
}

export interface AudioSettings {
  masterVolume: number; // 0-1
  sfxVolume: number; // 0-1
  musicVolume: number; // 0-1
  soundEnabled: boolean;
  hapticFeedback: boolean;
}

export interface GameplaySettings {
  difficulty: 'easy' | 'normal' | 'hard';
  autoResume: boolean;
  showHints: boolean;
  pauseOnFocusLoss: boolean;
  confirmExit: boolean;
}

export interface VisualSettings {
  theme: 'dark' | 'light' | 'auto';
  animations: boolean;
  particles: boolean;
  screenShake: boolean;
  reducedMotion: boolean;
  showFPS: boolean; // Debug mode only
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  voiceOver: boolean;
  buttonHints: boolean;
}

export interface DataSettings {
  analyticsEnabled: boolean;
  crashReporting: boolean;
  autoBackup: boolean;
  shareUsageData: boolean;
}

// =============================================
// USER STATISTICS TYPES
// =============================================

export interface UserStats {
  // Gameplay Stats
  totalGamesPlayed: number;
  totalTimePlayed: number; // in seconds
  highestScore: number;
  highestLevel: number;
  totalTaps: number;
  accurateHits: number;
  missedHits: number;
  
  // Performance Stats
  averageReactionTime: number;
  bestReactionTime: number;
  perfectGames: number; // No missed hits
  currentStreak: number;
  bestStreak: number;
  
  // Session Stats
  sessionsPlayed: number;
  lastPlayed: number; // timestamp
  firstPlayed: number; // timestamp
  
  // Achievement Stats
  achievementsUnlocked: number;
  totalAchievementPoints: number;
}

// =============================================
// NOTIFICATION TYPES
// =============================================

export interface GameNotification {
  id: string;
  type: 'achievement' | 'level_up' | 'high_score' | 'tip' | 'warning';
  title: string;
  message: string;
  icon?: string;
  duration?: number; // ms, 0 for persistent
  actions?: NotificationAction[];
  priority: 'low' | 'normal' | 'high';
  timestamp: number;
}

export interface NotificationAction {
  label: string;
  action: string;
  style?: 'primary' | 'secondary' | 'danger';
} 