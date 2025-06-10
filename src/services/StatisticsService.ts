export interface GameStatistics {
  // Genel istatistikler
  totalGamesPlayed: number;
  totalTimePlayed: number; // milliseconds
  totalTaps: number;
  totalScore: number;
  highScore: number;
  averageScore: number;
  
  // Level & Progression
  currentLevel: number;
  maxLevelReached: number;
  totalLevelsCompleted: number;
  
  // Combo & Streak
  maxCombo: number;
  totalCombos: number;
  averageCombo: number;
  comboBreaks: number;
  perfectStreaks: number; // Hiç combo kırmadan tamamlanan oyunlar
  
  // Tap Accuracy
  totalHits: number;
  totalMisses: number;
  accuracy: number; // percentage
  fastestTap: number; // milliseconds
  averageTapSpeed: number;
  
  // Time & Performance
  bestTimePerLevel: Record<number, number>; // level -> best time
  averageTimePerLevel: Record<number, number>;
  totalTimeInGame: number;
  longestSession: number;
  
  // Power-ups
  powerUpsUsed: Record<string, number>; // powerup type -> count
  favoritePoweUp: string;
  powerUpEffectiveness: Record<string, number>; // powerup -> avg score boost
  
  // Daily & Weekly
  dailyStats: DailyStats;
  weeklyStats: WeeklyStats;
  monthlyStats: MonthlyStats;
  
  // Achievements
  achievementsUnlocked: string[];
  totalAchievementPoints: number;
  
  // Misc
  firstPlayDate: number;
  lastPlayDate: number;
  consecutiveDays: number;
  favoriteTheme: string;
  themesUnlocked: string[];
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
  totalTaps: number;
  totalTime: number;
  maxCombo: number;
  powerUpsUsed: number;
}

export interface WeeklyStats {
  weekStart: string; // YYYY-MM-DD
  totalGames: number;
  totalScore: number;
  bestDaily: number;
  averageDaily: number;
  totalTime: number;
  improvement: number; // vs previous week
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  totalGames: number;
  totalScore: number;
  bestScore: number;
  totalTime: number;
  averageAccuracy: number;
  levelsCompleted: number;
  achievementsEarned: number;
}

export interface SessionStats {
  sessionId: string;
  startTime: number;
  endTime: number;
  gamesPlayed: number;
  bestScore: number;
  totalScore: number;
  maxCombo: number;
  accuracy: number;
  powerUpsUsed: number;
}

export interface GameSession {
  gameId: string;
  startTime: number;
  endTime: number;
  score: number;
  level: number;
  maxCombo: number;
  totalTaps: number;
  hits: number;
  misses: number;
  powerUpsUsed: string[];
  theme: string;
}

export class StatisticsService {
  private static instance: StatisticsService;
  private stats!: GameStatistics;
  private currentSession: SessionStats | null = null;
  private currentGame: GameSession | null = null;
  private listeners: ((stats: GameStatistics) => void)[] = [];

  public static getInstance(): StatisticsService {
    if (!StatisticsService.instance) {
      StatisticsService.instance = new StatisticsService();
    }
    return StatisticsService.instance;
  }

  constructor() {
    this.loadStatistics();
  }

  private initializeDefaultStats(): GameStatistics {
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];
    
    return {
      totalGamesPlayed: 0,
      totalTimePlayed: 0,
      totalTaps: 0,
      totalScore: 0,
      highScore: 0,
      averageScore: 0,
      
      currentLevel: 1,
      maxLevelReached: 1,
      totalLevelsCompleted: 0,
      
      maxCombo: 0,
      totalCombos: 0,
      averageCombo: 0,
      comboBreaks: 0,
      perfectStreaks: 0,
      
      totalHits: 0,
      totalMisses: 0,
      accuracy: 100,
      fastestTap: Infinity,
      averageTapSpeed: 0,
      
      bestTimePerLevel: {},
      averageTimePerLevel: {},
      totalTimeInGame: 0,
      longestSession: 0,
      
      powerUpsUsed: {},
      favoritePoweUp: '',
      powerUpEffectiveness: {},
      
      dailyStats: {
        date: today,
        gamesPlayed: 0,
        totalScore: 0,
        bestScore: 0,
        totalTaps: 0,
        totalTime: 0,
        maxCombo: 0,
        powerUpsUsed: 0
      },
      
      weeklyStats: {
        weekStart: this.getWeekStart(today),
        totalGames: 0,
        totalScore: 0,
        bestDaily: 0,
        averageDaily: 0,
        totalTime: 0,
        improvement: 0
      },
      
      monthlyStats: {
        month: today.substring(0, 7), // YYYY-MM
        totalGames: 0,
        totalScore: 0,
        bestScore: 0,
        totalTime: 0,
        averageAccuracy: 100,
        levelsCompleted: 0,
        achievementsEarned: 0
      },
      
      achievementsUnlocked: [],
      totalAchievementPoints: 0,
      
      firstPlayDate: now,
      lastPlayDate: now,
      consecutiveDays: 1,
      favoriteTheme: 'default',
      themesUnlocked: ['default']
    };
  }

  // Session Management
  startSession(): void {
    this.currentSession = {
      sessionId: `session_${Date.now()}`,
      startTime: Date.now(),
      endTime: 0,
      gamesPlayed: 0,
      bestScore: 0,
      totalScore: 0,
      maxCombo: 0,
      accuracy: 100,
      powerUpsUsed: 0
    };
  }

  endSession(): SessionStats | null {
    if (!this.currentSession) return null;
    
    this.currentSession.endTime = Date.now();
    
    // Session süresini güncelle
    const sessionDuration = this.currentSession.endTime - this.currentSession.startTime;
    if (sessionDuration > this.stats.longestSession) {
      this.stats.longestSession = sessionDuration;
    }
    
    const session = { ...this.currentSession };
    this.currentSession = null;
    
    this.saveStatistics();
    return session;
  }

  // Game Management
  startGame(level: number, theme: string): void {
    this.currentGame = {
      gameId: `game_${Date.now()}`,
      startTime: Date.now(),
      endTime: 0,
      score: 0,
      level,
      maxCombo: 0,
      totalTaps: 0,
      hits: 0,
      misses: 0,
      powerUpsUsed: [],
      theme
    };
    
    // Session stats güncelle
    if (this.currentSession) {
      this.currentSession.gamesPlayed++;
    }
  }

  endGame(finalScore: number, maxCombo: number, totalTaps: number, hits: number, misses: number): void {
    if (!this.currentGame) return;
    
    this.currentGame.endTime = Date.now();
    this.currentGame.score = finalScore;
    this.currentGame.maxCombo = maxCombo;
    this.currentGame.totalTaps = totalTaps;
    this.currentGame.hits = hits;
    this.currentGame.misses = misses;
    
    // İstatistikleri güncelle
    this.updateStatistics(this.currentGame);
    
    this.currentGame = null;
    this.saveStatistics();
    this.notifyListeners();
  }

  private updateStatistics(game: GameSession): void {
    const gameTime = game.endTime - game.startTime;
    const accuracy = game.totalTaps > 0 ? (game.hits / game.totalTaps) * 100 : 100;
    
    // Genel stats
    this.stats.totalGamesPlayed++;
    this.stats.totalTimePlayed += gameTime;
    this.stats.totalTaps += game.totalTaps;
    this.stats.totalScore += game.score;
    this.stats.totalHits += game.hits;
    this.stats.totalMisses += game.misses;
    
    // High score
    if (game.score > this.stats.highScore) {
      this.stats.highScore = game.score;
    }
    
    // Average score
    this.stats.averageScore = Math.round(this.stats.totalScore / this.stats.totalGamesPlayed);
    
    // Max combo
    if (game.maxCombo > this.stats.maxCombo) {
      this.stats.maxCombo = game.maxCombo;
    }
    
    // Combo stats
    if (game.maxCombo > 0) {
      this.stats.totalCombos += game.maxCombo;
      this.stats.averageCombo = Math.round(this.stats.totalCombos / this.stats.totalGamesPlayed);
    }
    
    // Accuracy
    this.stats.accuracy = this.stats.totalTaps > 0 ? 
      Math.round((this.stats.totalHits / this.stats.totalTaps) * 100) : 100;
    
    // Level progression
    if (game.level > this.stats.maxLevelReached) {
      this.stats.maxLevelReached = game.level;
    }
    
    // Best time per level
    if (!this.stats.bestTimePerLevel[game.level] || gameTime < this.stats.bestTimePerLevel[game.level]) {
      this.stats.bestTimePerLevel[game.level] = gameTime;
    }
    
    // Average time per level
    if (!this.stats.averageTimePerLevel[game.level]) {
      this.stats.averageTimePerLevel[game.level] = gameTime;
    } else {
      this.stats.averageTimePerLevel[game.level] = 
        (this.stats.averageTimePerLevel[game.level] + gameTime) / 2;
    }
    
    // Theme tracking
    if (game.theme) {
      this.stats.favoriteTheme = game.theme; // Son kullanılan tema
      if (!this.stats.themesUnlocked.includes(game.theme)) {
        this.stats.themesUnlocked.push(game.theme);
      }
    }
    
    // Session stats güncelle
    if (this.currentSession) {
      this.currentSession.totalScore += game.score;
      if (game.score > this.currentSession.bestScore) {
        this.currentSession.bestScore = game.score;
      }
      if (game.maxCombo > this.currentSession.maxCombo) {
        this.currentSession.maxCombo = game.maxCombo;
      }
      this.currentSession.accuracy = accuracy;
      this.currentSession.powerUpsUsed += game.powerUpsUsed.length;
    }
    
    // Daily stats güncelle
    this.updateDailyStats(game, gameTime, accuracy);
    
    // Weekly ve monthly stats güncelle
    this.updateWeeklyStats(game);
    this.updateMonthlyStats(game, gameTime, accuracy);
    
    // Play dates güncelle
    this.stats.lastPlayDate = Date.now();
    this.updateConsecutiveDays();
  }

  private updateDailyStats(game: GameSession, gameTime: number, _accuracy: number): void {
    const today = new Date().toISOString().split('T')[0];
    
    // Yeni gün kontrolü
    if (this.stats.dailyStats.date !== today) {
      this.stats.dailyStats = {
        date: today,
        gamesPlayed: 0,
        totalScore: 0,
        bestScore: 0,
        totalTaps: 0,
        totalTime: 0,
        maxCombo: 0,
        powerUpsUsed: 0
      };
    }
    
    this.stats.dailyStats.gamesPlayed++;
    this.stats.dailyStats.totalScore += game.score;
    this.stats.dailyStats.totalTaps += game.totalTaps;
    this.stats.dailyStats.totalTime += gameTime;
    this.stats.dailyStats.powerUpsUsed += game.powerUpsUsed.length;
    
    if (game.score > this.stats.dailyStats.bestScore) {
      this.stats.dailyStats.bestScore = game.score;
    }
    
    if (game.maxCombo > this.stats.dailyStats.maxCombo) {
      this.stats.dailyStats.maxCombo = game.maxCombo;
    }
  }

  private updateWeeklyStats(game: GameSession): void {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = this.getWeekStart(today);
    
    // Yeni hafta kontrolü
    if (this.stats.weeklyStats.weekStart !== weekStart) {
      this.stats.weeklyStats = {
        weekStart,
        totalGames: 0,
        totalScore: 0,
        bestDaily: 0,
        averageDaily: 0,
        totalTime: 0,
        improvement: 0
      };
    }
    
    this.stats.weeklyStats.totalGames++;
    this.stats.weeklyStats.totalScore += game.score;
    
    if (game.score > this.stats.weeklyStats.bestDaily) {
      this.stats.weeklyStats.bestDaily = game.score;
    }
    
    this.stats.weeklyStats.averageDaily = Math.round(
      this.stats.weeklyStats.totalScore / this.stats.weeklyStats.totalGames
    );
  }

  private updateMonthlyStats(game: GameSession, gameTime: number, accuracy: number): void {
    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);
    
    // Yeni ay kontrolü
    if (this.stats.monthlyStats.month !== month) {
      this.stats.monthlyStats = {
        month,
        totalGames: 0,
        totalScore: 0,
        bestScore: 0,
        totalTime: 0,
        averageAccuracy: 100,
        levelsCompleted: 0,
        achievementsEarned: 0
      };
    }
    
    this.stats.monthlyStats.totalGames++;
    this.stats.monthlyStats.totalScore += game.score;
    this.stats.monthlyStats.totalTime += gameTime;
    
    if (game.score > this.stats.monthlyStats.bestScore) {
      this.stats.monthlyStats.bestScore = game.score;
    }
    
    // Accuracy ortalaması güncelle
    this.stats.monthlyStats.averageAccuracy = 
      (this.stats.monthlyStats.averageAccuracy + accuracy) / 2;
  }

  private updateConsecutiveDays(): void {
    const today = new Date();
    const lastPlay = new Date(this.stats.lastPlayDate);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Aynı gün içinde oynama
    if (this.isSameDay(today, lastPlay)) {
      return;
    }
    
    // Dün oynandı mı
    if (this.isSameDay(yesterday, lastPlay)) {
      this.stats.consecutiveDays++;
    } else {
      // Streak kırıldı
      this.stats.consecutiveDays = 1;
    }
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  private getWeekStart(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  }

  // Power-up tracking
  recordPowerUpUsage(powerUpType: string, effectivenessScore: number): void {
    // Count tracking
    if (!this.stats.powerUpsUsed[powerUpType]) {
      this.stats.powerUpsUsed[powerUpType] = 0;
    }
    this.stats.powerUpsUsed[powerUpType]++;
    
    // Effectiveness tracking
    if (!this.stats.powerUpEffectiveness[powerUpType]) {
      this.stats.powerUpEffectiveness[powerUpType] = effectivenessScore;
    } else {
      this.stats.powerUpEffectiveness[powerUpType] = 
        (this.stats.powerUpEffectiveness[powerUpType] + effectivenessScore) / 2;
    }
    
    // Favorite power-up güncelle
    const mostUsed = Object.entries(this.stats.powerUpsUsed)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostUsed) {
      this.stats.favoritePoweUp = mostUsed[0];
    }
    
    // Current game'e ekle
    if (this.currentGame) {
      this.currentGame.powerUpsUsed.push(powerUpType);
    }
  }

  // Tap timing
  recordTapTiming(responseTime: number): void {
    if (responseTime < this.stats.fastestTap) {
      this.stats.fastestTap = responseTime;
    }
    
    // Average tap speed güncelle (basit moving average)
    if (this.stats.averageTapSpeed === 0) {
      this.stats.averageTapSpeed = responseTime;
    } else {
      this.stats.averageTapSpeed = (this.stats.averageTapSpeed + responseTime) / 2;
    }
  }

  // Level completion
  recordLevelCompletion(level: number, timeElapsed: number): void {
    this.stats.totalLevelsCompleted++;
    this.stats.monthlyStats.levelsCompleted++;
    
    // Best time güncelle
    if (!this.stats.bestTimePerLevel[level] || timeElapsed < this.stats.bestTimePerLevel[level]) {
      this.stats.bestTimePerLevel[level] = timeElapsed;
    }
  }

  // Perfect streak (hiç combo kırmadan oyun tamamlama)
  recordPerfectStreak(): void {
    this.stats.perfectStreaks++;
  }

  // Combo break
  recordComboBreak(): void {
    this.stats.comboBreaks++;
  }

  // Achievement unlocking
  unlockAchievement(achievementId: string, points: number): void {
    if (!this.stats.achievementsUnlocked.includes(achievementId)) {
      this.stats.achievementsUnlocked.push(achievementId);
      this.stats.totalAchievementPoints += points;
      this.stats.monthlyStats.achievementsEarned++;
    }
  }

  // Public getters
  getStatistics(): GameStatistics {
    return { ...this.stats };
  }

  getCurrentSession(): SessionStats | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  getDailyStats(): DailyStats {
    return { ...this.stats.dailyStats };
  }

  getWeeklyStats(): WeeklyStats {
    return { ...this.stats.weeklyStats };
  }

  getMonthlyStats(): MonthlyStats {
    return { ...this.stats.monthlyStats };
  }

  // Analytics
  getPlayTimeToday(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.stats.dailyStats.date === today ? this.stats.dailyStats.totalTime : 0;
  }

  getAverageSessionLength(): number {
    return this.stats.totalGamesPlayed > 0 ? 
      this.stats.totalTimePlayed / this.stats.totalGamesPlayed : 0;
  }

  getTapsPerMinute(): number {
    const totalMinutes = this.stats.totalTimePlayed / (1000 * 60);
    return totalMinutes > 0 ? this.stats.totalTaps / totalMinutes : 0;
  }

  getImprovementTrend(): number {
    // Son 10 oyunun ortalaması vs önceki 10 oyun
    // Şimdilik basit hesaplama
    return this.stats.weeklyStats.improvement;
  }

  // Milestones
  getMilestones(): { [key: string]: boolean } {
    return {
      'first_game': this.stats.totalGamesPlayed >= 1,
      'score_1000': this.stats.highScore >= 1000,
      'score_5000': this.stats.highScore >= 5000,
      'score_10000': this.stats.highScore >= 10000,
      'combo_10': this.stats.maxCombo >= 10,
      'combo_25': this.stats.maxCombo >= 25,
      'combo_50': this.stats.maxCombo >= 50,
      'combo_100': this.stats.maxCombo >= 100,
      'level_5': this.stats.maxLevelReached >= 5,
      'level_10': this.stats.maxLevelReached >= 10,
      'level_20': this.stats.maxLevelReached >= 20,
      'games_10': this.stats.totalGamesPlayed >= 10,
      'games_50': this.stats.totalGamesPlayed >= 50,
      'games_100': this.stats.totalGamesPlayed >= 100,
      'accuracy_90': this.stats.accuracy >= 90,
      'accuracy_95': this.stats.accuracy >= 95,
      'consecutive_7': this.stats.consecutiveDays >= 7,
      'consecutive_30': this.stats.consecutiveDays >= 30,
      'perfect_streak': this.stats.perfectStreaks >= 1
    };
  }

  // Event listeners
  onStatsUpdate(callback: (stats: GameStatistics) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.stats));
  }

  // Persistence
  private saveStatistics(): void {
    try {
      localStorage.setItem('speedytap_statistics', JSON.stringify(this.stats));
    } catch (error) {
      console.warn('Failed to save statistics:', error);
    }
  }

  private loadStatistics(): void {
    try {
      const saved = localStorage.getItem('speedytap_statistics');
      if (saved) {
        this.stats = { ...this.initializeDefaultStats(), ...JSON.parse(saved) };
      } else {
        this.stats = this.initializeDefaultStats();
      }
    } catch (error) {
      console.warn('Failed to load statistics:', error);
      this.stats = this.initializeDefaultStats();
    }
  }

  // Reset/Export
  resetStatistics(): void {
    this.stats = this.initializeDefaultStats();
    this.saveStatistics();
    this.notifyListeners();
  }

  exportStatistics(): string {
    return JSON.stringify(this.stats, null, 2);
  }

  importStatistics(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      this.stats = { ...this.initializeDefaultStats(), ...imported };
      this.saveStatistics();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.warn('Failed to import statistics:', error);
      return false;
    }
  }
} 