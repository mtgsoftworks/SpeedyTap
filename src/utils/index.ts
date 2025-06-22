import { Position, Size, MobileFeatures } from '@/types';
import { MOBILE, STORAGE_KEYS } from '@/constants';

// Math Utilities
export const generateRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateRandomPosition = (containerSize: Size, elementSize: Size): Position => {
  return {
    x: generateRandomNumber(elementSize.width, containerSize.width - elementSize.width),
    y: generateRandomNumber(elementSize.height, containerSize.height - elementSize.height),
  };
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// Time Utilities
export const delay = (callback: () => void, delayTime: number): NodeJS.Timeout => {
  return setTimeout(callback, delayTime);
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// DOM Utilities
export const getElementSize = (element: HTMLElement): Size => {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
  };
};

export const addEventListeners = (
  element: HTMLElement,
  events: string[],
  handler: EventListener,
  options?: AddEventListenerOptions
): void => {
  events.forEach(event => {
    element.addEventListener(event, handler, options);
  });
};

export const removeEventListeners = (
  element: HTMLElement,
  events: string[],
  handler: EventListener
): void => {
  events.forEach(event => {
    element.removeEventListener(event, handler);
  });
};

// Animation Utilities
export const addCSSAnimation = (
  element: HTMLElement,
  animationClass: string,
  onComplete?: () => void
): void => {
  element.classList.add(animationClass);
  
  if (onComplete) {
    const handleAnimationEnd = () => {
      element.classList.remove(animationClass);
      element.removeEventListener('animationend', handleAnimationEnd);
      onComplete();
    };
    
    element.addEventListener('animationend', handleAnimationEnd);
  }
};

export const removeCSSAnimation = (element: HTMLElement, animationClass: string): void => {
  element.classList.remove(animationClass);
};

// Mobile Detection
export const detectMobileFeatures = (): MobileFeatures => {
  const hasVibration = 'vibrate' in navigator;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  const screenSize: Size = {
    width: window.innerWidth || document.body.clientWidth,
    height: window.innerHeight || document.body.clientHeight,
  };
  
  // Safe area detection (CSS environment variables)
  const safeArea = {
    top: getCSSEnvValue('safe-area-inset-top'),
    right: getCSSEnvValue('safe-area-inset-right'),
    bottom: getCSSEnvValue('safe-area-inset-bottom'),
    left: getCSSEnvValue('safe-area-inset-left'),
  };
  
  return {
    hasVibration,
    isTouchDevice,
    screenSize,
    safeArea,
  };
};

export const getCSSEnvValue = (variable: string): number => {
  const testDiv = document.createElement('div');
  testDiv.style.padding = `env(${variable})`;
  document.body.appendChild(testDiv);
  
  const computedStyle = window.getComputedStyle(testDiv);
  const paddingValue = computedStyle.paddingTop;
  
  document.body.removeChild(testDiv);
  
  return paddingValue ? parseInt(paddingValue, 10) : MOBILE.SAFE_AREA_FALLBACK;
};

export const isMobileDevice = (): boolean => {
  return window.innerWidth <= MOBILE.BREAKPOINT_MOBILE;
};

// Vibration Utility
export const vibrate = (pattern: number | number[]): void => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

// Touch/Zoom Prevention
export const preventZoomAndScroll = (): void => {
  let lastTouchEnd = 0;
  
  // Prevent double-tap zoom
  document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
  
  // Prevent pinch zoom
  document.addEventListener('touchmove', (event) => {
    if ((event as TouchEvent).touches.length > 1) {
      event.preventDefault();
    }
  }, { passive: false });
  
  // Prevent scroll bounce on iOS
  document.body.style.overscrollBehavior = 'none';
};



// Validation Utilities
export const isValidScore = (score: number): boolean => {
  return typeof score === 'number' && score >= 0 && Number.isInteger(score);
};

export const isValidLevel = (level: number): boolean => {
  return typeof level === 'number' && level >= 1 && Number.isInteger(level);
};

// String Utilities
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const generateUniqueId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};



export * from './storage';
export * from './performance';
export * from './admob';
export * from './i18n';

import { ACHIEVEMENT_DEFINITIONS, DEFAULT_SETTINGS, ACHIEVEMENT_CATEGORIES, ACHIEVEMENT_RARITIES } from '@/constants';
import { 
  loadSettings, 
  saveSettings, 
  updateSettingsPartial,
  loadUserAchievements,
  saveUserAchievements,
  loadUserStats,
  updateUserStats,
  getStorageUsage,
  exportUserData,
  importUserData,
  clearAllData
} from './storage';
import { UserSettings, Achievement, UserAchievement, UserStats } from '@/types';

// =============================================
// SETTINGS MANAGER CLASS
// =============================================

export class SettingsManager {
  private static instance: SettingsManager;
  private settings: UserSettings;
  private listeners: Set<(settings: UserSettings) => void> = new Set();

  private constructor() {
    this.settings = loadSettings();
  }

  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  public getSettings(): UserSettings {
    return { ...this.settings };
  }

  public updateSetting<K extends keyof UserSettings>(
    category: K,
    updates: Partial<UserSettings[K]>
  ): void {
    this.settings = {
      ...this.settings,
      [category]: {
        ...(this.settings[category] as object),
        ...updates,
      },
      lastUpdated: Date.now(),
    };
    
    saveSettings(this.settings);
    this.notifyListeners();
    this.refreshStorageInfo(); // Update storage info in real-time
    console.log(`⚙️ Settings updated: ${category}`, updates);
  }

  public resetToDefaults(): void {
    this.settings = loadSettings();
    saveSettings(this.settings);
    this.notifyListeners();
    console.log('🔄 Settings reset to defaults');
  }

  public subscribe(listener: (settings: UserSettings) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.settings));
  }

  public initializeSettingsUI(): void {
    this.bindAudioSettings();
    this.bindVisualSettings();
    this.bindGameplaySettings();
    this.bindDataSettings();
    this.updateStorageInfo();
  }

  private bindAudioSettings(): void {
    const soundToggle = document.getElementById('soundEnabledToggle') as HTMLInputElement;
    const masterVolumeSlider = document.getElementById('masterVolumeSlider') as HTMLInputElement;
    const sfxVolumeSlider = document.getElementById('sfxVolumeSlider') as HTMLInputElement;
    const hapticToggle = document.getElementById('hapticFeedbackToggle') as HTMLInputElement;

    if (soundToggle) {
      soundToggle.checked = this.settings.audio.soundEnabled;
      soundToggle.addEventListener('change', () => {
        this.updateSetting('audio', { soundEnabled: soundToggle.checked });
      });
    }

    if (masterVolumeSlider) {
      masterVolumeSlider.value = (this.settings.audio.masterVolume * 100).toString();
      const valueDisplay = document.getElementById('masterVolumeValue');
      if (valueDisplay) valueDisplay.textContent = `${Math.round(this.settings.audio.masterVolume * 100)}%`;
      
      masterVolumeSlider.addEventListener('input', () => {
        const value = parseInt(masterVolumeSlider.value) / 100;
        this.updateSetting('audio', { masterVolume: value });
        if (valueDisplay) valueDisplay.textContent = `${Math.round(value * 100)}%`;
      });
    }

    if (sfxVolumeSlider) {
      sfxVolumeSlider.value = (this.settings.audio.sfxVolume * 100).toString();
      const valueDisplay = document.getElementById('sfxVolumeValue');
      if (valueDisplay) valueDisplay.textContent = `${Math.round(this.settings.audio.sfxVolume * 100)}%`;
      
      sfxVolumeSlider.addEventListener('input', () => {
        const value = parseInt(sfxVolumeSlider.value) / 100;
        this.updateSetting('audio', { sfxVolume: value });
        if (valueDisplay) valueDisplay.textContent = `${Math.round(value * 100)}%`;
      });
    }

    if (hapticToggle) {
      hapticToggle.checked = this.settings.audio.hapticFeedback;
      hapticToggle.addEventListener('change', () => {
        this.updateSetting('audio', { hapticFeedback: hapticToggle.checked });
      });
    }
  }

  private bindVisualSettings(): void {
    const animationsToggle = document.getElementById('animationsToggle') as HTMLInputElement;
    const particlesToggle = document.getElementById('particlesToggle') as HTMLInputElement;
    const screenShakeToggle = document.getElementById('screenShakeToggle') as HTMLInputElement;

    if (animationsToggle) {
      animationsToggle.checked = this.settings.visual.animations;
      animationsToggle.addEventListener('change', () => {
        this.updateSetting('visual', { animations: animationsToggle.checked });
      });
    }

    if (particlesToggle) {
      particlesToggle.checked = this.settings.visual.particles;
      particlesToggle.addEventListener('change', () => {
        this.updateSetting('visual', { particles: particlesToggle.checked });
      });
    }

    if (screenShakeToggle) {
      screenShakeToggle.checked = this.settings.visual.screenShake;
      screenShakeToggle.addEventListener('change', () => {
        this.updateSetting('visual', { screenShake: screenShakeToggle.checked });
      });
    }
  }

  private bindGameplaySettings(): void {
    const difficultySelect = document.getElementById('difficultySelect') as HTMLSelectElement;
    const autoResumeToggle = document.getElementById('autoResumeToggle') as HTMLInputElement;
    const showHintsToggle = document.getElementById('showHintsToggle') as HTMLInputElement;

    if (difficultySelect) {
      difficultySelect.value = this.settings.gameplay.difficulty;
      difficultySelect.addEventListener('change', () => {
        this.updateSetting('gameplay', { 
          difficulty: difficultySelect.value as 'easy' | 'normal' | 'hard' 
        });
      });
    }

    if (autoResumeToggle) {
      autoResumeToggle.checked = this.settings.gameplay.autoResume;
      autoResumeToggle.addEventListener('change', () => {
        this.updateSetting('gameplay', { autoResume: autoResumeToggle.checked });
      });
    }

    if (showHintsToggle) {
      showHintsToggle.checked = this.settings.gameplay.showHints;
      showHintsToggle.addEventListener('change', () => {
        this.updateSetting('gameplay', { showHints: showHintsToggle.checked });
      });
    }
  }

  private bindDataSettings(): void {
    const autoBackupToggle = document.getElementById('autoBackupToggle') as HTMLInputElement;
    const analyticsToggle = document.getElementById('analyticsToggle') as HTMLInputElement;
    const exportBtn = document.getElementById('exportDataBtn');
    const importBtn = document.getElementById('importDataBtn');
    const resetBtn = document.getElementById('resetDataBtn');

    if (autoBackupToggle) {
      autoBackupToggle.checked = this.settings.data.autoBackup;
      autoBackupToggle.addEventListener('change', () => {
        this.updateSetting('data', { autoBackup: autoBackupToggle.checked });
      });
    }

    if (analyticsToggle) {
      analyticsToggle.checked = this.settings.data.analyticsEnabled;
      analyticsToggle.addEventListener('change', () => {
        this.updateSetting('data', { analyticsEnabled: analyticsToggle.checked });
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportData());
    }

    if (importBtn) {
      importBtn.addEventListener('click', () => this.importData());
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.confirmReset());
    }
  }

  private exportData(): void {
    try {
      const data = exportUserData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `speedytap-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('📤 Data exported successfully');
    } catch (error) {
      console.error('❌ Export failed:', error);
    }
  }

  private importData(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string;
          if (importUserData(data)) {
            this.settings = loadSettings();
            this.initializeSettingsUI();
            this.refreshStorageInfo(); // Update storage info after import
            console.log('📥 Data imported successfully');
          }
        } catch (error) {
          console.error('❌ Import failed:', error);
        }
      };
      reader.readAsText(file);
    });
    
    input.click();
  }

  private confirmReset(): void {
    if (confirm('🗑️ Tüm verileri sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
      clearAllData();
      this.settings = loadSettings();
      this.initializeSettingsUI();
      this.refreshStorageInfo(); // Update storage info after reset
      console.log('🔄 All data reset');
    }
  }

  private updateStorageInfo(): void {
    const { used, available, percentage } = getStorageUsage();
    const usageBar = document.getElementById('storageUsageBar');
    const usageText = document.getElementById('storageUsageText');
    
    if (usageBar) {
      usageBar.style.width = `${percentage}%`;
      // Update color based on usage
      if (percentage > 80) {
        usageBar.style.background = 'linear-gradient(90deg, #FF4444, #FF6666)';
      } else if (percentage > 60) {
        usageBar.style.background = 'linear-gradient(90deg, #FFB800, #FFCC33)';
      } else {
        usageBar.style.background = 'linear-gradient(90deg, #00FF6B, #33FF88)';
      }
    }
    
    if (usageText) {
      const usedKB = Math.round(used / 1024);
      const availableMB = Math.round(available / (1024 * 1024));
      usageText.textContent = `Kullanım: ${usedKB} KB / ${availableMB} MB (${percentage.toFixed(1)}%)`;
    }
  }

  public refreshStorageInfo(): void {
    // Call this method whenever storage changes to update real-time
    this.updateStorageInfo();
  }
}

// =============================================
// ACHIEVEMENTS MANAGER CLASS
// =============================================

export class AchievementsManager {
  private static instance: AchievementsManager;
  private userAchievements: Record<string, UserAchievement> = {};
  private userStats: UserStats;
  private currentFilter: string = 'all';

  private constructor() {
    this.userAchievements = loadUserAchievements();
    this.userStats = loadUserStats();
  }

  public static getInstance(): AchievementsManager {
    if (!AchievementsManager.instance) {
      AchievementsManager.instance = new AchievementsManager();
    }
    return AchievementsManager.instance;
  }

  public initializeAchievementsUI(): void {
    this.bindFilterButtons();
    this.updateStatsDisplay();
    this.renderAchievements();
  }

  private bindFilterButtons(): void {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active to clicked button
        button.classList.add('active');
        
        const category = button.getAttribute('data-category') || 'all';
        this.currentFilter = category;
        this.renderAchievements();
      });
    });
  }

  private updateStatsDisplay(): void {
    const unlockedCount = Object.values(this.userAchievements).filter(a => a.isUnlocked).length;
    const totalPoints = Object.values(this.userAchievements)
      .filter(a => a.isUnlocked)
      .reduce((sum, achievement) => {
        const def = ACHIEVEMENT_DEFINITIONS.find(def => def.id === achievement.achievementId);
        return sum + (def?.reward?.value as number || 0);
      }, 0);
    const completionPercentage = Math.round((unlockedCount / ACHIEVEMENT_DEFINITIONS.length) * 100);

    const unlockedElement = document.getElementById('unlockedCount');
    const pointsElement = document.getElementById('totalPoints');
    const percentageElement = document.getElementById('completionPercentage');

    if (unlockedElement) unlockedElement.textContent = unlockedCount.toString();
    if (pointsElement) pointsElement.textContent = totalPoints.toString();
    if (percentageElement) percentageElement.textContent = `${completionPercentage}%`;
  }

  private renderAchievements(): void {
    const container = document.getElementById('achievementsList');
    if (!container) return;

    const filteredAchievements = ACHIEVEMENT_DEFINITIONS.filter(achievement => {
      if (this.currentFilter === 'all') return true;
      return achievement.category === this.currentFilter;
    });

    container.innerHTML = filteredAchievements.map(achievement => {
      const userAchievement = this.userAchievements[achievement.id];
      const isUnlocked = userAchievement?.isUnlocked || false;
      const progress = userAchievement?.progress || 0;
      const category = ACHIEVEMENT_CATEGORIES[achievement.category];
      const rarity = ACHIEVEMENT_RARITIES[achievement.rarity];

      return `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="achievement-header">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
              <h4 class="achievement-title">${achievement.title}</h4>
              <p class="achievement-description">${achievement.description}</p>
            </div>
          </div>
          
          <div class="achievement-category ${achievement.category}">
            ${category.name}
          </div>
          
          <div class="achievement-rarity ${achievement.rarity}">
            ${rarity.name}
          </div>
          
          <div class="achievement-reward">
            +${achievement.reward?.value || 0} Puan
          </div>
          
          ${!isUnlocked ? `
            <div class="achievement-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
              </div>
              <div class="progress-text">${progress}% Tamamlandı</div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  public checkAchievements(gameStats: Partial<UserStats>): void {
    // This method will be called after each game to check for new achievements
    ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
      if (this.userAchievements[achievement.id]?.isUnlocked) return;

      let shouldUnlock = false;
      const condition = achievement.condition;

      switch (condition.type) {
        case 'score':
          shouldUnlock = (gameStats.highestScore || 0) >= condition.target;
          break;
        case 'level':
          shouldUnlock = (gameStats.highestLevel || 0) >= condition.target;
          break;
        case 'games_played':
          shouldUnlock = (gameStats.totalGamesPlayed || 0) >= condition.target;
          break;
        case 'perfect_games':
          shouldUnlock = (gameStats.perfectGames || 0) >= condition.target;
          break;
        case 'streak':
          shouldUnlock = (gameStats.bestStreak || 0) >= condition.target;
          break;
      }

      if (shouldUnlock) {
        this.unlockAchievement(achievement.id);
      }
    });
  }

  private unlockAchievement(achievementId: string): void {
    this.userAchievements[achievementId] = {
      achievementId,
      unlockedAt: Date.now(),
      progress: 100,
      isUnlocked: true,
      notificationShown: false,
    };
    
    saveUserAchievements(this.userAchievements);
    
    // Refresh UI if achievements page is currently visible
    this.updateStatsDisplay();
    this.renderAchievements();
    
    const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId);
    if (achievement) {
      console.log(`🏆 Achievement Unlocked: ${achievement.title}`);
      // Show achievement notification
      this.showAchievementNotification(achievement);
    }
  }

  private showAchievementNotification(achievement: any): void {
    // Create temporary notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #FFB800, #FF9500);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(255, 184, 0, 0.4);
      z-index: 10000;
      font-family: 'Source Sans Pro', sans-serif;
      font-size: 14px;
      max-width: 300px;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 20px;">${achievement.icon}</span>
        <div>
          <div style="font-weight: 600;">Başarım Açıldı!</div>
          <div>${achievement.title}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
} 