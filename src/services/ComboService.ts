export interface ComboState {
  currentCombo: number;
  maxCombo: number;
  comboMultiplier: number;
  isComboActive: boolean;
  lastHitTime: number;
  comboTimeWindow: number; // ms - max time between hits
  streak: number;
  streakLevel: StreakLevel;
}

export interface StreakLevel {
  name: string;
  icon: string;
  multiplier: number;
  minCombo: number;
  color: string;
  particle: string;
}

export interface ComboEvent {
  type: 'combo_start' | 'combo_increase' | 'combo_break' | 'streak_level_up';
  combo: number;
  multiplier: number;
  streakLevel?: StreakLevel;
}

export class ComboService {
  private static instance: ComboService;
  private comboState!: ComboState;
  private listeners: ((event: ComboEvent) => void)[] = [];
  private comboTimer: number | null = null;

  private streakLevels: StreakLevel[] = [
    {
      name: 'Beginner',
      icon: '⚪',
      multiplier: 1,
      minCombo: 0,
      color: '#9CA3AF',
      particle: 'normal'
    },
    {
      name: 'Good',
      icon: '🟡',
      multiplier: 1.2,
      minCombo: 5,
      color: '#FCD34D',
      particle: 'good'
    },
    {
      name: 'Great',
      icon: '🟠',
      multiplier: 1.5,
      minCombo: 10,
      color: '#FB923C',
      particle: 'great'
    },
    {
      name: 'Perfect',
      icon: '🔴',
      multiplier: 2,
      minCombo: 20,
      color: '#EF4444',
      particle: 'perfect'
    },
    {
      name: 'Legendary',
      icon: '🟣',
      multiplier: 2.5,
      minCombo: 35,
      color: '#8B5CF6',
      particle: 'legendary'
    },
    {
      name: 'Impossible',
      icon: '🌟',
      multiplier: 3,
      minCombo: 50,
      color: '#06D6A0',
      particle: 'impossible'
    },
    {
      name: 'Godlike',
      icon: '✨',
      multiplier: 4,
      minCombo: 75,
      color: '#FFD700',
      particle: 'godlike'
    }
  ];

  public static getInstance(): ComboService {
    if (!ComboService.instance) {
      ComboService.instance = new ComboService();
    }
    return ComboService.instance;
  }

  constructor() {
    this.resetCombo();
  }

  private resetCombo(): void {
    this.comboState = {
      currentCombo: 0,
      maxCombo: 0,
      comboMultiplier: 1,
      isComboActive: false,
      lastHitTime: 0,
      comboTimeWindow: 2000, // 2 saniye
      streak: 0,
      streakLevel: this.streakLevels[0]
    };
  }

  // Hit başarılı olduğunda çağrılır
  onSuccessfulHit(): ComboEvent[] {
    const now = Date.now();
    const events: ComboEvent[] = [];
    
    // İlk hit mi kontrol et
    if (this.comboState.currentCombo === 0) {
      this.comboState.isComboActive = true;
      this.comboState.currentCombo = 1;
      this.comboState.lastHitTime = now;
      
      events.push({
        type: 'combo_start',
        combo: 1,
        multiplier: this.calculateMultiplier(1)
      });
      
      this.startComboTimer();
    } else {
      // Zaman aşımı kontrolü
      const timeSinceLastHit = now - this.comboState.lastHitTime;
      
      if (timeSinceLastHit <= this.comboState.comboTimeWindow) {
        // Combo devam ediyor
        this.comboState.currentCombo++;
        this.comboState.lastHitTime = now;
        
        // Max combo güncelle
        if (this.comboState.currentCombo > this.comboState.maxCombo) {
          this.comboState.maxCombo = this.comboState.currentCombo;
        }
        
        events.push({
          type: 'combo_increase',
          combo: this.comboState.currentCombo,
          multiplier: this.calculateMultiplier(this.comboState.currentCombo)
        });
        
        // Streak level kontrolü
        const newStreakLevel = this.getStreakLevel(this.comboState.currentCombo);
        if (newStreakLevel.minCombo > this.comboState.streakLevel.minCombo) {
          this.comboState.streakLevel = newStreakLevel;
          
          events.push({
            type: 'streak_level_up',
            combo: this.comboState.currentCombo,
            multiplier: newStreakLevel.multiplier,
            streakLevel: newStreakLevel
          });
        }
        
        this.restartComboTimer();
      } else {
        // Combo kırıldı, yeni combo başla
        this.breakCombo();
        events.push({
          type: 'combo_break',
          combo: 0,
          multiplier: 1
        });
        
        // Yeni combo başlat
        return this.onSuccessfulHit();
      }
    }
    
    // Multiplier'ı güncelle
    this.comboState.comboMultiplier = this.calculateMultiplier(this.comboState.currentCombo);
    
    // Event'leri notify et
    events.forEach(event => this.notifyListeners(event));
    
    return events;
  }

  // Miss olduğunda çağrılır
  onMissedHit(): ComboEvent | null {
    if (this.comboState.isComboActive) {
      this.breakCombo();
      const event: ComboEvent = {
        type: 'combo_break',
        combo: 0,
        multiplier: 1
      };
      this.notifyListeners(event);
      return event;
    }
    return null;
  }

  private breakCombo(): void {
    this.clearComboTimer();
    this.comboState.currentCombo = 0;
    this.comboState.isComboActive = false;
    this.comboState.comboMultiplier = 1;
    this.comboState.streakLevel = this.streakLevels[0];
  }

  private calculateMultiplier(combo: number): number {
    if (combo === 0) return 1;
    
    // Base multiplier hesaplama
    let baseMultiplier = 1;
    
    if (combo >= 5) baseMultiplier += 0.1;     // +10% after 5 hits
    if (combo >= 10) baseMultiplier += 0.2;   // +20% after 10 hits  
    if (combo >= 20) baseMultiplier += 0.3;   // +30% after 20 hits
    if (combo >= 35) baseMultiplier += 0.5;   // +50% after 35 hits
    if (combo >= 50) baseMultiplier += 0.7;   // +70% after 50 hits
    if (combo >= 75) baseMultiplier += 1.0;   // +100% after 75 hits
    
    // Streak level multiplier'ı uygula
    const streakLevel = this.getStreakLevel(combo);
    return Math.round((baseMultiplier * streakLevel.multiplier) * 10) / 10;
  }

  private getStreakLevel(combo: number): StreakLevel {
    for (let i = this.streakLevels.length - 1; i >= 0; i--) {
      if (combo >= this.streakLevels[i].minCombo) {
        return this.streakLevels[i];
      }
    }
    return this.streakLevels[0];
  }

  private startComboTimer(): void {
    this.comboTimer = window.setTimeout(() => {
      this.breakCombo();
      this.notifyListeners({
        type: 'combo_break',
        combo: 0,
        multiplier: 1
      });
    }, this.comboState.comboTimeWindow);
  }

  private restartComboTimer(): void {
    this.clearComboTimer();
    this.startComboTimer();
  }

  private clearComboTimer(): void {
    if (this.comboTimer) {
      clearTimeout(this.comboTimer);
      this.comboTimer = null;
    }
  }

  // Public getters
  getCurrentCombo(): number {
    return this.comboState.currentCombo;
  }

  getMaxCombo(): number {
    return this.comboState.maxCombo;
  }

  getComboMultiplier(): number {
    return this.comboState.comboMultiplier;
  }

  isComboActive(): boolean {
    return this.comboState.isComboActive;
  }

  getCurrentStreakLevel(): StreakLevel {
    return this.comboState.streakLevel;
  }

  getComboTimeRemaining(): number {
    if (!this.comboState.isComboActive || !this.comboState.lastHitTime) {
      return 0;
    }
    
    const elapsed = Date.now() - this.comboState.lastHitTime;
    return Math.max(0, this.comboState.comboTimeWindow - elapsed);
  }

  // Combo state'i al (save/load için)
  getComboState(): ComboState {
    return { ...this.comboState };
  }

  // Oyun başında reset
  resetForNewGame(): void {
    this.clearComboTimer();
    this.resetCombo();
  }

  // Pause/resume
  pauseCombo(): void {
    this.clearComboTimer();
  }

  resumeCombo(): void {
    if (this.comboState.isComboActive) {
      this.startComboTimer();
    }
  }

  // Settings'den combo time window değiştirme
  setComboTimeWindow(milliseconds: number): void {
    this.comboState.comboTimeWindow = Math.max(500, Math.min(5000, milliseconds));
  }

  // Event listeners
  onComboEvent(callback: (event: ComboEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  private notifyListeners(event: ComboEvent): void {
    this.listeners.forEach(listener => listener(event));
  }

  // Achievement/stats için
  getComboStats(): {
    maxComboEver: number;
    totalCombos: number;
    averageCombo: number;
    bestStreakLevel: string;
  } {
    const saved = localStorage.getItem('speedytap_combo_stats');
    const defaultStats = {
      maxComboEver: this.comboState.maxCombo,
      totalCombos: 0,
      averageCombo: 0,
      bestStreakLevel: this.comboState.streakLevel.name
    };
    
    if (!saved) return defaultStats;
    
    try {
      const stats = JSON.parse(saved);
      return {
        ...defaultStats,
        ...stats,
        maxComboEver: Math.max(stats.maxComboEver || 0, this.comboState.maxCombo)
      };
    } catch {
      return defaultStats;
    }
  }

  saveComboStats(): void {
    const currentStats = this.getComboStats();
    const newStats = {
      ...currentStats,
      maxComboEver: Math.max(currentStats.maxComboEver, this.comboState.maxCombo),
      totalCombos: currentStats.totalCombos + (this.comboState.maxCombo > 0 ? 1 : 0)
    };
    
    localStorage.setItem('speedytap_combo_stats', JSON.stringify(newStats));
  }

  // UI için streak level'ları al
  getAllStreakLevels(): StreakLevel[] {
    return [...this.streakLevels];
  }
} 