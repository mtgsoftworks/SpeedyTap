// Game Screens - Rule 1: Screen components in designated folder
// Orijinal oyun işleyişini koruyarak modern mimariye uyarlama

import { GameState, LevelConfig, Circle, PageType, UserStats } from '@/types';
import { PAGES, GAME_CONFIG, AUDIO_FILES, CSS_CLASSES } from '@/constants';
import { APP_CONFIG } from '@/config';
import { generateRandomNumber, generateRandomPosition, getElementSize, addCSSAnimation, vibrate, adMobService, AchievementsManager, DeltaTimer, GameLoop, PerformanceMonitor, WebPerformance, LanguageManager } from '@/utils';
import { loadHighScore, saveHighScore, updateUserStats, loadUserStats } from '@/utils/storage';
import { audioManager } from '@/assets';

export class GameScreenManager {
  private container: HTMLElement;
  private isInitialized = false;
  private achievementsManager: AchievementsManager;
  private gameStartTime: number = 0;
  private currentStreak: number = 0;
  private totalTaps: number = 0;
  private accurateHits: number = 0;
  private missedHits: number = 0;

  // Web-Optimized Performance Components
  private gameLoop: GameLoop;
  private gameTimer: DeltaTimer | null = null;
  private performanceMonitor: PerformanceMonitor;
  private endingSound = false;

  // Game Engine Properties (orijinal mantığı koruyarak)
  private gameState: GameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    level: 1,
    timeLeft: 0,
    tapCount: 0,
    highScore: 0
  };

  private levelConfig: LevelConfig = {
    levelNum: 1,
    time: 7,
    tapValue: 3,
    tapsGoal: 5,
    goodCirclesCount: 1,
    evilCirclesCount: 4
  };

  private circles: Circle[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.achievementsManager = AchievementsManager.getInstance();
    this.gameLoop = GameLoop.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
  }

    public async initialize(): Promise<void> {
    console.log('🎮 ' + LanguageManager.t('debug.gameScreenManagerInitializing') + '...');

    try {
      // Initialize game event listeners
      this.initializeEventListeners();

      // Load high score
      this.gameState.highScore = loadHighScore();

      // Audio manager already initialized via import
      console.log('🔊 ' + LanguageManager.t('debug.audioManagerReady'));

      // Initialize AdMob and prepare first interstitial
      await this.initializeAds();

      // Initialize web performance optimizations
      this.initializeWebPerformance();

      this.isInitialized = true;
      console.log('✅ ' + LanguageManager.t('debug.gameScreenManagerReady') + '!');

    } catch (error) {
      console.error('❌ Game Screen Manager başlatılamadı:', error);
      throw error;
    }
  }

    private initializeWebPerformance(): void {
    // Check device performance and adjust settings
    const isHighPerf = WebPerformance.isHighPerformanceDevice();
    const perfLevel = isHighPerf ? LanguageManager.t('debug.high') : LanguageManager.t('debug.standard');
    console.log(`📱 ${LanguageManager.t('debug.devicePerformance')}: ${perfLevel}`);

    // Enable performance monitor in debug mode
    if (APP_CONFIG.PERFORMANCE.ENABLE_PERFORMANCE_MONITOR) {
      this.performanceMonitor.show();
      console.log('📊 ' + LanguageManager.t('debug.performanceMonitorEnabled'));
    }

    // Start optimized game loop
    this.gameLoop.start();
    console.log('🎮 ' + LanguageManager.t('debug.optimizedGameLoopStarted'));
  }

  private async initializeAds(): Promise<void> {
    try {
      // Wait for AdMob service to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Prepare first interstitial ad
      await adMobService.prepareInterstitialAd();
      
      // Show menu banner ad
      await adMobService.showMenuBannerAd();
      
      console.log('🎯 ' + LanguageManager.t('debug.adMobAdsPrepared'));
    } catch (error) {
      console.warn('⚠️ AdMob reklamları hazırlanamadı:', error);
    }
  }

  private initializeEventListeners(): void {
    // New Game Button
    const newGameBtn = this.container.querySelector('#newGameBtn');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => this.startNewGame());
      newGameBtn.addEventListener('touchstart', () => this.startNewGame());
    }

    // Tutorial Start Button (handled by SpeedyTapApp navigation)
    // No need to add listeners here as it's handled in navigation/index.ts

    // Pause Button
    const gmStatsPauseBtn = this.container.querySelector('#gmStatsPauseBtn');
    if (gmStatsPauseBtn) {
      gmStatsPauseBtn.addEventListener('click', () => this.pauseGame());
      gmStatsPauseBtn.addEventListener('touchstart', () => this.pauseGame());
    }

    // Resume Button
    const pmCntnuGmBtn = this.container.querySelector('#pmCntnuGmBtn');
    if (pmCntnuGmBtn) {
      pmCntnuGmBtn.addEventListener('click', () => this.resumeGame());
      pmCntnuGmBtn.addEventListener('touchstart', () => this.resumeGame());
    }

    // Restart Button
    const pmRstrtLvlBtn = this.container.querySelector('#pmRstrtLvlBtn');
    if (pmRstrtLvlBtn) {
      pmRstrtLvlBtn.addEventListener('click', () => this.goToMainMenu().catch(console.error));
      pmRstrtLvlBtn.addEventListener('touchstart', () => this.goToMainMenu().catch(console.error));
    }

    // Continue to Next Level
    const lvlPssdContinueNextLvlBtn = this.container.querySelector('#lvlPssdContinueNextLvlBtn');
    if (lvlPssdContinueNextLvlBtn) {
      lvlPssdContinueNextLvlBtn.addEventListener('click', () => this.continueToNextLevel());
      lvlPssdContinueNextLvlBtn.addEventListener('touchstart', () => this.continueToNextLevel());
    }

    // Try Again Button
    const lvlLostTryAgainBtn = this.container.querySelector('#lvlLostTryAgainBtn');
    if (lvlLostTryAgainBtn) {
      lvlLostTryAgainBtn.addEventListener('click', () => this.tryAgain());
      lvlLostTryAgainBtn.addEventListener('touchstart', () => this.tryAgain());
    }

    // About Back Button
    const abtPageBackBtn = this.container.querySelector('#abtPageBackBtn');
    if (abtPageBackBtn) {
      abtPageBackBtn.addEventListener('click', () => this.showPage(PAGES.GAME_MENU));
      abtPageBackBtn.addEventListener('touchstart', () => this.showPage(PAGES.GAME_MENU));
    }

    // About Button
    const aboutBtn = this.container.querySelector('#aboutBtn');
    if (aboutBtn) {
      aboutBtn.addEventListener('click', () => this.showPage(PAGES.ABOUT));
      aboutBtn.addEventListener('touchstart', () => this.showPage(PAGES.ABOUT));
    }
  }

  private showPage(page: PageType): void {
    // Hide all pages
    const allPages = this.container.querySelectorAll('.page-cont');
    allPages.forEach(pageElement => {
      (pageElement as HTMLElement).style.display = 'none';
    });

    // Show target page
    const targetPage = this.container.querySelector(`#page-${page}`);
    if (targetPage) {
      (targetPage as HTMLElement).style.display = 'block';
    }
  }

  private startNewGame(): void {
    console.log('🎯 ' + LanguageManager.t('debug.newGameStarting') + '...');
    
    // Play button sound
    audioManager.play('buttonTap');
    
    // Reset game state
    this.resetGame();
    
    // Show tutorial first
    this.showPage(PAGES.TUTORIAL);
  }

  public startGameFromTutorial(): void {
    console.log('🚀 ' + LanguageManager.t('debug.gameStartingFromTutorial') + '...');
    
    try {
      // Play button sound
      audioManager.play('buttonTap');
      
      // Hide menu banner ad during gameplay
      adMobService.hideMenuBannerAd();
      
      console.log(`📄 ${LanguageManager.t('debug.currentPage')}: ${PAGES.PLAY_DELAY}'e geçiliyor`);
      
      // Show countdown
      this.showPage(PAGES.PLAY_DELAY);
      
      console.log('⏱️ ' + LanguageManager.t('debug.countdownStarting') + '...');
      this.startCountdown();
      
    } catch (error) {
      console.error('❌ startGameFromTutorial hatası:', error);
    }
  }

  private startCountdown(): void {
    const playDelayNum = this.container.querySelector('#playDelayNum') as HTMLElement;
    
    if (!playDelayNum) {
      console.error('❌ Countdown elementi bulunamadı! ID: #playDelayNum');
      return;
    }

    console.log('🎯 ' + LanguageManager.t('debug.countdownElementFound') + '...');
    
    let count = 3;
    playDelayNum.innerHTML = count.toString();
    
    addCSSAnimation(playDelayNum, 'grow-animation');
    
    const countdownInterval = setInterval(() => {
      if (count > 1) {
        console.log(`⏱️ ${LanguageManager.t('debug.countdown')}: ${count}`);
        audioManager.play('delayCount');
        count--;
        playDelayNum.innerHTML = count.toString();
        addCSSAnimation(playDelayNum, 'grow-animation');
              } else {
          console.log('🎮 ' + LanguageManager.t('debug.countdownCompleted'));
        clearInterval(countdownInterval);
        playDelayNum.innerHTML = '3';
        this.showPage(PAGES.PLAY_AREA);
        this.startLevel();
      }
    }, 500);
  }

  private resetGame(): void {
    this.gameState = {
      isPlaying: false,
      isPaused: false,
      score: 0,
      level: 1,
      timeLeft: 0,
      tapCount: 0,
      highScore: loadHighScore()
    };

    this.levelConfig = {
      levelNum: 1,
      time: 7,
      tapValue: 3,
      tapsGoal: 5,
      goodCirclesCount: 1,
      evilCirclesCount: 4
    };

    // Reset game session stats
    this.gameStartTime = Date.now();
    this.currentStreak = 0;
    this.totalTaps = 0;
    this.accurateHits = 0;
    this.missedHits = 0;

    this.updateUI();
  }

  private startLevel(): void {
    console.log(`🎮 ${LanguageManager.t('debug.levelStarting')} ${this.gameState.level}...`);
    
    this.gameState.isPlaying = true;
    this.gameState.isPaused = false;
    this.gameState.timeLeft = this.levelConfig.time;
    this.gameState.tapCount = 0;

    // Update UI
    this.updateUI();

    // Create circles
    this.createCircles();

    // Start timer
    this.startTimer();
  }

  private createCircles(): void {
    const gameSpace = this.container.querySelector('#gameSpace') as HTMLElement;
    if (!gameSpace) return;

    // Clear existing circles
    gameSpace.innerHTML = '';
    this.circles = [];

    // Create good circles
    for (let i = 0; i < this.levelConfig.goodCirclesCount; i++) {
      this.createCircle('good', gameSpace);
    }

    // Create evil circles
    for (let i = 0; i < this.levelConfig.evilCirclesCount; i++) {
      this.createCircle('evil', gameSpace);
    }
  }

  private createCircle(type: 'good' | 'evil', gameSpace: HTMLElement): void {
    const circle = document.createElement('div');
    const circleId = `circle_${Date.now()}_${Math.random()}`;
    
    circle.id = circleId;
    circle.className = type === 'good' 
      ? 'tpbl-circle c-blue good-circle' 
      : 'tpbl-circle c-red evil-circle';

    // Random position
    const gameSpaceSize = getElementSize(gameSpace);
    const circleSize = { width: 85, height: 85 }; // Updated for modern filled design
    const position = generateRandomPosition(gameSpaceSize, circleSize);
    
    circle.style.left = position.x + 'px';
    circle.style.top = position.y + 'px';

    // Event listeners
    const handleTap = () => {
      if (type === 'good') {
        this.handleGoodCircleTap();
      } else {
        this.handleEvilCircleTap();
      }
    };

    circle.addEventListener('click', handleTap);
    circle.addEventListener('touchstart', handleTap);

    gameSpace.appendChild(circle);

    // Add to circles array
    this.circles.push({
      id: circleId,
      x: position.x,
      y: position.y,
      type,
      element: circle
    });

    // Animation with delay
    setTimeout(() => {
      addCSSAnimation(circle, 'grow-animation');
      audioManager.play('circleAppear');
    }, this.circles.length * 50);
  }

  private handleGoodCircleTap(): void {
    this.gameState.tapCount++;
    this.gameState.score += this.levelConfig.tapValue;
    
    // Update achievement tracking stats
    this.totalTaps++;
    this.accurateHits++;
    this.currentStreak++;
    
    // Throttled UI update for better performance
    WebPerformance.throttle(() => this.updateUI(), 16)(); // ~60fps
    
    // Animation and sound - non-blocking
    requestAnimationFrame(() => {
      const tapCountElement = this.container.querySelector('#gmStatsCurrentTapCount') as HTMLElement;
      if (tapCountElement) {
        addCSSAnimation(tapCountElement, 'burst-animation');
      }
    });
    
    audioManager.play('touchBlue');
    vibrate(50);

    // Recreate circles with slight delay for better performance
    setTimeout(() => this.createCircles(), 16);

    // Check if level complete
    this.checkLevelComplete();
  }

  private handleEvilCircleTap(): void {
    console.log('💀 ' + LanguageManager.t('debug.badCircleTouched') + '!');
    
    // Update achievement tracking stats
    this.totalTaps++;
    this.missedHits++;
    this.currentStreak = 0; // Reset streak on wrong tap
    
    audioManager.play('touchRed');
    vibrate([100, 50, 100]);
    
    this.gameOver(LanguageManager.t("gameMessages.timeUp")).catch(console.error);
  }

  private checkLevelComplete(): void {
    if (this.gameState.tapCount >= this.levelConfig.tapsGoal) {
      this.levelPassed().catch(console.error);
    }
  }

  private async levelPassed(): Promise<void> {
    console.log('🎉 ' + LanguageManager.t('debug.levelPassed') + '!');
    
    this.stopTimer();
    this.gameState.isPlaying = false;
    
    // Calculate bonus
    const bonusScore = Math.round(this.gameState.timeLeft) * 10;
    this.gameState.score += bonusScore;

    // Update level passed page
    const lvlPssdTtl = this.container.querySelector('#lvlPssdTtl') as HTMLElement;
    const lvlPssdScore = this.container.querySelector('#lvlPssdScore') as HTMLElement;
    const lvlPssdBonusScore = this.container.querySelector('#lvlPssdBonusScore') as HTMLElement;

    if (lvlPssdTtl) lvlPssdTtl.innerHTML = `Seviye ${this.gameState.level}`;
    if (lvlPssdScore) lvlPssdScore.innerHTML = (this.gameState.score - bonusScore).toString();
    if (lvlPssdBonusScore) lvlPssdBonusScore.innerHTML = bonusScore > 0 ? `Bonus +${bonusScore}` : '';

    audioManager.play('levelPassed');
    this.showPage(PAGES.LEVEL_PASSED);

    // Show ad every 3 levels
    await adMobService.showLevelCompleteAd(this.gameState.level);
  }

  private continueToNextLevel(): void {
    // Play button sound
    audioManager.play('buttonTap');
    
    // Increase level
    this.gameState.level++;
    
    // Update level config (orijinal mantığı koruyarak)
    this.levelConfig = {
      levelNum: this.gameState.level,
      time: this.levelConfig.time + 1,
      tapValue: this.levelConfig.tapValue + 2,
      tapsGoal: this.levelConfig.tapsGoal + 1,
      goodCirclesCount: 1,
      evilCirclesCount: this.levelConfig.evilCirclesCount + 1
    };

    this.showPage(PAGES.PLAY_DELAY);
    this.startCountdown();
  }

  private async gameOver(reason: string): Promise<void> {
    console.log(`💀 ${LanguageManager.t('debug.gameOverReason')}: ${reason}`);
    
    this.stopTimer();
    this.gameState.isPlaying = false;

    // Save high score
    if (this.gameState.score > this.gameState.highScore) {
      this.gameState.highScore = this.gameState.score;
      saveHighScore(this.gameState.score);
    }

    // Update user statistics and check achievements
    await this.updateGameStats();

    // Update you lost page
    const lvlLostScore = this.container.querySelector('#lvlLostScore') as HTMLElement;
    const lvlLostBestScore = this.container.querySelector('#lvlLostBestScore') as HTMLElement;
    const lvlLostTtl = this.container.querySelector('#lvlLostTtl') as HTMLElement;

    if (lvlLostScore) lvlLostScore.innerHTML = this.gameState.score.toString();
    if (lvlLostBestScore) lvlLostBestScore.innerHTML = this.gameState.highScore.toString();
    if (lvlLostTtl) lvlLostTtl.innerHTML = reason;

    audioManager.play('levelLost');
    this.showPage(PAGES.YOU_LOST);

    // Show game over ad
    await adMobService.showGameOverAd();
  }

  private tryAgain(): void {
    audioManager.play('buttonTap');
    this.resetGame();
    this.showPage(PAGES.TUTORIAL);
  }

  private pauseGame(): void {
    if (this.gameState.isPlaying && !this.gameState.isPaused) {
      this.gameState.isPaused = true;
      
      // Pause optimized timer
      if (this.gameTimer) {
        this.gameTimer.pause();
      }
      
      // Update pause page
      const lvlPausedScore = this.container.querySelector('#lvlPausedScore') as HTMLElement;
      if (lvlPausedScore) lvlPausedScore.innerHTML = this.gameState.score.toString();
      
      audioManager.play('buttonTap');
      this.showPage(PAGES.PAUSE_MENU);
    }
  }

  private resumeGame(): void {
    if (this.gameState.isPaused) {
      this.gameState.isPaused = false;
      
      // Resume optimized timer
      if (this.gameTimer) {
        this.gameTimer.resume();
      }
      
      audioManager.play('buttonTap');
      this.showPage(PAGES.PLAY_AREA);
    }
  }

  private async goToMainMenu(): Promise<void> {
    this.stopTimer();
    this.resetGame();
    audioManager.play('buttonTap');
    this.showPage(PAGES.GAME_MENU);

    // Show menu banner ad when returning to main menu
    await adMobService.showMenuBannerAd();
  }

  private startTimer(): void {
    this.stopTimer();
    
    // Convert seconds to milliseconds for DeltaTimer
    const durationMs = this.levelConfig.time * 1000;
    this.gameState.timeLeft = this.levelConfig.time;
    
    this.gameTimer = new DeltaTimer(
      durationMs,
      // onUpdate callback - optimized for 60fps
      (progress: number, timeLeftMs: number) => {
        this.gameState.timeLeft = timeLeftMs / 1000;
        const progressPercent = (this.gameState.timeLeft * 100) / this.levelConfig.time;
        
        // Batch DOM updates for better performance
        WebPerformance.batchDOMUpdates([
          () => {
            const progressBar = this.container.querySelector('#gmStatsTimeProgress') as HTMLElement;
            if (progressBar) {
              progressBar.style.width = Math.max(0, progressPercent) + '%';
            }
          }
        ]);

        // Check for time almost up
        if (this.gameState.timeLeft < 4 && this.gameState.timeLeft > 0) {
          const progressBar = this.container.querySelector('#gmStatsTimeProgress') as HTMLElement;
          if (progressBar && !progressBar.classList.contains('switchColors-animation')) {
            progressBar.classList.add('switchColors-animation');
          }
          if (!this.endingSound) {
            this.endingSound = true;
            audioManager.play('timeAlmostUp');
          }
        }
      },
      // onComplete callback
              async () => {
          const LanguageManager = await import('@/utils/i18n').then(m => m.LanguageManager);
          this.gameOver(LanguageManager.t("gameMessages.timeUp")).catch(console.error);
        }
    );
    
    this.gameTimer.start();
  }

  private stopTimer(): void {
    if (this.gameTimer) {
      this.gameTimer.stop();
      this.gameTimer = null;
    }
    
    const progressBar = this.container.querySelector('#gmStatsTimeProgress') as HTMLElement;
    if (progressBar) {
      progressBar.classList.remove('switchColors-animation');
    }

    if (this.endingSound) {
      this.endingSound = false;
      audioManager.stop('timeAlmostUp');
    }
  }

  private updateUI(): void {
    // Batch all DOM updates for better performance
    WebPerformance.batchDOMUpdates([
      () => {
        const scoreElement = this.container.querySelector('#gmStatsScore') as HTMLElement;
        if (scoreElement) scoreElement.innerHTML = this.gameState.score.toString();
      },
      () => {
        const levelElement = this.container.querySelector('#gmStatsLvlNumb') as HTMLElement;
        if (levelElement) levelElement.innerHTML = `Seviye ${this.gameState.level}`;
      },
      () => {
        const currentTapElement = this.container.querySelector('#gmStatsCurrentTapCount') as HTMLElement;
        if (currentTapElement) currentTapElement.innerHTML = this.gameState.tapCount.toString();
      },
      () => {
        const totalTapElement = this.container.querySelector('#gmStatsTotalTapCount') as HTMLElement;
        if (totalTapElement) totalTapElement.innerHTML = `/${this.levelConfig.tapsGoal}`;
      }
    ]);
  }

  public getCurrentGameState(): GameState {
    return { ...this.gameState };
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  public updateMenuStats(): void {
    // Update menu page stats
    const menuHighScore = this.container.querySelector('#menuHighScore') as HTMLElement;
    const menuLastLevel = this.container.querySelector('#menuLastLevel') as HTMLElement;
    
    if (menuHighScore) {
      menuHighScore.textContent = this.gameState.highScore.toString();
    }
    
    if (menuLastLevel) {
      menuLastLevel.textContent = this.gameState.level.toString();
    }
  }

  private async updateGameStats(): Promise<void> {
    const gameEndTime = Date.now();
    const timePlayed = gameEndTime - this.gameStartTime;
    const currentStats = loadUserStats();
    
    // Calculate accuracy
    const accuracy = this.totalTaps > 0 ? (this.accurateHits / this.totalTaps) * 100 : 0;
    const isPerfectGame = this.missedHits === 0 && this.accurateHits > 0;
    
    // Update user statistics
    const updatedStats: Partial<UserStats> = {
      totalGamesPlayed: currentStats.totalGamesPlayed + 1,
      totalTimePlayed: currentStats.totalTimePlayed + timePlayed,
      highestScore: Math.max(currentStats.highestScore, this.gameState.score),
      highestLevel: Math.max(currentStats.highestLevel, this.gameState.level),
      totalTaps: currentStats.totalTaps + this.totalTaps,
      accurateHits: currentStats.accurateHits + this.accurateHits,
      missedHits: currentStats.missedHits + this.missedHits,
      bestStreak: Math.max(currentStats.bestStreak, this.currentStreak),
      currentStreak: this.currentStreak,
      perfectGames: currentStats.perfectGames + (isPerfectGame ? 1 : 0),
      averageReactionTime: this.calculateAverageReactionTime(currentStats),
      lastPlayed: gameEndTime,
    };

    // Save updated stats
    const finalStats = updateUserStats(updatedStats);
    
    // Check for achievements
    this.achievementsManager.checkAchievements(finalStats);
    
    console.log('📊 ' + LanguageManager.t('debug.gameStatsUpdated') + ':', {
      score: this.gameState.score,
      level: this.gameState.level,
      accuracy: accuracy.toFixed(1) + '%',
      perfectGame: isPerfectGame,
      streak: this.currentStreak,
      timePlayed: Math.round(timePlayed / 1000) + 's'
    });
  }

  private calculateAverageReactionTime(currentStats: UserStats): number {
    // Simple calculation - in a real game you'd track actual reaction times
    const baseReactionTime = 500; // ms
    const levelFactor = Math.max(0.8, 1 - (this.gameState.level * 0.02));
    const accuracyFactor = this.totalTaps > 0 ? (this.accurateHits / this.totalTaps) : 1;
    
    return Math.round(baseReactionTime * levelFactor * accuracyFactor);
  }
} 