export interface CurrencyData {
  coins: number;
  gems: number;
  xp: number;
  level: number;
  totalEarned: {
    coins: number;
    gems: number;
    xp: number;
  };
  dailyEarnings: {
    date: string;
    coins: number;
    gems: number;
    xp: number;
  };
  lastClaimDate: string;
  loginStreak: number;
}

export interface EarningSource {
  type: 'game_complete' | 'combo_bonus' | 'level_complete' | 'achievement' | 'daily_challenge' | 'perfect_game' | 'login_bonus';
  amount: number;
  currency: 'coins' | 'gems' | 'xp';
  multiplier?: number;
  description: string;
}

export interface LevelReward {
  level: number;
  coins: number;
  gems: number;
  unlocks: string[];
  title: string;
}

export class CurrencyService {
  private static instance: CurrencyService;
  private currency: CurrencyData;
  private listeners: ((currency: CurrencyData) => void)[] = [];

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  private constructor() {
    this.currency = this.loadCurrencyData();
    this.checkDailyReset();
    this.checkLevelUp();
  }

  private initializeDefaultCurrency(): CurrencyData {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      coins: 100, // Başlangıç parası
      gems: 10,   // Başlangıç gem'i
      xp: 0,
      level: 1,
      totalEarned: {
        coins: 100,
        gems: 10,
        xp: 0
      },
      dailyEarnings: {
        date: today,
        coins: 0,
        gems: 0,
        xp: 0
      },
      lastClaimDate: today,
      loginStreak: 1
    };
  }

  private loadCurrencyData(): CurrencyData {
    try {
      const saved = localStorage.getItem('speedytap_currency');
      if (saved) {
        return { ...this.initializeDefaultCurrency(), ...JSON.parse(saved) };
      } else {
        return this.initializeDefaultCurrency();
      }
    } catch (error) {
      console.warn('Failed to load currency data:', error);
      return this.initializeDefaultCurrency();
    }
  }

  private saveCurrencyData(): void {
    try {
      localStorage.setItem('speedytap_currency', JSON.stringify(this.currency));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save currency data:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.currency }));
  }

  private checkDailyReset(): void {
    const today = new Date().toISOString().split('T')[0];
    
    if (this.currency.dailyEarnings.date !== today) {
      // Yeni gün - daily earnings reset
      this.currency.dailyEarnings = {
        date: today,
        coins: 0,
        gems: 0,
        xp: 0
      };
      
      // Login streak kontrolü
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (this.currency.lastClaimDate === yesterdayStr) {
        this.currency.loginStreak++;
      } else if (this.currency.lastClaimDate !== today) {
        this.currency.loginStreak = 1; // Streak broken
      }
      
      this.currency.lastClaimDate = today;
      this.saveCurrencyData();
    }
  }

  private checkLevelUp(): void {
    const requiredXP = this.getRequiredXPForLevel(this.currency.level + 1);
    
    if (this.currency.xp >= requiredXP) {
      this.levelUp();
    }
  }

  private levelUp(): void {
    // Level progression tracking
    this.currency.level++;
    
    // Level up rewards
    const levelReward = this.getLevelReward(this.currency.level);
    if (levelReward) {
      this.currency.coins += levelReward.coins;
      this.currency.gems += levelReward.gems;
      this.currency.totalEarned.coins += levelReward.coins;
      this.currency.totalEarned.gems += levelReward.gems;
    }
    
    // Level up logged in development only
    this.saveCurrencyData();
    
    // Recursive level check (multiple level ups possible)
    this.checkLevelUp();
  }

  // Public methods
  public getCurrencyData(): CurrencyData {
    return { ...this.currency };
  }

  public getBalance(type: 'coins' | 'gems' | 'xp'): number {
    return this.currency[type];
  }

  public canAfford(amount: number, type: 'coins' | 'gems'): boolean {
    return this.currency[type] >= amount;
  }

  public earnCurrency(source: EarningSource): boolean {
    const { amount, currency, multiplier = 1 } = source;
    const finalAmount = Math.floor(amount * multiplier);
    
    // Earn currency
    this.currency[currency] += finalAmount;
    this.currency.totalEarned[currency] += finalAmount;
    this.currency.dailyEarnings[currency] += finalAmount;
    
    // Currency earning logged in development only
    
    // Check for level up if XP earned
    if (currency === 'xp') {
      this.checkLevelUp();
    }
    
    this.saveCurrencyData();
    return true;
  }

  public spendCurrency(amount: number, type: 'coins' | 'gems'): boolean {
    if (!this.canAfford(amount, type)) {
      return false;
    }
    
    this.currency[type] -= amount;
    this.saveCurrencyData();
    return true;
  }

  public calculateGameEarnings(score: number, level: number, combo: number, accuracy: number): EarningSource[] {
    const earnings: EarningSource[] = [];
    
    // Base coin earnings from score
    const baseCoins = Math.floor(score / 10);
    if (baseCoins > 0) {
      earnings.push({
        type: 'game_complete',
        amount: baseCoins,
        currency: 'coins',
        description: `Game score: ${score}`
      });
    }
    
    // Combo bonus
    const comboBonus = Math.floor(combo / 10) * 5;
    if (comboBonus > 0) {
      earnings.push({
        type: 'combo_bonus',
        amount: comboBonus,
        currency: 'coins',
        description: `Combo bonus: ${combo}`
      });
    }
    
    // Level completion bonus
    const levelBonus = level * 10;
    earnings.push({
      type: 'level_complete',
      amount: levelBonus,
      currency: 'coins',
      description: `Level ${level} completed`
    });
    
    // Perfect game bonus
    if (accuracy >= 95) {
      const perfectBonus = Math.floor(baseCoins * 0.5);
      earnings.push({
        type: 'perfect_game',
        amount: perfectBonus,
        currency: 'coins',
        multiplier: 1.5,
        description: `Perfect accuracy: ${accuracy.toFixed(1)}%`
      });
    }
    
    // XP from score
    const xpEarned = Math.floor(score / 100);
    if (xpEarned > 0) {
      earnings.push({
        type: 'game_complete',
        amount: xpEarned,
        currency: 'xp',
        description: `Experience gained`
      });
    }
    
    return earnings;
  }

  public getRequiredXPForLevel(level: number): number {
    // Exponential XP requirement: 100 * level^1.5
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  public getXPToNextLevel(): number {
    const currentLevel = this.currency.level;
    const requiredXP = this.getRequiredXPForLevel(currentLevel + 1);
    return Math.max(0, requiredXP - this.currency.xp);
  }

  public getLevelProgress(): number {
    const currentLevelXP = this.getRequiredXPForLevel(this.currency.level);
    const nextLevelXP = this.getRequiredXPForLevel(this.currency.level + 1);
    const progressXP = this.currency.xp - currentLevelXP;
    const totalXPNeeded = nextLevelXP - currentLevelXP;
    
    return Math.min(100, (progressXP / totalXPNeeded) * 100);
  }

  public getLevelReward(level: number): LevelReward | null {
    const levelRewards: LevelReward[] = [
      { level: 5, coins: 100, gems: 5, unlocks: ['shop_access'], title: 'Shopkeeper' },
      { level: 10, coins: 200, gems: 10, unlocks: ['powerup_purchase'], title: 'Power User' },
      { level: 15, coins: 300, gems: 15, unlocks: ['theme_customization'], title: 'Stylist' },
      { level: 20, coins: 500, gems: 20, unlocks: ['premium_features'], title: 'Premium Player' },
      { level: 25, coins: 750, gems: 30, unlocks: ['vip_shop'], title: 'VIP Member' },
      { level: 30, coins: 1000, gems: 50, unlocks: ['legendary_items'], title: 'Legend' }
    ];
    
    return levelRewards.find(reward => reward.level === level) || null;
  }

  public getDailyLoginReward(): { coins: number; gems: number } {
    const streak = this.currency.loginStreak;
    
    // Escalating daily rewards
    const baseCoins = 25;
    const baseGems = 2;
    
    const streakMultiplier = Math.min(streak, 30); // Max 30 days
    const coins = baseCoins + (streakMultiplier * 5);
    const gems = baseGems + Math.floor(streakMultiplier / 7); // Extra gem every 7 days
    
    return { coins, gems };
  }

  public claimDailyReward(): boolean {
    const today = new Date().toISOString().split('T')[0];
    
    if (this.currency.lastClaimDate === today) {
      return false; // Already claimed today
    }
    
    const reward = this.getDailyLoginReward();
    
    this.earnCurrency({
      type: 'login_bonus',
      amount: reward.coins,
      currency: 'coins',
      description: `Daily login reward (${this.currency.loginStreak} days)`
    });
    
    this.earnCurrency({
      type: 'login_bonus',
      amount: reward.gems,
      currency: 'gems',
      description: `Daily login bonus gems`
    });
    
    return true;
  }

  // Event listeners
  public addListener(listener: (currency: CurrencyData) => void): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: (currency: CurrencyData) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Admin/Debug methods
  public addCurrency(amount: number, type: 'coins' | 'gems' | 'xp'): void {
    this.currency[type] += amount;
    this.currency.totalEarned[type] += amount;
    
    if (type === 'xp') {
      this.checkLevelUp();
    }
    
    this.saveCurrencyData();
  }

  public resetCurrency(): void {
    this.currency = this.initializeDefaultCurrency();
    this.saveCurrencyData();
  }
} 