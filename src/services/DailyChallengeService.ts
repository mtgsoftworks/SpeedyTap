export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'score' | 'accuracy' | 'speed' | 'survival' | 'combo';
  target: number;
  reward: {
    points: number;
    badge?: string;
  };
  date: string; // YYYY-MM-DD format
  completed: boolean;
  progress: number;
  timeLimit?: number; // seconds, optional
}

export interface DailyChallengeProgress {
  challengeId: string;
  progress: number;
  completed: boolean;
  completedAt?: number;
  attempts: number;
  bestScore?: number;
}

export class DailyChallengeService {
  private static instance: DailyChallengeService;
  private challenges: Map<string, DailyChallenge> = new Map();
  private progress: Map<string, DailyChallengeProgress> = new Map();
  private storageKey = 'speedytap_daily_challenges';
  private progressKey = 'speedytap_challenge_progress';

  static getInstance(): DailyChallengeService {
    if (!DailyChallengeService.instance) {
      DailyChallengeService.instance = new DailyChallengeService();
    }
    return DailyChallengeService.instance;
  }

  constructor() {
    this.loadFromStorage();
    this.generateTodaysChallenge();
  }

  private loadFromStorage(): void {
    try {
      const savedChallenges = localStorage.getItem(this.storageKey);
      const savedProgress = localStorage.getItem(this.progressKey);
      
      if (savedChallenges) {
        const challengeData = JSON.parse(savedChallenges);
        Object.entries(challengeData).forEach(([key, value]) => {
          this.challenges.set(key, value as DailyChallenge);
        });
      }
      
      if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        Object.entries(progressData).forEach(([key, value]) => {
          this.progress.set(key, value as DailyChallengeProgress);
        });
      }
    } catch (error) {
      console.error('Daily challenge verilerini yüklerken hata:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const challengeData = Object.fromEntries(this.challenges);
      const progressData = Object.fromEntries(this.progress);
      
      localStorage.setItem(this.storageKey, JSON.stringify(challengeData));
      localStorage.setItem(this.progressKey, JSON.stringify(progressData));
    } catch (error) {
      console.error('Daily challenge verilerini kaydederken hata:', error);
    }
  }

  private getTodaysDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private generateTodaysChallenge(): void {
    const today = this.getTodaysDate();
    const todaysChallengeId = `daily_${today}`;
    
    // Eğer bugünün challenge'ı zaten varsa, oluşturma
    if (this.challenges.has(todaysChallengeId)) {
      return;
    }

    // Önceki günlerin challenge'larını temizle
    this.cleanOldChallenges();

    const challenge = this.createRandomChallenge(todaysChallengeId, today);
    this.challenges.set(todaysChallengeId, challenge);
    
    // Progress başlat
    this.progress.set(todaysChallengeId, {
      challengeId: todaysChallengeId,
      progress: 0,
      completed: false,
      attempts: 0
    });

    this.saveToStorage();
  }

  private cleanOldChallenges(): void {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Dünden önceki challenge'ları sil
    this.challenges.forEach((challenge, id) => {
      if (challenge.date < yesterdayStr) {
        this.challenges.delete(id);
        this.progress.delete(id);
      }
    });
  }

  private createRandomChallenge(id: string, date: string): DailyChallenge {
    const challengeTypes = [
      {
        type: 'score' as const,
        title: 'Skor Ustası',
        description: 'Tek oyunda {target} puan topla',
        icon: '🎯',
        targets: [5000, 7500, 10000, 12500, 15000],
        difficulty: ['easy', 'easy', 'medium', 'hard', 'hard'] as const,
        rewards: [100, 150, 200, 300, 400]
      },
      {
        type: 'accuracy' as const,
        title: 'Hassas Nişancı',
        description: '%{target} isabet oranı ile oyun bitir',
        icon: '🎪',
        targets: [85, 90, 95, 98, 99],
        difficulty: ['easy', 'medium', 'hard', 'hard', 'hard'] as const,
        rewards: [120, 180, 250, 350, 500]
      },
      {
        type: 'combo' as const,
        title: 'Kombo Kralı',
        description: '{target} kombo yap',
        icon: '🔥',
        targets: [20, 30, 50, 75, 100],
        difficulty: ['easy', 'medium', 'medium', 'hard', 'hard'] as const,
        rewards: [100, 150, 200, 300, 400]
      },
      {
        type: 'speed' as const,
        title: 'Hız Şampiyonu',
        description: '{target} saniyede 100 puan topla',
        icon: '⚡',
        targets: [60, 45, 30, 20, 15],
        difficulty: ['easy', 'medium', 'hard', 'hard', 'hard'] as const,
        rewards: [120, 180, 250, 350, 500]
      },
      {
        type: 'survival' as const,
        title: 'Hayatta Kalma',
        description: '{target} level hayatta kal',
        icon: '⚔️',
        targets: [15, 20, 25, 30, 40],
        difficulty: ['easy', 'medium', 'medium', 'hard', 'hard'] as const,
        rewards: [150, 200, 300, 400, 600]
      }
    ];

    // Rastgele challenge tipi seç
    const challengeTemplate = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
    
    // Rastgele zorluk seviyesi seç
    const difficultyIndex = Math.floor(Math.random() * challengeTemplate.targets.length);
    const target = challengeTemplate.targets[difficultyIndex];
    const difficulty = challengeTemplate.difficulty[difficultyIndex];
    const points = challengeTemplate.rewards[difficultyIndex];

    return {
      id,
      title: challengeTemplate.title,
      description: challengeTemplate.description.replace('{target}', target.toString()),
      icon: challengeTemplate.icon,
      difficulty,
      type: challengeTemplate.type,
      target,
      reward: {
        points,
        badge: difficulty === 'hard' ? '💎' : difficulty === 'medium' ? '⭐' : '🏅'
      },
      date,
      completed: false,
      progress: 0,
      timeLimit: challengeTemplate.type === 'speed' ? 300 : undefined // 5 dakika limit hız challengeları için
    };
  }

  getTodaysChallenge(): DailyChallenge | null {
    const today = this.getTodaysDate();
    const todaysChallengeId = `daily_${today}`;
    return this.challenges.get(todaysChallengeId) || null;
  }

  getAllActiveChallenges(): DailyChallenge[] {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    return Array.from(this.challenges.values()).filter(
      challenge => challenge.date >= yesterdayStr
    );
  }

  getChallengeProgress(challengeId: string): DailyChallengeProgress | null {
    return this.progress.get(challengeId) || null;
  }

  updateProgress(challengeId: string, gameStats: {
    score: number;
    accuracy: number;
    maxCombo: number;
    level: number;
    timeElapsed: number;
  }): boolean {
    const challenge = this.challenges.get(challengeId);
    const progress = this.progress.get(challengeId);
    
    if (!challenge || !progress || progress.completed) {
      return false;
    }

    let newProgress = progress.progress;
    let completed = false;

    switch (challenge.type) {
      case 'score':
        newProgress = Math.max(newProgress, gameStats.score);
        completed = newProgress >= challenge.target;
        break;
        
      case 'accuracy':
        newProgress = Math.max(newProgress, gameStats.accuracy);
        completed = newProgress >= challenge.target;
        break;
        
      case 'combo':
        newProgress = Math.max(newProgress, gameStats.maxCombo);
        completed = newProgress >= challenge.target;
        break;
        
      case 'speed':
        if (gameStats.score >= 100) {
          const timeToHundred = gameStats.timeElapsed / 1000; // milisaniyeden saniyeye
          if (timeToHundred <= challenge.target) {
            newProgress = challenge.target;
            completed = true;
          } else {
            newProgress = Math.max(newProgress, Math.max(0, challenge.target - timeToHundred));
          }
        }
        break;
        
      case 'survival':
        newProgress = Math.max(newProgress, gameStats.level);
        completed = newProgress >= challenge.target;
        break;
    }

    // Progress güncelle
    const updatedProgress: DailyChallengeProgress = {
      ...progress,
      progress: newProgress,
      completed,
      attempts: progress.attempts + 1,
      bestScore: Math.max(progress.bestScore || 0, gameStats.score),
      completedAt: completed ? Date.now() : progress.completedAt
    };

    this.progress.set(challengeId, updatedProgress);

    // Challenge'ı da güncelle
    const updatedChallenge = {
      ...challenge,
      progress: newProgress,
      completed
    };
    
    this.challenges.set(challengeId, updatedChallenge);

    this.saveToStorage();

    return completed && !progress.completed; // Yeni tamamlanan mı?
  }

  getCompletedChallengesCount(): number {
    return Array.from(this.progress.values()).filter(p => p.completed).length;
  }

  getTotalPointsEarned(): number {
    let total = 0;
    this.progress.forEach((progress, challengeId) => {
      if (progress.completed) {
        const challenge = this.challenges.get(challengeId);
        if (challenge) {
          total += challenge.reward.points;
        }
      }
    });
    return total;
  }

  getStreakDays(): number {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) { // Son 30 günü kontrol et
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const challengeId = `daily_${dateStr}`;
      
      const progress = this.progress.get(challengeId);
      if (progress && progress.completed) {
        streak++;
      } else if (i > 0) { // Bugün henüz tamamlanmamışsa streak'i bozma
        break;
      }
    }
    
    return streak;
  }

  // Oyun sonunda challenge progressini kontrol et
  checkChallengeCompletion(gameStats: {
    score: number;
    accuracy: number;
    maxCombo: number;
    level: number;
    timeElapsed: number;
  }): { completed: DailyChallenge[]; newProgress: { challenge: DailyChallenge; progress: number }[] } {
    const completed: DailyChallenge[] = [];
    const newProgress: { challenge: DailyChallenge; progress: number }[] = [];

    this.getAllActiveChallenges().forEach(challenge => {
      const wasCompleted = this.updateProgress(challenge.id, gameStats);
      if (wasCompleted) {
        completed.push(challenge);
      } else {
        const currentProgress = this.getChallengeProgress(challenge.id);
        if (currentProgress) {
          newProgress.push({
            challenge,
            progress: currentProgress.progress
          });
        }
      }
    });

    return { completed, newProgress };
  }
}

export default DailyChallengeService; 