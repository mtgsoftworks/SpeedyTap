import { STORAGE_KEYS, DEFAULT_SETTINGS } from '@/constants';
import { UserSettings, UserStats, UserAchievement, AchievementProgress } from '@/types';
import { LanguageManager } from './i18n';

// =============================================
// EXISTING HIGH SCORE & BASIC STORAGE
// =============================================

export const loadHighScore = (): number => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
    return stored ? parseInt(stored, 10) : 0;
  } catch (error) {
    console.warn('High score yüklenemedi:', error);
    return 0;
  }
};

export const saveHighScore = (score: number): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
  } catch (error) {
    console.warn('High score kaydedilemedi:', error);
  }
};

// =============================================
// SETTINGS MANAGEMENT
// =============================================

export const loadSettings = (): UserSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all properties exist
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        lastUpdated: Date.now(),
      } as UserSettings;
    }
  } catch (error) {
    console.warn('Settings yüklenemedi:', error);
  }
  
  // Return default settings if loading fails
  return { ...DEFAULT_SETTINGS } as UserSettings;
};

export const saveSettings = (settings: UserSettings): void => {
  try {
    const toSave = {
      ...settings,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(toSave));
    console.log('✅ ' + LanguageManager.t('console.settingsSaved'));
  } catch (error) {
    console.error('❌ Settings kaydedilemedi:', error);
  }
};

export const updateSettingsPartial = (partialSettings: Partial<UserSettings>): UserSettings => {
  const currentSettings = loadSettings();
  const newSettings = {
    ...currentSettings,
    ...partialSettings,
    lastUpdated: Date.now(),
  };
  saveSettings(newSettings);
  return newSettings;
};

// =============================================
// ACHIEVEMENTS MANAGEMENT
// =============================================

export const loadUserAchievements = (): Record<string, UserAchievement> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Achievements yüklenemedi:', error);
    return {};
  }
};

export const saveUserAchievements = (achievements: Record<string, UserAchievement>): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    console.log('✅ ' + LanguageManager.t('console.achievementsSaved'));
  } catch (error) {
    console.error('❌ Achievements kaydedilemedi:', error);
  }
};

export const unlockAchievement = (achievementId: string): void => {
  const achievements = loadUserAchievements();
  achievements[achievementId] = {
    achievementId,
    unlockedAt: Date.now(),
    progress: 100,
    isUnlocked: true,
    notificationShown: false,
  };
  saveUserAchievements(achievements);
  console.log(`🏆 ${LanguageManager.t('console.achievementUnlocked')}: ${achievementId}`);
};

export const updateAchievementProgress = (achievementId: string, progress: number): void => {
  const achievements = loadUserAchievements();
  const existing = achievements[achievementId];
  
  if (!existing || existing.isUnlocked) return;
  
  achievements[achievementId] = {
    ...existing,
    progress: Math.min(100, Math.max(0, progress)),
  };
  
  // Auto-unlock if progress reaches 100%
  if (progress >= 100) {
    achievements[achievementId].isUnlocked = true;
    achievements[achievementId].unlockedAt = Date.now();
  }
  
  saveUserAchievements(achievements);
};

export const isAchievementUnlocked = (achievementId: string): boolean => {
  const achievements = loadUserAchievements();
  return achievements[achievementId]?.isUnlocked || false;
};

export const getAchievementProgress = (achievementId: string): number => {
  const achievements = loadUserAchievements();
  return achievements[achievementId]?.progress || 0;
};

// =============================================
// USER STATISTICS MANAGEMENT
// =============================================

export const loadUserStats = (): UserStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_STATS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('User stats yüklenemedi:', error);
  }
  
  // Return default stats
  return {
    totalGamesPlayed: 0,
    totalTimePlayed: 0,
    highestScore: 0,
    highestLevel: 0,
    totalTaps: 0,
    accurateHits: 0,
    missedHits: 0,
    averageReactionTime: 0,
    bestReactionTime: 0,
    perfectGames: 0,
    currentStreak: 0,
    bestStreak: 0,
    sessionsPlayed: 0,
    lastPlayed: Date.now(),
    firstPlayed: Date.now(),
    achievementsUnlocked: 0,
    totalAchievementPoints: 0,
  };
};

export const saveUserStats = (stats: UserStats): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('❌ User stats kaydedilemedi:', error);
  }
};

export const updateUserStats = (partialStats: Partial<UserStats>): UserStats => {
  const currentStats = loadUserStats();
  const newStats = {
    ...currentStats,
    ...partialStats,
    lastPlayed: Date.now(),
  };
  saveUserStats(newStats);
  return newStats;
};

export const incrementStat = (statName: keyof UserStats, amount: number = 1): void => {
  const stats = loadUserStats();
  const currentValue = stats[statName] as number;
  updateUserStats({
    [statName]: currentValue + amount,
  });
};

// =============================================
// ACHIEVEMENT PROGRESS TRACKING
// =============================================

export const loadAchievementProgress = (): AchievementProgress => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENT_PROGRESS);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Achievement progress yüklenemedi:', error);
    return {};
  }
};

export const saveAchievementProgress = (progress: AchievementProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENT_PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.error('❌ Achievement progress kaydedilemedi:', error);
  }
};

// =============================================
// DATA MANAGEMENT & UTILITIES
// =============================================

export const clearAllData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🗑️ ' + LanguageManager.t('console.allDataCleared'));
  } catch (error) {
    console.error('❌ Veri temizleme hatası:', error);
  }
};

export const exportUserData = (): string => {
  try {
    const data = {
      settings: loadSettings(),
      achievements: loadUserAchievements(),
      stats: loadUserStats(),
      achievementProgress: loadAchievementProgress(),
      highScore: loadHighScore(),
      exportedAt: Date.now(),
      version: '0.2.0',
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('❌ Veri export hatası:', error);
    return '{}';
  }
};

export const importUserData = (dataString: string): boolean => {
  try {
    const data = JSON.parse(dataString);
    
    if (data.settings) saveSettings(data.settings);
    if (data.achievements) saveUserAchievements(data.achievements);
    if (data.stats) saveUserStats(data.stats);
    if (data.achievementProgress) saveAchievementProgress(data.achievementProgress);
    if (data.highScore) saveHighScore(data.highScore);
    
    console.log('✅ ' + LanguageManager.t('console.dataImportSuccess'));
    return true;
  } catch (error) {
    console.error('❌ Veri import hatası:', error);
    return false;
  }
};

export const getStorageUsage = (): { used: number; available: number; percentage: number } => {
  try {
    let used = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) used += item.length;
    });
    
    // Estimate 5MB as localStorage limit (varies by browser)
    const available = 5 * 1024 * 1024; // 5MB in bytes
    const percentage = (used / available) * 100;
    
    return { used, available, percentage };
  } catch (error) {
    console.error('❌ Storage usage hesaplanamadı:', error);
    return { used: 0, available: 0, percentage: 0 };
  }
}; 