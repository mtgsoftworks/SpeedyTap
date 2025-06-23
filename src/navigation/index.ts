// Navigation Module - Rule 3: Modular Navigation (Clean Navigation)
// All navigation graphs, screen definitions, and routing decisions managed modularly

import { PageType } from '@/types';
import { PAGES, CSS_CLASSES } from '@/constants';
import { APP_CONFIG } from '@/config';
import { GameScreenManager } from '@/screens';
import { SettingsManager, AchievementsManager, LanguageManager } from '@/utils';

export class SpeedyTapApp {
  private container: HTMLElement;
  private currentPage: PageType = PAGES.SPLASH;
  private isInitialized = false;
  private gameManager: GameScreenManager;
  private settingsManager: SettingsManager;
  private achievementsManager: AchievementsManager;

  constructor(container: HTMLElement) {
    this.container = container;
    this.gameManager = new GameScreenManager(container);
    this.settingsManager = SettingsManager.getInstance();
    this.achievementsManager = AchievementsManager.getInstance();
  }

  public async initialize(): Promise<void> {
    console.log('🏗️ ' + LanguageManager.t('debug.speedyTapAppCreating') + '...');
    
    try {
      // Load saved language first
      const savedLanguage = LanguageManager.loadSavedLanguage();
      await LanguageManager.changeLanguage(savedLanguage);
      console.log(`🌐 ${LanguageManager.t('debug.languageLoaded')}: ${savedLanguage}`);
      
      // Create app structure
      this.createAppStructure();
      
      // Initialize navigation system
      this.initializeNavigation();
      
      // Initialize game manager
      await this.gameManager.initialize();
      
      // Update language display
      this.updateLanguageDisplay();
      this.updateActiveLanguageOption(savedLanguage);
      
      // Start with splash screen
      await this.showSplashScreen();
      
      this.isInitialized = true;
      console.log('✅ ' + LanguageManager.t('debug.speedyTapAppReady') + '!');
      
    } catch (error) {
      console.error('❌ SpeedyTap uygulaması başlatılamadı:', error);
      throw error;
    }
  }

  private createAppStructure(): void {
    this.container.innerHTML = `
      <!-- Admin Control Panel (Development Only) -->
      ${APP_CONFIG.GAME.DEBUG_MODE ? this.createAdminPanel() : ''}
      
      <!-- Main Game Wrapper -->
      <div class="main-wrapper">
        
        <!-- Modern Splash/Loading Page -->
        <div id="page-splash" class="page-cont ${CSS_CLASSES.PAGES.SPLASH} page-faded-bg">
          <div class="splash-container">
            <div class="splash-logo-wrapper">
              <div id="splashScreenLogo" class="splash-logo">
                <div class="logo-circle"></div>
                <div class="logo-pulse"></div>
              </div>
              <h1 class="splash-title">SpeedyTap</h1>
              <p class="splash-subtitle" data-i18n="navigation.quickReflexesGame">Quick Reflexes Game</p>
            </div>
            <div class="splash-progress">
              <div class="progress-bar">
                <div id="splashProgress" class="progress-fill"></div>
              </div>
              <div id="splashScreenTxt" class="splash-loading-text" data-i18n="navigation.loading">Loading...</div>
            </div>
          </div>
        </div>
        
        <!-- Welcome Introduction Page -->
        <div id="page-welcome" class="page-cont page-welcome page-faded-bg anmtd-grdnt-bg blu-grdnt-bg" style="display: none;">
          <div class="welcome-container">
            <div class="welcome-hero">
              <div class="hero-icon">⚡</div>
              <h1 class="hero-title" data-i18n="welcome.title">Welcome to SpeedyTap!</h1>
              <p class="hero-description" data-i18n="welcome.subtitle">
                Test your reflexes, increase your speed and catch the highest score!
              </p>
            </div>
            <div class="welcome-features">
              <div class="feature-item">
                <div class="feature-icon">🎯</div>
                <div class="feature-text" data-i18n="welcome.preciseTapping">Precise Tapping</div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">⏱️</div>
                <div class="feature-text" data-i18n="welcome.timeRace">Time Race</div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🏆</div>
                <div class="feature-text" data-i18n="navigation.highScore">High Score</div>
              </div>
            </div>
            <button id="welcomeStartBtn" class="welcome-start-btn">
              <span data-i18n="welcome.letsStart">Let's Start</span>
              <div class="btn-arrow">→</div>
            </button>
          </div>
        </div>
        
        <!-- Enhanced Game Menu Page -->
        <div id="page-gameMenu" class="page-cont ${CSS_CLASSES.PAGES.GAME_MENU} page-faded-bg anmtd-grdnt-bg blu-grdnt-bg" style="display: none;">
          <div class="menu-container">
            <div class="menu-header">
              <div class="menu-logo-container">
                <div class="menu-logo">
                  <div class="logo-ring"></div>
                  <div class="logo-center">ST</div>
                </div>
                <h1 class="menu-title">SpeedyTap</h1>
                <p class="menu-subtitle" data-i18n="welcome.everyTapMatters">Every Tap Matters</p>
              </div>
            </div>
            
            <div class="menu-stats">
              <div class="stat-card">
                <div class="stat-icon">🏆</div>
                <div class="stat-label" data-i18n="game.highest">Highest</div>
                <div id="menuHighScore" class="stat-value">0</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🎮</div>
                <div class="stat-label" data-i18n="game.lastLevel">Last Level</div>
                <div id="menuLastLevel" class="stat-value">1</div>
              </div>
            </div>
            
            <div class="menu-buttons">
              <button id="newGameBtn" class="menu-btn primary-btn">
                <div class="btn-content">
                  <span class="btn-icon">🚀</span>
                  <span class="btn-text" data-i18n="navigation.newGame">New Game</span>
                </div>
                <div class="btn-glow"></div>
              </button>
              
              <button id="continueGameBtn" class="menu-btn secondary-btn" style="display: none;">
                <div class="btn-content">
                  <span class="btn-icon">▶️</span>
                  <span class="btn-text" data-i18n="navigation.continueGame">Continue Game</span>
                </div>
              </button>
              
              <div class="menu-secondary-buttons">
                <button id="achievementsBtn" class="icon-btn">
                  <span class="icon">🏅</span>
                  <span class="label" data-i18n="navigation.achievements">Achievements</span>
                </button>
                <button id="settingsBtn" class="icon-btn">
                  <span class="icon">⚙️</span>
                  <span class="label" data-i18n="navigation.settings">Settings</span>
                </button>
                <button id="aboutBtn" class="icon-btn">
                  <span class="icon">ℹ️</span>
                  <span class="label" data-i18n="navigation.about">About</span>
                </button>
                <button id="languageBtn" class="icon-btn">
                  <span class="icon">🌐</span>
                  <span class="label" id="currentLanguageLabel">TR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Tutorial Page -->
        <div id="page-tutorial" class="page-cont ${CSS_CLASSES.PAGES.TUTORIAL} page-faded-bg" style="display: none;">
          <div class="tutorial-container">
            <div class="tutorial-header">
              <h2 class="tutorial-title" data-i18n="game.howToPlay">How to Play?</h2>
            </div>
            <div class="tutorial-content">
              <div class="tutorial-step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <div class="tpbl-circle c-blue tut-circle demo-circle"></div>
                  <div class="tut-arrow"></div>
                  <h3 data-i18n="game.touchBlueCircles">TOUCH BLUE CIRCLES</h3>
                  <p data-i18n="game.blueCirclesGivePoints">Blue circles give points</p>
                </div>
              </div>
              <div class="tutorial-step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <div class="tpbl-circle c-red tut-circle demo-circle"></div>
                  <div class="tut-arrow-avoid"></div>
                  <h3 data-i18n="game.avoidRedCircles">AVOID RED CIRCLES</h3>
                  <p data-i18n="game.redCirclesEndGame">Red circles end the game</p>
                </div>
              </div>
              <div class="tutorial-step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <div class="time-icon">⏰</div>
                  <h3 data-i18n="game.raceAgainstTime">Race against time</h3>
                  <p data-i18n="game.completeAllTaps">Complete all taps before time runs out</p>
                </div>
              </div>
            </div>
            <div class="tutorial-actions">
              <button id="tutPgBackBtn" class="tutorial-back-btn">
                <span data-i18n="navigation.back">Back</span>
              </button>
              <button id="tutorialStartBtn" class="tutorial-start-btn">
                <span data-i18n="game.startTutorial">Start Tutorial</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Play Delay Page -->
        <div id="page-playDelay" class="page-cont ${CSS_CLASSES.PAGES.PLAY_DELAY} page-faded-bg" style="display: none;">
          <div class="countdown-container">
            <div class="countdown-circle">
              <div id="playDelayNum" class="countdown-number">3</div>
              <div class="countdown-ring"></div>
            </div>
            <p class="countdown-text" data-i18n="gameMessages.ready">Ready!</p>
          </div>
        </div>
        
        <!-- Game Play Area Page -->
        <div id="page-playArea" class="page-cont ${CSS_CLASSES.PAGES.PLAY_AREA}" style="display: none;">
          <div class="game-stats-cont">
            <div id="gmStatsTimeProgress" class="gm-stats-time-progress"></div>
            <div class="gm-stats-wrapper">
              <div class="gm-stats-vcont">
                <button id="gmStatsPauseBtn" class="gm-stats-pause-button"></button>
              </div>
              <div class="gm-stats-vcont">
                <div class="stat-wrapper">
                  <div class="gm-stats-title" data-i18n="game.currentScore">Score</div>
                  <div id="gmStatsScore" class="gm-stats-value">0</div>
                </div>
              </div>
              <div class="gm-stats-vcont">
                <div class="stat-wrapper text-align-right">
                  <div id="gmStatsLvlNumb" class="gm-stats-title" data-i18n="game.level">Level 1</div>
                  <div class="gm-stats-value">
                    <span id="gmStatsCurrentTapCount" class="gm-stats-tap-count">0</span>
                    <span id="gmStatsTotalTapCount">/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id="gameSpace" class="game-space">
            <!-- Game circles will be created here -->
          </div>
        </div>
        
        <!-- Pause Menu Page -->
        <div id="page-pauseMenu" class="page-cont ${CSS_CLASSES.PAGES.PAUSE_MENU} page-faded-bg anmtd-grdnt-bg blu-grdnt-bg no-bg" style="display: none;">
          <div class="fixed-75w-wrapper">
            <div class="info-screen-title-cont">
              <div class="info-screen-ttl-txt-bld" data-i18n="gameMessages.pause">Pause</div>
            </div>
                          <div class="info-screen-txt-cont">
                <div class="info-screen-body-txt-reg" data-i18n="game.currentScore">Score</div>
                <div id="lvlPausedScore" class="lvl-fnshd-score-nmb">0</div>
              </div>
            <button id="pmCntnuGmBtn" class="gm-btn btn-blue" data-i18n="gameMessages.continue">Continue</button>
            <button id="pmRstrtLvlBtn" class="gm-btn" data-i18n="navigation.mainMenu">Main Menu</button>
          </div>
        </div>
        
        <!-- Level Passed Page -->
        <div id="page-levelPassed" class="page-cont ${CSS_CLASSES.PAGES.LEVEL_PASSED} page-faded-bg anmtd-grdnt-bg grn-grdnt-bg no-bg" style="display: none;">
          <div class="fixed-75w-wrapper">
            <div class="info-screen-title-cont">
              <div class="flag-icon info-screen-icon"></div>
              <div id="lvlPssdTtl" class="info-screen-ttl-txt-bld" data-i18n="game.level">Level 1</div>
              <div data-i18n="gameMessages.passed">Passed!</div>
            </div>
                          <div class="info-screen-txt-cont">
                <div class="info-screen-body-txt-reg" data-i18n="game.currentScore">Score</div>
                <div id="lvlPssdScore" class="lvl-fnshd-score-nmb">0</div>
                <div id="lvlPssdBonusScore" class="info-screen-body-txt-reg"></div>
              </div>
              <button id="lvlPssdContinueNextLvlBtn" class="gm-btn btn-blue" data-i18n="gameMessages.nextLevel">Next Level</button>
          </div>
        </div>
        
        <!-- Game Over Page -->
        <div id="page-youLost" class="page-cont ${CSS_CLASSES.PAGES.YOU_LOST} page-faded-bg anmtd-grdnt-bg rd-grdnt-bg no-bg" style="display: none;">
          <div class="fixed-75w-wrapper">
            <div class="info-screen-title-cont">
              <div id="lvlLostIcon" class="info-screen-icon you-lost-icon"></div>
              <div id="lvlLostTtl" class="info-screen-ttl-txt-bld" data-i18n="gameMessages.gameOver">Game Over</div>
              <div data-i18n="gameMessages.youLost">You Lost</div>
            </div>
                          <div class="info-screen-txt-cont">
                <div class="info-screen-body-txt-reg" data-i18n="game.currentScore">Score</div>
                <div id="lvlLostScore" class="lvl-fnshd-score-nmb">0</div>
                <div class="info-screen-body-txt-reg" data-i18n="navigation.highScore">High Score</div>
                <div id="lvlLostBestScore" class="lvl-fnshd-score-nmb">0</div>
              </div>
              <button id="lvlLostTryAgainBtn" class="gm-btn btn-blue" data-i18n="gameMessages.tryAgain">Try Again</button>
          </div>
        </div>
        
        <!-- Enhanced About Page -->
        <div id="page-about" class="page-cont ${CSS_CLASSES.PAGES.ABOUT} page-faded-bg anmtd-grdnt-bg blu-grdnt-bg no-bg" style="display: none;">
          <div class="about-container">
            <div class="about-header">
              <div class="about-logo">
                <div class="logo-3d">ST</div>
              </div>
              <h1 class="about-title">SpeedyTap</h1>
              <p class="about-version">v${APP_CONFIG.VERSION}</p>
            </div>
            
            <div class="about-content">
              <div class="about-section">
                <h3>🎯 <span data-i18n="about.gameAbout">Game About</span></h3>
                <p data-i18n="about.gameDescription">SpeedyTap is a fast reflex and concentration game developed using modern web technologies.</p>
                <p data-i18n="about.gameFeatureDescription">This game is designed to develop hand-eye coordination, quick decision making and time management skills.</p>
              </div>
              
              <div class="about-section">
                <h3>🎮 <span data-i18n="about.gameFeatures">Game Features</span></h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <span class="feature-icon">⚡</span>
                    <span data-i18n="about.fastReflexDevelopment">Fast reflex development</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">🎯</span>
                    <span data-i18n="about.accuracyAndPrecision">Accuracy and precision</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">📊</span>
                    <span data-i18n="about.statisticsTracking">Statistics tracking</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">🏆</span>
                    <span data-i18n="about.achievementSystem">Achievement system</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">⚙️</span>
                    <span data-i18n="about.customizableSettings">Customizable settings</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">🎵</span>
                    <span data-i18n="about.soundEffectsAndMusic">Sound effects and music</span>
                  </div>
                </div>
              </div>
              
              <div class="about-section">
                <h3>👨‍💻 <span data-i18n="about.developerInformation">Developer Information</span></h3>
                <p data-i18n="about.developerDescription">Specialized in software development, experienced in modern web technologies and mobile application development.</p>
                <p data-i18n="about.projectDescription">SpeedyTap project is a reflex game developed using TypeScript, modern CSS techniques and Progressive Web App standards.</p>
              </div>
              
              <div class="about-section">
                <h3>🛠️ <span data-i18n="about.technologiesUsed">Technologies Used</span></h3>
                <div class="tech-grid">
                  <div class="tech-badges">
                    <span class="tech-badge primary">TypeScript</span>
                    <span class="tech-badge secondary">Capacitor</span>
                    <span class="tech-badge tertiary">Webpack</span>
                    <span class="tech-badge primary">CSS3</span>
                  </div>
                  <div class="tech-badges">
                    <span class="tech-badge secondary">PWA</span>
                    <span class="tech-badge tertiary">Web Audio API</span>
                    <span class="tech-badge primary">Local Storage</span>
                    <span class="tech-badge secondary">Canvas API</span>
                  </div>
                </div>
              </div>
              
              <div class="about-section">
                <h3>📱 <span data-i18n="about.platformSupport">Platform Support</span></h3>
                <div class="platform-grid">
                  <div class="platform-icons">
                    <div class="platform-item">
                      <span class="platform-icon">🌐</span>
                      <span data-i18n="about.webBrowsers">Web Browsers</span>
                      <small>Chrome, Firefox, Safari, Edge</small>
                    </div>
                    <div class="platform-item">
                      <span class="platform-icon">📱</span>
                      <span>Android</span>
                      <small>API Level 21+</small>
                    </div>
                    <div class="platform-item">
                      <span class="platform-icon">🍎</span>
                      <span>iOS</span>
                      <small>iOS 13.0+</small>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="about-section">
                <h3>🎨 <span data-i18n="about.designPhilosophy">Design Philosophy</span></h3>
                <p data-i18n="about.designDescription">SpeedyTap's design adopts a minimal and modern approach.</p>
              </div>
              
              <div class="about-section">
                <h3>📋 <span data-i18n="about.versionInformation">Version Information</span></h3>
                <div class="version-info">
                  <div class="version-item">
                    <span class="version-label" data-i18n="about.currentVersion">Current Version:</span>
                    <span class="version-value">v${APP_CONFIG.VERSION}</span>
                  </div>
                  <div class="version-item">
                    <span class="version-label" data-i18n="about.lastUpdate">Last Update:</span>
                    <span class="version-value" data-i18n="about.januaryTwentyTwentyFive">January 2025</span>
                  </div>
                  <div class="version-item">
                    <span class="version-label" data-i18n="about.minimumRequirements">Minimum Requirements:</span>
                    <span class="version-value" data-i18n="about.modernWebBrowser">Modern Web Browser</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="about-footer">
              <div class="copyright-notice">
                <p>© 2025 MTG Softworks · Speedy Tap™ · All Rights Reserved</p>
                <p class="trademark-note">SpeedyTap is a registered trademark of MTG Softworks.</p>
              </div>
              <button id="abtPageBackBtn" class="about-back-btn">
                <span class="back-icon">←</span>
                <span data-i18n="navigation.backToMenu">Back to Menu</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Settings Page -->
        <div id="page-settings" class="page-cont ${CSS_CLASSES.PAGES.SETTINGS} page-faded-bg anmtd-grdnt-bg blu-grdnt-bg" style="display: none;">
          <div class="settings-container">
            <div class="settings-header">
              <button id="settingsBackBtn" class="settings-back-btn">
                <span class="back-icon">←</span>
                <span data-i18n="navigation.backToMenu">Back to Menu</span>
              </button>
                              <h1 class="settings-title" data-i18n="navigation.settings">Settings</h1>
            </div>
            
            <div class="settings-content">
              <!-- Audio Settings -->
              <div class="settings-section">
                <div class="section-header">
                  <h3><span>🔊</span> <span data-i18n="settings.audioSettings">Audio Settings</span></h3>
                </div>
                <div class="setting-item">
                  <label class="setting-label" for="soundEnabledToggle">
                    <span data-i18n="settings.soundEffects">Sound Effects</span>
                    <input type="checkbox" id="soundEnabledToggle" class="setting-toggle">
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    <span data-i18n="settings.masterVolume">Master Volume</span>
                    <div class="slider-container">
                      <input type="range" id="masterVolumeSlider" class="setting-slider" min="0" max="100" value="70">
                      <span id="masterVolumeValue" class="slider-value">70%</span>
                    </div>
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    <span data-i18n="settings.sfxVolume">SFX Volume</span>
                    <div class="slider-container">
                      <input type="range" id="sfxVolumeSlider" class="setting-slider" min="0" max="100" value="80">
                      <span id="sfxVolumeValue" class="slider-value">80%</span>
                    </div>
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label" for="hapticFeedbackToggle">
                    <span data-i18n="settings.hapticFeedback">Haptic Feedback</span>
                    <input type="checkbox" id="hapticFeedbackToggle" class="setting-toggle">
                  </label>
                </div>
              </div>
              
              <!-- Visual Settings -->
              <div class="settings-section">
                <div class="section-header">
                  <h3><span>🎨</span> <span data-i18n="settings.visualSettings">Visual Settings</span></h3>
                </div>
                <div class="setting-item">
                  <label class="setting-label" for="animationsToggle">
                    <span data-i18n="settings.animations">Animations</span>
                    <input type="checkbox" id="animationsToggle" class="setting-toggle">
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label" for="particlesToggle">
                    <span data-i18n="settings.particles">Particles</span>
                    <input type="checkbox" id="particlesToggle" class="setting-toggle">
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label" for="screenShakeToggle">
                    <span data-i18n="settings.screenShake">Screen Shake</span>
                    <input type="checkbox" id="screenShakeToggle" class="setting-toggle">
                  </label>
                </div>
              </div>
              
              <!-- Gameplay Settings -->
              <div class="settings-section">
                <div class="section-header">
                  <h3><span>🎮</span> <span data-i18n="settings.gameplaySettings">Gameplay Settings</span></h3>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    <span data-i18n="settings.difficulty">Difficulty</span>
                    <select id="difficultySelect" class="setting-select">
                      <option value="easy" data-i18n="settings.easy">Easy</option>
                      <option value="normal" data-i18n="settings.normal">Normal</option>
                      <option value="hard" data-i18n="settings.hard">Hard</option>
                    </select>
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label" for="autoResumeToggle">
                    <span data-i18n="settings.autoResume">Auto Resume</span>
                    <input type="checkbox" id="autoResumeToggle" class="setting-toggle">
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label" for="showHintsToggle">
                    <span data-i18n="settings.showHints">Show Hints</span>
                    <input type="checkbox" id="showHintsToggle" class="setting-toggle">
                  </label>
                </div>
              </div>
              
              <!-- Data Settings -->
              <div class="settings-section">
                <div class="section-header">
                  <h3><span>💾</span> <span data-i18n="settings.dataSettings">Data Settings</span></h3>
                </div>
                <div class="setting-item">
                  <label class="setting-label" for="autoBackupToggle">
                    <span data-i18n="settings.autoBackup">Auto Backup</span>
                    <input type="checkbox" id="autoBackupToggle" class="setting-toggle">
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label" for="analyticsToggle">
                    <span data-i18n="settings.analytics">Analytics</span>
                    <input type="checkbox" id="analyticsToggle" class="setting-toggle">
                  </label>
                </div>
                <div class="setting-item">
                  <div class="setting-buttons">
                    <button id="exportDataBtn" class="setting-btn" data-i18n="settings.exportData">Export Data</button>
                    <button id="importDataBtn" class="setting-btn" data-i18n="settings.importData">Import Data</button>
                    <button id="resetDataBtn" class="setting-btn danger" data-i18n="settings.clearData">Clear Data</button>
                  </div>
                </div>
                <div class="setting-item">
                  <div class="storage-info">
                    <span data-i18n="settings.storageUsage">Storage Usage</span>
                    <span id="storageUsage" class="storage-value">0 KB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Achievements Page -->
        <div id="page-achievements" class="page-cont ${CSS_CLASSES.PAGES.ACHIEVEMENTS} page-faded-bg anmtd-grdnt-bg blu-grdnt-bg" style="display: none;">
          <div class="achievements-container">
            <div class="achievements-header">
              <button id="achievementsBackBtn" class="achievements-back-btn">
                <span class="back-icon">←</span>
                <span data-i18n="navigation.backToMenu">Back to Menu</span>
              </button>
              <h1 class="achievements-title" data-i18n="navigation.achievements">Achievements</h1>
              <div class="achievements-stats">
                <div class="stat-item">
                  <span id="unlockedCount" class="stat-number">0</span>
                  <span class="stat-label" data-i18n="achievements.unlocked">Unlocked</span>
                </div>
                <div class="stat-item">
                  <span id="totalPoints" class="stat-number">0</span>
                  <span class="stat-label" data-i18n="achievements.totalPoints">Total Points</span>
                </div>
                <div class="stat-item">
                  <span id="completionPercentage" class="stat-number">0%</span>
                  <span class="stat-label" data-i18n="achievements.completion">Completion</span>
                </div>
              </div>
            </div>
            
            <div class="achievements-filters">
              <button class="filter-btn active" data-category="all">
                <span>🏆</span> <span data-i18n="achievements.all">All</span>
              </button>
              <button class="filter-btn" data-category="gameplay">
                <span>🎮</span> <span data-i18n="achievements.gameplay">Gameplay</span>
              </button>
              <button class="filter-btn" data-category="score">
                <span>📊</span> <span data-i18n="achievements.score">Score</span>
              </button>
              <button class="filter-btn" data-category="consistency">
                <span>🎯</span> <span data-i18n="achievements.consistency">Consistency</span>
              </button>
              <button class="filter-btn" data-category="speed">
                <span>⚡</span> <span data-i18n="achievements.speed">Speed</span>
              </button>
              <button class="filter-btn" data-category="special">
                <span>🌟</span> <span data-i18n="achievements.special">Special</span>
              </button>
            </div>
            
            <div class="achievements-content">
              <div id="achievementsList" class="achievements-list">
                <!-- Achievements will be dynamically populated here -->
              </div>
            </div>
          </div>
        </div>
        
      </div>
      <!-- Language Selection Modal -->
      <div id="languageModal" class="language-modal-overlay" style="display: none;">
        <div class="language-modal">
          <div class="language-modal-header">
            <h3 data-i18n="navigation.language">Language</h3>
            <button id="languageModalClose" class="language-modal-close">×</button>
          </div>
          <div class="language-modal-body">
            <div class="language-options">
              <button id="selectTurkish" class="language-option" data-language="tr">
                <span class="language-flag">🇹🇷</span>
                <span class="language-name">Türkçe</span>
              </button>
              <button id="selectEnglish" class="language-option" data-language="en">
                <span class="language-flag">🇺🇸</span>
                <span class="language-name">English</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private createAdminPanel(): string {
    return `
      <div class="admin-cp">
        <button class="admin-cp-button" type="button" data-i18n="admin.developerPanel">Developer Panel</button>
        <div class="admin-cp-items hidden">
          <label class="vzbltyLabel" for="splashPageToggle">
            <input type="radio" name="pT" class="toggleCheckbox" id="splashPageToggle" data-i18n="admin.splash">Splash
          </label>
          <label class="vzbltyLabel" for="welcomePageToggle">
                          <input type="radio" name="pT" class="toggleCheckbox" id="welcomePageToggle" data-i18n="admin.welcome">Welcome
          </label>
          <label class="vzbltyLabel" for="gameMenuPageToggle">
                          <input type="radio" name="pT" class="toggleCheckbox" id="gameMenuPageToggle" checked data-i18n="navigation.mainMenu">Main Menu
          </label>
          <label class="vzbltyLabel" for="tutorialPageToggle">
                          <input type="radio" name="pT" class="toggleCheckbox" id="tutorialPageToggle" data-i18n="navigation.tutorial">Tutorial
          </label>
          <label class="vzbltyLabel" for="playAreaPageToggle">
                          <input type="radio" name="pT" class="toggleCheckbox" id="playAreaPageToggle" data-i18n="game.gameArea">Game Area
          </label>
          <label class="vzbltyLabel" for="aboutPageToggle">
                          <input type="radio" name="pT" class="toggleCheckbox" id="aboutPageToggle" data-i18n="navigation.about">About
          </label>
        </div>
      </div>
    `;
  }

  private initializeNavigation(): void {
    console.log('🔧 ' + LanguageManager.t('debug.navigationStarting') + '...');
    
    // Admin panel functionality (development only)
    if (APP_CONFIG.GAME.DEBUG_MODE) {
      this.initializeAdminPanel();
    }
    
    // Initialize new page listeners
    this.initializeWelcomePageListeners();
    this.initializeMenuListeners();
    this.initializeTutorialListeners();
    this.initializeSettingsListeners();
    this.initializeAchievementsListeners();
    
    console.log('✅ ' + LanguageManager.t('debug.navigationListenersReady'));
  }

  private initializeWelcomePageListeners(): void {
    const welcomeStartBtn = this.container.querySelector('#welcomeStartBtn');
    if (welcomeStartBtn) {
      welcomeStartBtn.addEventListener('click', () => this.navigateToPage(PAGES.GAME_MENU));
      welcomeStartBtn.addEventListener('touchstart', () => this.navigateToPage(PAGES.GAME_MENU));
    }
  }

  private initializeMenuListeners(): void {
    // Enhanced menu button handlers
    const achievementsBtn = this.container.querySelector('#achievementsBtn');
    const settingsBtn = this.container.querySelector('#settingsBtn');
    const continueGameBtn = this.container.querySelector('#continueGameBtn');
    const languageBtn = this.container.querySelector('#languageBtn');
    
    if (achievementsBtn) {
      achievementsBtn.addEventListener('click', () => this.showAchievements());
      achievementsBtn.addEventListener('touchstart', () => this.showAchievements());
    }
    
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.showSettings());
      settingsBtn.addEventListener('touchstart', () => this.showSettings());
    }
    
    if (continueGameBtn) {
      continueGameBtn.addEventListener('click', () => this.continueGame());
      continueGameBtn.addEventListener('touchstart', () => this.continueGame());
    }

    if (languageBtn) {
      console.log('🌐 ' + LanguageManager.t('debug.languageButtonFound'));
      languageBtn.addEventListener('click', () => this.showLanguageModal());
      languageBtn.addEventListener('touchstart', () => this.showLanguageModal());
    } else {
      console.error('❌ Dil butonu bulunamadı! ID: #languageBtn');
    }

    // Initialize language modal listeners
    this.initializeLanguageModalListeners();

    // Update current language display
    this.updateLanguageDisplay();
  }

  private initializeTutorialListeners(): void {
    const tutorialStartBtn = this.container.querySelector('#tutorialStartBtn');
    const tutorialBackBtn = this.container.querySelector('#tutPgBackBtn');
    
    if (tutorialStartBtn) {
      console.log('🎮 ' + LanguageManager.t('debug.tutorialButtonFound'));
      
      tutorialStartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🎯 ' + LanguageManager.t('debug.tutorialButtonClicked') + '!');
        this.gameManager.startGameFromTutorial();
      });
      
      tutorialStartBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        console.log('🎯 ' + LanguageManager.t('debug.tutorialButtonTouched') + '!');
        this.gameManager.startGameFromTutorial();
      });
    } else {
      console.error('❌ Tutorial butonu bulunamadı! ID: #tutorialStartBtn');
    }
    
    if (tutorialBackBtn) {
      console.log('🔙 ' + LanguageManager.t('debug.tutorialBackButtonFound'));
      
      tutorialBackBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🔙 ' + LanguageManager.t('debug.tutorialBackButtonClicked') + '!');
        this.navigateToPage(PAGES.GAME_MENU);
      });
      
      tutorialBackBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        console.log('🔙 ' + LanguageManager.t('debug.tutorialBackButtonTouched') + '!');
        this.navigateToPage(PAGES.GAME_MENU);
      });
    } else {
      console.error('❌ Tutorial geri butonu bulunamadı! ID: #tutPgBackBtn');
    }
  }

  private showAchievements(): void {
    console.log('🏅 ' + LanguageManager.t('debug.achievementsPageOpening') + '...');
    this.navigateToPage(PAGES.ACHIEVEMENTS);
  }

  private showSettings(): void {
    console.log('⚙️ ' + LanguageManager.t('debug.settingsPageOpening') + '...');
    this.navigateToPage(PAGES.SETTINGS);
  }

  private continueGame(): void {
    // TODO: Implement continue game logic
    console.log('▶️ ' + LanguageManager.t('debug.gameContinueSystemComingSoon') + '!');
  }

  private showLanguageModal(): void {
    console.log('🌐 ' + LanguageManager.t('debug.languageSelectionModalOpening') + '...');
    const modal = this.container.querySelector('#languageModal') as HTMLElement;
    if (modal) {
      modal.style.display = 'block';
    }
  }

  private hideLanguageModal(): void {
    const modal = this.container.querySelector('#languageModal') as HTMLElement;
    if (modal) {
      modal.style.display = 'none';
    }
  }

  private initializeLanguageModalListeners(): void {
    // Close modal buttons
    const closeBtn = this.container.querySelector('#languageModalClose');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideLanguageModal());
      closeBtn.addEventListener('touchstart', () => this.hideLanguageModal());
    }

    // Language selection buttons
    const turkishBtn = this.container.querySelector('#selectTurkish');
    const englishBtn = this.container.querySelector('#selectEnglish');

    if (turkishBtn) {
      turkishBtn.addEventListener('click', () => this.selectLanguage('tr'));
      turkishBtn.addEventListener('touchstart', () => this.selectLanguage('tr'));
    }

    if (englishBtn) {
      englishBtn.addEventListener('click', () => this.selectLanguage('en'));
      englishBtn.addEventListener('touchstart', () => this.selectLanguage('en'));
    }

    // Close modal when clicking overlay
    const overlay = this.container.querySelector('.language-modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hideLanguageModal();
        }
      });
    }
  }

  private async selectLanguage(language: 'tr' | 'en'): Promise<void> {
    console.log(`🌐 ${LanguageManager.t('debug.languageChanging')}: ${language}`);
    
    try {
      // Change language
      await LanguageManager.changeLanguage(language);
      
      // Update UI
      this.updateLanguageDisplay();
      this.updateActiveLanguageOption(language);
      
      // Hide modal
      this.hideLanguageModal();
      
      // Reload content with new language
      await this.reloadContentWithNewLanguage();
      
      console.log(`✅ ${LanguageManager.t('debug.languageChangedSuccessfully')}: ${language}`);
      
    } catch (error) {
      console.error('❌ Dil değiştirilemedi:', error);
    }
  }

  private updateLanguageDisplay(): void {
    const currentLang = LanguageManager.getCurrentLanguage();
    const languageLabel = this.container.querySelector('#currentLanguageLabel');
    
    if (languageLabel) {
      languageLabel.textContent = currentLang.toUpperCase();
    }
    
    // Update all elements with data-i18n attribute
    this.updateAllTranslations();
  }
  
  private updateAllTranslations(): void {
    // Update all elements with data-i18n attribute
    const elementsToTranslate = this.container.querySelectorAll('[data-i18n]');
    elementsToTranslate.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        const translation = LanguageManager.t(key);
        if (element.tagName.toLowerCase() === 'input' && element.getAttribute('type') === 'text') {
          (element as HTMLInputElement).placeholder = translation;
        } else {
          element.textContent = translation;
        }
      }
    });
    
    // Update select option elements
    const selectElements = this.container.querySelectorAll('select');
    selectElements.forEach(select => {
      const options = select.querySelectorAll('option[data-i18n]');
      options.forEach(option => {
        const key = option.getAttribute('data-i18n');
        if (key) {
          option.textContent = LanguageManager.t(key);
        }
      });
    });
    
    // Update achievements and settings if they're visible
    if (this.currentPage === PAGES.ACHIEVEMENTS) {
      this.achievementsManager.renderAchievements();
    }
  }

  private updateActiveLanguageOption(selectedLanguage: 'tr' | 'en'): void {
    // Remove active class from all options
    const allOptions = this.container.querySelectorAll('.language-option');
    allOptions.forEach(option => option.classList.remove('active'));
    
    // Add active class to selected option
    const selectedOption = this.container.querySelector(
      selectedLanguage === 'tr' ? '#selectTurkish' : '#selectEnglish'
    );
    if (selectedOption) {
      selectedOption.classList.add('active');
    }
  }

  private async reloadContentWithNewLanguage(): Promise<void> {
    // Update all translatable text elements
    try {
      // Update welcome page
      this.updateWelcomePageText();
      
      // Update menu page  
      this.updateMenuPageText();
      
      // Update tutorial page
      this.updateTutorialPageText();
      
      // Update other pages
      this.updateOtherPagesText();
      
      console.log('🔄 ' + LanguageManager.t('debug.allPageContentsUpdated'));
      
    } catch (error) {
      console.error('❌ İçerik güncellenirken hata:', error);
    }
  }

  private updateWelcomePageText(): void {
    const elements = {
      '.hero-title': LanguageManager.t('welcome.title'),
      '.hero-description': LanguageManager.t('welcome.subtitle'),
      '.welcome-start-btn span': LanguageManager.t('welcome.letsStart')
    };

    Object.entries(elements).forEach(([selector, text]) => {
      const element = this.container.querySelector(selector);
      if (element) {
        element.innerHTML = text;
      }
    });
  }

  private updateMenuPageText(): void {
    const elements = {
      '.menu-title': LanguageManager.t('navigation.speedyTap'),
      '.menu-subtitle': LanguageManager.t('welcome.everyTapMatters'),
      '.btn-text': LanguageManager.t('navigation.startGame'),
      '#achievementsBtn .label': LanguageManager.t('navigation.achievements'),
      '#settingsBtn .label': LanguageManager.t('navigation.settings'),
      '#aboutBtn .label': LanguageManager.t('navigation.about')
    };

    Object.entries(elements).forEach(([selector, text]) => {
      const element = this.container.querySelector(selector);
      if (element) {
        element.textContent = text;
      }
    });
  }

  private updateTutorialPageText(): void {
    const elements = {
      '.tutorial-title': LanguageManager.t('game.howToPlay'),
      '.tutorial-step:nth-child(1) h3': LanguageManager.t('game.touchBlueCircles').toUpperCase(),
      '.tutorial-step:nth-child(1) p': LanguageManager.t('game.blueCirclesGivePoints'),
      '.tutorial-step:nth-child(2) h3': LanguageManager.t('game.avoidRedCircles').toUpperCase(),
      '.tutorial-step:nth-child(2) p': LanguageManager.t('game.redCirclesEndGame'),
      '.tutorial-step:nth-child(3) h3': LanguageManager.t('game.raceAgainstTime').toUpperCase(),
      '.tutorial-step:nth-child(3) p': LanguageManager.t('game.completeAllTaps'),
      '.tutorial-start-btn span': LanguageManager.t('navigation.startGame'),
      '.tutorial-back-btn span:last-child': LanguageManager.t('navigation.backToMenu')
    };

    Object.entries(elements).forEach(([selector, text]) => {
      const element = this.container.querySelector(selector);
      if (element) {
        element.textContent = text;
      }
    });
  }

  private updateOtherPagesText(): void {
    // Update splash screen
    const splashText = this.container.querySelector('#splashScreenTxt');
    if (splashText) {
      splashText.textContent = LanguageManager.t('navigation.loading');
    }

    // Update countdown text
    const countdownText = this.container.querySelector('.countdown-text');
    if (countdownText) {
      countdownText.textContent = LanguageManager.t('gameMessages.ready');
    }

    // Update game stats labels
    const scoreLabel = this.container.querySelector('.gm-stats-title');
    if (scoreLabel && scoreLabel.textContent === 'Skor') {
      scoreLabel.textContent = LanguageManager.t('game.currentScore');
    }
  }

  private initializeSettingsListeners(): void {
    const settingsBackBtn = this.container.querySelector('#settingsBackBtn');
    if (settingsBackBtn) {
      settingsBackBtn.addEventListener('click', () => this.navigateToPage(PAGES.GAME_MENU));
      settingsBackBtn.addEventListener('touchstart', () => this.navigateToPage(PAGES.GAME_MENU));
    }

    console.log('⚙️ ' + LanguageManager.t('debug.settingsListenersInitialized'));
  }

  private initializeAchievementsListeners(): void {
    const achievementsBackBtn = this.container.querySelector('#achievementsBackBtn');
    if (achievementsBackBtn) {
      achievementsBackBtn.addEventListener('click', () => this.navigateToPage(PAGES.GAME_MENU));
      achievementsBackBtn.addEventListener('touchstart', () => this.navigateToPage(PAGES.GAME_MENU));
    }

    console.log('🏅 ' + LanguageManager.t('debug.achievementsListenersInitialized'));
  }

  private initializeAdminPanel(): void {
    const adminBtn = this.container.querySelector('.admin-cp-button') as HTMLButtonElement;
    const adminItems = this.container.querySelector('.admin-cp-items') as HTMLElement;
    
    if (adminBtn && adminItems) {
      adminBtn.addEventListener('click', () => {
        adminItems.classList.toggle('hidden');
      });
      
      // Page toggle functionality
      const toggles = this.container.querySelectorAll('.toggleCheckbox');
      toggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
          const target = e.target as HTMLInputElement;
          if (target.checked) {
            const pageId = target.id.replace('PageToggle', '');
            this.navigateToPage(pageId as PageType);
          }
        });
      });
    }
  }

  public navigateToPage(page: PageType): void {
    // Hide current page
    const currentPageElement = this.container.querySelector(`#page-${this.currentPage}`);
    if (currentPageElement) {
      (currentPageElement as HTMLElement).style.display = 'none';
    }
    
    // Show new page
    const newPageElement = this.container.querySelector(`#page-${page}`);
    if (newPageElement) {
      (newPageElement as HTMLElement).style.display = 'block';
      this.currentPage = page;
      
      // Update menu stats when showing game menu
      if (page === PAGES.GAME_MENU && this.gameManager) {
        this.gameManager.updateMenuStats();
      }
      
      // Initialize page-specific functionality
      this.initializePageContent(page);
      
      console.log(`📱 ${LanguageManager.t('debug.pageChanged')}: ${page}`);
    }
  }

  private initializePageContent(page: PageType): void {
    switch (page) {
      case PAGES.SETTINGS:
        // Initialize settings UI when navigating to settings page
        setTimeout(() => {
          this.settingsManager.initializeSettingsUI();
        }, 100); // Small delay to ensure DOM is ready
        break;
      
      case PAGES.ACHIEVEMENTS:
        // Initialize achievements UI when navigating to achievements page
        setTimeout(() => {
          this.achievementsManager.initializeAchievementsUI();
        }, 100);
        break;
    }
  }

  private async showSplashScreen(): Promise<void> {
    console.log('💫 ' + LanguageManager.t('debug.modernSplashScreenShowing') + '...');
    
    // Animate progress bar
    const progressFill = this.container.querySelector('#splashProgress') as HTMLElement;
    const loadingText = this.container.querySelector('#splashScreenTxt') as HTMLElement;
    
    if (progressFill && loadingText) {
      progressFill.style.width = '0%';
      
      // Simulate loading progress with realistic steps
      const steps = [
        { progress: 20, text: LanguageManager.t('system.loadingGameFiles'), delay: 400 },
        { progress: 45, text: LanguageManager.t('system.preparingAudioFiles'), delay: 600 },
        { progress: 70, text: LanguageManager.t('system.optimizingGraphics'), delay: 800 },
        { progress: 90, text: LanguageManager.t('system.finalChecks'), delay: 1000 },
        { progress: 100, text: LanguageManager.t('system.welcome'), delay: 1200 }
      ];
      
      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
        progressFill.style.width = `${step.progress}%`;
        loadingText.textContent = step.text;
      }
    }
    
    // Wait a bit more for effect then show welcome screen
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Navigate to welcome page instead of directly to game menu
    this.navigateToPage(PAGES.WELCOME);
    
    console.log('✨ ' + LanguageManager.t('debug.splashScreenCompleted'));
  }

  public getCurrentPage(): PageType {
    return this.currentPage;
  }

  public getGameManager(): GameScreenManager {
    return this.gameManager;
  }

  public isReady(): boolean {
    return this.isInitialized;
  }
} 