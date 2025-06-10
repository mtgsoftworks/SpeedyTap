export interface Theme {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockCondition?: string;
  colors: ThemeColors;
  effects: ThemeEffects;
  sounds?: ThemeSounds;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundGradient: string[];
  text: string;
  textSecondary: string;
  circle: string;
  circleCorrect: string;
  circleWrong: string;
  button: string;
  buttonHover: string;
  success: string;
  warning: string;
  error: string;
  particle: string[];
}

export interface ThemeEffects {
  particleIntensity: number; // 0.5 - 2.0
  animationSpeed: number; // 0.5 - 2.0
  glowEffect: boolean;
  shadowIntensity: number; // 0 - 1
  backgroundPattern?: string;
  circleStyle: 'solid' | 'gradient' | 'glow' | 'neon' | 'minimal';
}

export interface ThemeSounds {
  tapSound?: string;
  successSound?: string;
  comboSound?: string;
  powerUpSound?: string;
}

export class ThemeService {
  private static instance: ThemeService;
  private currentTheme!: Theme;
  private themes: Map<string, Theme> = new Map();
  private listeners: ((theme: Theme) => void)[] = [];

  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  constructor() {
    this.initializeThemes();
    this.loadCurrentTheme();
  }

  private initializeThemes(): void {
    const themes: Theme[] = [
      {
        id: 'default',
        name: 'Classic Blue',
        description: 'Original SpeedyTap theme',
        icon: '🔵',
        isUnlocked: true,
        colors: {
          primary: '#4fd1c7',
          secondary: '#38b2ac',
          accent: '#FFD700',
          background: '#0b1d31',
          backgroundGradient: ['#0b1d31', '#1a2f4a', '#2d3748'],
          text: '#ffffff',
          textSecondary: '#e2e8f0',
          circle: '#4fd1c7',
          circleCorrect: '#22c55e',
          circleWrong: '#ef4444',
          button: '#4fd1c7',
          buttonHover: '#38b2ac',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
          particle: ['#4fd1c7', '#38b2ac', '#FFD700', '#ffffff']
        },
        effects: {
          particleIntensity: 1,
          animationSpeed: 1,
          glowEffect: true,
          shadowIntensity: 0.3,
          circleStyle: 'glow'
        }
      },
      {
        id: 'neon',
        name: 'Neon Night',
        description: 'Cyberpunk style neon theme',
        icon: '🌃',
        isUnlocked: false,
        unlockCondition: 'Reach Level 5',
        colors: {
          primary: '#ff00ff',
          secondary: '#00ffff',
          accent: '#ffff00',
          background: '#000011',
          backgroundGradient: ['#000011', '#001122', '#002244'],
          text: '#ffffff',
          textSecondary: '#ccccff',
          circle: '#ff00ff',
          circleCorrect: '#00ff00',
          circleWrong: '#ff0040',
          button: '#ff00ff',
          buttonHover: '#ff40ff',
          success: '#00ff00',
          warning: '#ffff00',
          error: '#ff0040',
          particle: ['#ff00ff', '#00ffff', '#ffff00', '#ff0040']
        },
        effects: {
          particleIntensity: 1.5,
          animationSpeed: 1.2,
          glowEffect: true,
          shadowIntensity: 0.8,
          circleStyle: 'neon'
        }
      },
      {
        id: 'sunset',
        name: 'Sunset',
        description: 'Warm orange and pink tones',
        icon: '🌅',
        isUnlocked: false,
        unlockCondition: 'Score 1000 points',
        colors: {
          primary: '#ff6b35',
          secondary: '#f7931e',
          accent: '#ffbe0b',
          background: '#2d1b69',
          backgroundGradient: ['#2d1b69', '#8b5a3c', '#ff6b35'],
          text: '#ffffff',
          textSecondary: '#ffeaa7',
          circle: '#ff6b35',
          circleCorrect: '#00b894',
          circleWrong: '#d63031',
          button: '#ff6b35',
          buttonHover: '#f7931e',
          success: '#00b894',
          warning: '#fdcb6e',
          error: '#d63031',
          particle: ['#ff6b35', '#f7931e', '#ffbe0b', '#ff7675']
        },
        effects: {
          particleIntensity: 1.3,
          animationSpeed: 0.9,
          glowEffect: true,
          shadowIntensity: 0.4,
          circleStyle: 'gradient'
        }
      },
      {
        id: 'ocean',
        name: 'Ocean Depth',
        description: 'Deep blue and sea tones',
        icon: '🌊',
        isUnlocked: false,
        unlockCondition: 'Make 25 combo',
        colors: {
          primary: '#0077be',
          secondary: '#00a8cc',
          accent: '#40e0d0',
          background: '#001f3f',
          backgroundGradient: ['#001f3f', '#003d7a', '#0077be'],
          text: '#ffffff',
          textSecondary: '#b0e0e6',
          circle: '#0077be',
          circleCorrect: '#20b2aa',
          circleWrong: '#dc143c',
          button: '#0077be',
          buttonHover: '#00a8cc',
          success: '#20b2aa',
          warning: '#ffa500',
          error: '#dc143c',
          particle: ['#0077be', '#00a8cc', '#40e0d0', '#87ceeb']
        },
        effects: {
          particleIntensity: 1.1,
          animationSpeed: 0.8,
          glowEffect: true,
          shadowIntensity: 0.5,
          circleStyle: 'gradient'
        }
      },
      {
        id: 'forest',
        name: 'Orman Yeşili',
        description: 'Doğal yeşil tonları',
        icon: '🌲',
        isUnlocked: false,
        unlockCondition: 'Level 10\'a ulaş',
        colors: {
          primary: '#228b22',
          secondary: '#32cd32',
          accent: '#90ee90',
          background: '#0f2027',
          backgroundGradient: ['#0f2027', '#203a43', '#2c5530'],
          text: '#ffffff',
          textSecondary: '#f0fff0',
          circle: '#228b22',
          circleCorrect: '#00ff00',
          circleWrong: '#8b0000',
          button: '#228b22',
          buttonHover: '#32cd32',
          success: '#00ff00',
          warning: '#ffd700',
          error: '#8b0000',
          particle: ['#228b22', '#32cd32', '#90ee90', '#adff2f']
        },
        effects: {
          particleIntensity: 0.9,
          animationSpeed: 0.7,
          glowEffect: false,
          shadowIntensity: 0.2,
          circleStyle: 'solid'
        }
      },
      {
        id: 'space',
        name: 'Space Adventure',
        description: 'Galactic purple and blue tones',
        icon: '🚀',
        isUnlocked: false,
        unlockCondition: 'Score 5000 points',
        colors: {
          primary: '#6a0dad',
          secondary: '#9370db',
          accent: '#00bfff',
          background: '#000000',
          backgroundGradient: ['#000000', '#1a0033', '#2d1b69'],
          text: '#ffffff',
          textSecondary: '#e6e6fa',
          circle: '#6a0dad',
          circleCorrect: '#00ff7f',
          circleWrong: '#ff1493',
          button: '#6a0dad',
          buttonHover: '#9370db',
          success: '#00ff7f',
          warning: '#ffd700',
          error: '#ff1493',
          particle: ['#6a0dad', '#9370db', '#00bfff', '#ff69b4']
        },
        effects: {
          particleIntensity: 1.8,
          animationSpeed: 1.3,
          glowEffect: true,
          shadowIntensity: 0.7,
          circleStyle: 'glow'
        }
      },
      {
        id: 'minimal',
        name: 'Minimalist',
        description: 'Clean white and gray tones',
        icon: '⚪',
        isUnlocked: false,
        unlockCondition: 'Make 50 combo',
        colors: {
          primary: '#333333',
          secondary: '#666666',
          accent: '#999999',
          background: '#f5f5f5',
          backgroundGradient: ['#f5f5f5', '#e0e0e0', '#cccccc'],
          text: '#333333',
          textSecondary: '#666666',
          circle: '#333333',
          circleCorrect: '#4caf50',
          circleWrong: '#f44336',
          button: '#333333',
          buttonHover: '#666666',
          success: '#4caf50',
          warning: '#ff9800',
          error: '#f44336',
          particle: ['#333333', '#666666', '#999999', '#cccccc']
        },
        effects: {
          particleIntensity: 0.6,
          animationSpeed: 0.8,
          glowEffect: false,
          shadowIntensity: 0.1,
          circleStyle: 'minimal'
        }
      },
      {
        id: 'rainbow',
        name: 'Gökkuşağı',
        description: 'Renkli ve eğlenceli tema',
        icon: '🌈',
        isUnlocked: false,
        unlockCondition: '100 combo yap',
        colors: {
          primary: '#ff0000',
          secondary: '#ff8000',
          accent: '#ffff00',
          background: '#2c3e50',
          backgroundGradient: ['#2c3e50', '#34495e', '#4a6741'],
          text: '#ffffff',
          textSecondary: '#ecf0f1',
          circle: '#ff0000', // Will cycle through colors
          circleCorrect: '#00ff00',
          circleWrong: '#ff0000',
          button: '#e74c3c',
          buttonHover: '#c0392b',
          success: '#27ae60',
          warning: '#f39c12',
          error: '#e74c3c',
          particle: ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0080ff', '#8000ff']
        },
        effects: {
          particleIntensity: 2,
          animationSpeed: 1.5,
          glowEffect: true,
          shadowIntensity: 0.6,
          circleStyle: 'gradient'
        }
      }
    ];

    themes.forEach(theme => {
      this.themes.set(theme.id, theme);
    });
  }

  private loadCurrentTheme(): void {
    const savedThemeId = localStorage.getItem('speedytap_current_theme') || 'default';
    const theme = this.themes.get(savedThemeId);
    
    if (theme && theme.isUnlocked) {
      this.currentTheme = theme;
    } else {
      this.currentTheme = this.themes.get('default')!;
    }
    
    this.applyTheme(this.currentTheme);
  }

  // Tema değiştirme
  setTheme(themeId: string): boolean {
    const theme = this.themes.get(themeId);
    
    if (!theme) {
      console.warn(`Theme not found: ${themeId}`);
      return false;
    }
    
    if (!theme.isUnlocked) {
      console.warn(`Theme not unlocked: ${themeId}`);
      return false;
    }
    
    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveCurrentTheme();
    this.notifyListeners();
    
    return true;
  }

  // Tema kilidini açma
  unlockTheme(themeId: string): boolean {
    const theme = this.themes.get(themeId);
    
    if (!theme) {
      return false;
    }
    
    theme.isUnlocked = true;
    this.saveUnlockedThemes();
    
    return true;
  }

  // Tema kilidini kontrol etme
  checkUnlockConditions(stats: {
    level: number;
    highScore: number;
    maxCombo: number;
  }): string[] {
    const newlyUnlocked: string[] = [];
    
    for (const theme of this.themes.values()) {
      if (theme.isUnlocked || !theme.unlockCondition) continue;
      
      let shouldUnlock = false;
      
      // Unlock condition'ları kontrol et
      if (theme.unlockCondition.includes('Level')) {
        const requiredLevel = parseInt(theme.unlockCondition.match(/\d+/)?.[0] || '0');
        shouldUnlock = stats.level >= requiredLevel;
      } else if (theme.unlockCondition.includes('puan')) {
        const requiredScore = parseInt(theme.unlockCondition.match(/\d+/)?.[0] || '0');
        shouldUnlock = stats.highScore >= requiredScore;
      } else if (theme.unlockCondition.includes('combo')) {
        const requiredCombo = parseInt(theme.unlockCondition.match(/\d+/)?.[0] || '0');
        shouldUnlock = stats.maxCombo >= requiredCombo;
      }
      
      if (shouldUnlock) {
        theme.isUnlocked = true;
        newlyUnlocked.push(theme.id);
      }
    }
    
    if (newlyUnlocked.length > 0) {
      this.saveUnlockedThemes();
    }
    
    return newlyUnlocked;
  }

  // CSS değişkenlerini güncelle
  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    const colors = theme.colors;
    
    // Ana renkler
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-text', colors.text);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    
    // Circle colors
    root.style.setProperty('--theme-circle', colors.circle);
    root.style.setProperty('--theme-circle-correct', colors.circleCorrect);
    root.style.setProperty('--theme-circle-wrong', colors.circleWrong);
    
    // Button colors
    root.style.setProperty('--theme-button', colors.button);
    root.style.setProperty('--theme-button-hover', colors.buttonHover);
    
    // Status colors
    root.style.setProperty('--theme-success', colors.success);
    root.style.setProperty('--theme-warning', colors.warning);
    root.style.setProperty('--theme-error', colors.error);
    
    // Background gradient
    const gradient = `linear-gradient(135deg, ${colors.backgroundGradient.join(', ')})`;
    root.style.setProperty('--theme-background-gradient', gradient);
    
    // Effects
    root.style.setProperty('--theme-glow', theme.effects.glowEffect ? '1' : '0');
    root.style.setProperty('--theme-shadow-intensity', theme.effects.shadowIntensity.toString());
    root.style.setProperty('--theme-animation-speed', theme.effects.animationSpeed.toString());
  }

  // Public getters
  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  getAllThemes(): Theme[] {
    return Array.from(this.themes.values());
  }

  getUnlockedThemes(): Theme[] {
    return Array.from(this.themes.values()).filter(theme => theme.isUnlocked);
  }

  getLockedThemes(): Theme[] {
    return Array.from(this.themes.values()).filter(theme => !theme.isUnlocked);
  }

  isThemeUnlocked(themeId: string): boolean {
    const theme = this.themes.get(themeId);
    return theme ? theme.isUnlocked : false;
  }

  // Circle color for rainbow theme
  getRainbowCircleColor(index: number): string {
    if (this.currentTheme.id !== 'rainbow') {
      return this.currentTheme.colors.circle;
    }
    
    const colors = ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0080ff', '#8000ff'];
    return colors[index % colors.length];
  }

  // Particle colors
  getParticleColors(): string[] {
    return this.currentTheme.colors.particle;
  }

  // Effect settings
  getEffects(): ThemeEffects {
    return this.currentTheme.effects;
  }

  // Event listeners
  onThemeChange(callback: (theme: Theme) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentTheme));
  }

  // Persistence
  private saveCurrentTheme(): void {
    localStorage.setItem('speedytap_current_theme', this.currentTheme.id);
  }

  private saveUnlockedThemes(): void {
    const unlockedThemes = Array.from(this.themes.values())
      .filter(theme => theme.isUnlocked)
      .map(theme => theme.id);
    
    localStorage.setItem('speedytap_unlocked_themes', JSON.stringify(unlockedThemes));
  }

  private loadUnlockedThemes(): void {
    try {
      const saved = localStorage.getItem('speedytap_unlocked_themes');
      if (saved) {
        const unlockedIds = JSON.parse(saved);
        unlockedIds.forEach((id: string) => {
          const theme = this.themes.get(id);
          if (theme) {
            theme.isUnlocked = true;
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load unlocked themes:', error);
    }
  }

  // Initialize after construction
  initialize(): void {
    this.loadUnlockedThemes();
    this.loadCurrentTheme();
  }

  // Preview theme (temporary)
  previewTheme(themeId: string): boolean {
    const theme = this.themes.get(themeId);
    if (!theme) return false;
    
    this.applyTheme(theme);
    return true;
  }

  // Restore current theme after preview
  restoreCurrentTheme(): void {
    this.applyTheme(this.currentTheme);
  }

  // Get theme preview info
  getThemePreview(themeId: string): { colors: ThemeColors; effects: ThemeEffects } | null {
    const theme = this.themes.get(themeId);
    if (!theme) return null;
    
    return {
      colors: theme.colors,
      effects: theme.effects
    };
  }
} 