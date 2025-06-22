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
    console.log('🏗️ SpeedyTap uygulaması oluşturuluyor...');
    
    try {
      // Load saved language first
      const savedLanguage = LanguageManager.loadSavedLanguage();
      await LanguageManager.changeLanguage(savedLanguage);
      console.log(`🌐 Dil yüklendi: ${savedLanguage}`);
      
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
      console.log('✅ SpeedyTap uygulaması hazır!');
      
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
              <p class="splash-subtitle">Modern Tıklama Deneyimi</p>
            </div>
            <div class="splash-progress">
              <div class="progress-bar">
                <div id="splashProgress" class="progress-fill"></div>
              </div>
              <div id="splashScreenTxt" class="splash-loading-text">Yükleniyor...</div>
            </div>
          </div>
        </div>
        
        <!-- Welcome Introduction Page -->
        <div id="page-welcome" class="page-cont page-welcome page-faded-bg anmtd-grdnt-bg blu-grdnt-bg" style="display: none;">
          <div class="welcome-container">
            <div class="welcome-hero">
              <div class="hero-icon">⚡</div>
              <h1 class="hero-title">SpeedyTap'e<br>Hoş Geldin!</h1>
              <p class="hero-description">
                Reflekslerini test et, hızını artır ve<br>
                en yüksek skoru yakala!
              </p>
            </div>
            <div class="welcome-features">
              <div class="feature-item">
                <div class="feature-icon">🎯</div>
                <div class="feature-text">Hassas Tıklama</div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">⏱️</div>
                <div class="feature-text">Zaman Yarışı</div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🏆</div>
                <div class="feature-text">Yüksek Skor</div>
              </div>
            </div>
            <button id="welcomeStartBtn" class="welcome-start-btn">
              <span>Başlayalım</span>
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
                <p class="menu-subtitle">Her Tıklama Önemli</p>
              </div>
            </div>
            
            <div class="menu-stats">
              <div class="stat-card">
                <div class="stat-icon">🏆</div>
                <div class="stat-label">En Yüksek</div>
                <div id="menuHighScore" class="stat-value">0</div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🎮</div>
                <div class="stat-label">Son Seviye</div>
                <div id="menuLastLevel" class="stat-value">1</div>
              </div>
            </div>
            
            <div class="menu-buttons">
              <button id="newGameBtn" class="menu-btn primary-btn">
                <div class="btn-content">
                  <span class="btn-icon">🚀</span>
                  <span class="btn-text">Yeni Oyun</span>
                </div>
                <div class="btn-glow"></div>
              </button>
              
              <button id="continueGameBtn" class="menu-btn secondary-btn" style="display: none;">
                <div class="btn-content">
                  <span class="btn-icon">▶️</span>
                  <span class="btn-text">Devam Et</span>
                </div>
              </button>
              
              <div class="menu-secondary-buttons">
                <button id="achievementsBtn" class="icon-btn">
                  <span class="icon">🏅</span>
                  <span class="label">Başarılar</span>
                </button>
                <button id="settingsBtn" class="icon-btn">
                  <span class="icon">⚙️</span>
                  <span class="label">Ayarlar</span>
                </button>
                <button id="aboutBtn" class="icon-btn">
                  <span class="icon">ℹ️</span>
                  <span class="label">Hakkında</span>
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
              <h2 class="tutorial-title">Nasıl Oynanır?</h2>
            </div>
            <div class="tutorial-content">
              <div class="tutorial-step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <div class="tpbl-circle c-blue tut-circle demo-circle"></div>
                  <div class="tut-arrow"></div>
                  <h3>MAVİ DAİRELERE DOKUN</h3>
                  <p>Mavi daireler puan verir</p>
                </div>
              </div>
              <div class="tutorial-step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <div class="tpbl-circle c-red demo-circle"></div>
                  <h3>KIRMIZI DAİRELERDEN KAÇIN</h3>
                  <p>Kırmızı daireler puan kaybettirir</p>
                </div>
              </div>
              <div class="tutorial-step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <div class="tutorial-timer">⏰</div>
                  <h3>ZAMANA KARŞI YARIŞIN</h3>
                  <p>Süre dolmadan hedefi tamamlayın</p>
                </div>
              </div>
            </div>
            <div class="tutorial-footer">
              <button id="tutPgBackBtn" class="tutorial-back-btn">
                <span class="back-icon">←</span>
                <span>Ana Ekrana Dön</span>
              </button>
              <button id="tutPgStartGameBtn" class="tutorial-start-btn">
                <span>Oyunu Başlat</span>
                <div class="btn-shine"></div>
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
            <p class="countdown-text">Hazır ol!</p>
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
                  <div class="gm-stats-title">Skor</div>
                  <div id="gmStatsScore" class="gm-stats-value">0</div>
                </div>
              </div>
              <div class="gm-stats-vcont">
                <div class="stat-wrapper text-align-right">
                  <div id="gmStatsLvlNumb" class="gm-stats-title">Seviye 1</div>
                  <div class="gm-stats-value">
                    <span id="gmStatsCurrentTapCount" class="gm-stats-tap-count">0</span>
                    <span id="gmStatsTotalTapCount">/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id="gameSpace" class="game-space">
            <!-- Oyun daireleri burada oluşturulacak -->
          </div>
        </div>
        
        <!-- Pause Menu Page -->
        <div id="page-pauseMenu" class="page-cont ${CSS_CLASSES.PAGES.PAUSE_MENU} page-faded-bg anmtd-grdnt-bg blu-grdnt-bg no-bg" style="display: none;">
          <div class="fixed-75w-wrapper">
            <div class="info-screen-title-cont">
              <div class="info-screen-ttl-txt-bld">Duraklama</div>
            </div>
            <div class="info-screen-txt-cont">
              <div class="info-screen-body-txt-reg">Skor</div>
              <div id="lvlPausedScore" class="lvl-fnshd-score-nmb">0</div>
            </div>
            <button id="pmCntnuGmBtn" class="gm-btn btn-blue">Devam Et</button>
            <button id="pmRstrtLvlBtn" class="gm-btn">Ana Menü</button>
          </div>
        </div>
        
        <!-- Level Passed Page -->
        <div id="page-levelPassed" class="page-cont ${CSS_CLASSES.PAGES.LEVEL_PASSED} page-faded-bg anmtd-grdnt-bg grn-grdnt-bg no-bg" style="display: none;">
          <div class="fixed-75w-wrapper">
            <div class="info-screen-title-cont">
              <div class="flag-icon info-screen-icon"></div>
              <div id="lvlPssdTtl" class="info-screen-ttl-txt-bld">Seviye 1</div>
              <div>Geçildi!</div>
            </div>
            <div class="info-screen-txt-cont">
              <div class="info-screen-body-txt-reg">Skor</div>
              <div id="lvlPssdScore" class="lvl-fnshd-score-nmb">0</div>
              <div id="lvlPssdBonusScore" class="info-screen-body-txt-reg"></div>
            </div>
            <button id="lvlPssdContinueNextLvlBtn" class="gm-btn btn-blue">Sonraki Seviye</button>
          </div>
        </div>
        
        <!-- Game Over Page -->
        <div id="page-youLost" class="page-cont ${CSS_CLASSES.PAGES.YOU_LOST} page-faded-bg anmtd-grdnt-bg rd-grdnt-bg no-bg" style="display: none;">
          <div class="fixed-75w-wrapper">
            <div class="info-screen-title-cont">
              <div id="lvlLostIcon" class="info-screen-icon you-lost-icon"></div>
              <div id="lvlLostTtl" class="info-screen-ttl-txt-bld">Oyun Bitti</div>
              <div>Kaybettin</div>
            </div>
            <div class="info-screen-txt-cont">
              <div class="info-screen-body-txt-reg">Skor</div>
              <div id="lvlLostScore" class="lvl-fnshd-score-nmb">0</div>
              <div class="info-screen-body-txt-reg">En Yüksek Skor</div>
              <div id="lvlLostBestScore" class="lvl-fnshd-score-nmb">0</div>
            </div>
            <button id="lvlLostTryAgainBtn" class="gm-btn btn-blue">Tekrar Dene</button>
          </div>
        </div>
        
        <!-- Language Selection Modal -->
        <div id="languageModal" class="language-modal" style="display: none;">
          <div class="language-modal-overlay">
            <div class="language-modal-content">
              <div class="language-modal-header">
                <h3 class="language-modal-title">🌐 Dil Seçimi / Language</h3>
                <button id="closeLanguageModal" class="language-modal-close">×</button>
              </div>
              <div class="language-modal-body">
                <div class="language-options">
                  <button id="selectTurkish" class="language-option active">
                    <span class="language-flag">🇹🇷</span>
                    <div class="language-info">
                      <div class="language-name">Türkçe</div>
                      <div class="language-native">Turkish</div>
                    </div>
                    <span class="language-check">✓</span>
                  </button>
                  <button id="selectEnglish" class="language-option">
                    <span class="language-flag">🇺🇸</span>
                    <div class="language-info">
                      <div class="language-name">English</div>
                      <div class="language-native">İngilizce</div>
                    </div>
                    <span class="language-check">✓</span>
                  </button>
                </div>
              </div>
            </div>
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
                <h3>🎯 Oyun Hakkında</h3>
                <p>SpeedyTap, modern web teknolojileri kullanılarak geliştirilmiş hızlı refleks ve konsantrasyon oyunudur. Oyuncular ekranda beliren mavi dairelere dokunarak puan kazanırken, kırmızı dairelerden kaçınarak yüksek skorlara ulaşmaya çalışır.</p>
                <p>Bu oyun, el-göz koordinasyonu, hızlı karar verme ve zaman yönetimi becerilerini geliştirmek için tasarlanmıştır. Progressive Web App (PWA) teknolojisi sayesinde hem web tarayıcılarında hem de mobil cihazlarda sorunsuz çalışır.</p>
              </div>
              
              <div class="about-section">
                <h3>🎮 Oyun Özellikleri</h3>
                <div class="feature-list">
                  <div class="feature-item">
                    <span class="feature-icon">⚡</span>
                    <span>Hızlı refleks geliştirme</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">🎯</span>
                    <span>Doğruluk ve hassasiyet</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">📊</span>
                    <span>İstatistik takibi</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">🏆</span>
                    <span>Başarım sistemi</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">⚙️</span>
                    <span>Kişiselleştirilebilir ayarlar</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">🎵</span>
                    <span>Ses efektleri ve müzik</span>
                  </div>
                </div>
              </div>
              
              <div class="about-section">
                <h3>👨‍💻 Geliştirici Bilgileri</h3>
                <p><strong>${APP_CONFIG.AUTHOR}</strong></p>
                <p>Yazılım geliştirme alanında uzmanlaşmış, modern web teknolojileri ve mobil uygulama geliştirme konularında deneyimli bir geliştiriciyiz. Kullanıcı deneyimini ön planda tutan, performans odaklı ve erişilebilir uygulamalar geliştirmeyi hedefliyoruz.</p>
                <p>SpeedyTap projesi, TypeScript, modern CSS teknikleri ve Progressive Web App standartlarını kullanarak geliştirilen bir refleks oyunudur.</p>
              </div>
              
              <div class="about-section">
                <h3>🛠️ Kullanılan Teknolojiler</h3>
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
                <h3>📱 Platform Desteği</h3>
                <div class="platform-grid">
                  <div class="platform-icons">
                    <div class="platform-item">
                      <span class="platform-icon">🌐</span>
                      <span>Web Tarayıcılar</span>
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
                <h3>🎨 Tasarım Felsefesi</h3>
                <p>SpeedyTap'in tasarımında minimal ve modern bir yaklaşım benimsenmiştir. Kullanıcı arayüzü, oyuncuların dikkatini dağıtmayacak şekilde sade tutulmuş, ancak görsel çekiciliği de korunmuştur. Renk paleti, oyun sırasında hızlı karar vermeyi destekleyecek şekilde kontrastlı ve net seçilmiştir.</p>
              </div>
              
              <div class="about-section">
                <h3>📋 Sürüm Bilgileri</h3>
                <div class="version-info">
                  <div class="version-item">
                    <span class="version-label">Mevcut Sürüm:</span>
                    <span class="version-value">v${APP_CONFIG.VERSION}</span>
                  </div>
                  <div class="version-item">
                    <span class="version-label">Son Güncelleme:</span>
                    <span class="version-value">Ocak 2025</span>
                  </div>
                  <div class="version-item">
                    <span class="version-label">Minimum Gereksinimler:</span>
                    <span class="version-value">Modern Web Tarayıcı</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="about-footer">
              <div class="copyright-notice">
                <p>© 2025 MTG Softworks · Speedy Tap™ · All Rights Reserved</p>
                <p class="trademark-note">SpeedyTap, MTG Softworks'ün tescilli markasıdır.</p>
              </div>
              <button id="abtPageBackBtn" class="about-back-btn">
                <span class="back-icon">←</span>
                <span>Ana Menü</span>
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
                <span>Ana Menü</span>
              </button>
              <h1 class="settings-title">Ayarlar</h1>
            </div>
            
            <div class="settings-content">
              <!-- Audio Settings -->
              <div class="settings-section">
                <div class="section-header">
                  <h3>🔊 Ses Ayarları</h3>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    <span>Ses Efektleri</span>
                    <input type="checkbox" id="soundEnabledToggle" class="setting-toggle">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    <span>Ana Ses Seviyesi</span>
                    <input type="range" id="masterVolumeSlider" class="setting-slider" min="0" max="100" value="70">
                    <span id="masterVolumeValue" class="slider-value">70%</span>
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    <span>SFX Seviyesi</span>
                    <input type="range" id="sfxVolumeSlider" class="setting-slider" min="0" max="100" value="80">
                    <span id="sfxVolumeValue" class="slider-value">80%</span>
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    <span>Titreşim</span>
                    <input type="checkbox" id="hapticFeedbackToggle" class="setting-toggle">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
              
              <!-- Visual Settings -->
              <div class="settings-section">
                <div class="section-header">
                  <h3>🎨 Görsel Ayarlar</h3>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    <span>Animasyonlar</span>
                    <input type="checkbox" id="animationsToggle" class="setting-toggle" checked>
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    <span>Parçacık Efektleri</span>
                    <input type="checkbox" id="particlesToggle" class="setting-toggle" checked>
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    <span>Ekran Titreşimi</span>
                    <input type="checkbox" id="screenShakeToggle" class="setting-toggle" checked>
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
              
              <!-- Gameplay Settings -->
              <div class="settings-section">
                <div class="section-header">
                  <h3>🎮 Oyun Ayarları</h3>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    <span>Zorluk Seviyesi</span>
                    <select id="difficultySelect" class="setting-select">
                      <option value="easy">Kolay</option>
                      <option value="normal" selected>Normal</option>
                      <option value="hard">Zor</option>
                    </select>
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    <span>Otomatik Devam</span>
                    <input type="checkbox" id="autoResumeToggle" class="setting-toggle" checked>
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    <span>İpuçlarını Göster</span>
                    <input type="checkbox" id="showHintsToggle" class="setting-toggle" checked>
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
              
              <!-- Data Settings -->
              <div class="settings-section">
                <div class="section-header">
                  <h3>📊 Veri Ayarları</h3>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    <span>Otomatik Yedekleme</span>
                    <input type="checkbox" id="autoBackupToggle" class="setting-toggle" checked>
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="setting-item">
                  <label class="setting-label">
                    <span>Analytics</span>
                    <input type="checkbox" id="analyticsToggle" class="setting-toggle" checked>
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="setting-item setting-actions">
                  <button id="exportDataBtn" class="setting-btn secondary">
                    <span>📤</span> Verileri Dışa Aktar
                  </button>
                  <button id="importDataBtn" class="setting-btn secondary">
                    <span>📥</span> Verileri İçe Aktar
                  </button>
                  <button id="resetDataBtn" class="setting-btn danger">
                    <span>🗑️</span> Tüm Verileri Sıfırla
                  </button>
                </div>
              </div>
              
              <!-- Storage Info -->
              <div class="settings-section">
                <div class="section-header">
                  <h3>💾 Depolama Bilgisi</h3>
                </div>
                <div class="storage-info">
                  <div class="storage-bar">
                    <div id="storageUsageBar" class="storage-fill" style="width: 0%"></div>
                  </div>
                  <div id="storageUsageText" class="storage-text">Kullanım: 0 KB / 5 MB</div>
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
                <span>Ana Menü</span>
              </button>
              <h1 class="achievements-title">Başarımlar</h1>
              <div class="achievements-stats">
                <div class="stat-item">
                  <span id="unlockedCount" class="stat-number">0</span>
                  <span class="stat-label">Açılan</span>
                </div>
                <div class="stat-item">
                  <span id="totalPoints" class="stat-number">0</span>
                  <span class="stat-label">Puan</span>
                </div>
                <div class="stat-item">
                  <span id="completionPercentage" class="stat-number">0%</span>
                  <span class="stat-label">Tamamlama</span>
                </div>
              </div>
            </div>
            
            <div class="achievements-filters">
              <button class="filter-btn active" data-category="all">
                <span>🏆</span> Tümü
              </button>
              <button class="filter-btn" data-category="gameplay">
                <span>🎮</span> Oyun
              </button>
              <button class="filter-btn" data-category="score">
                <span>📊</span> Skor
              </button>
              <button class="filter-btn" data-category="consistency">
                <span>🎯</span> Tutarlılık
              </button>
              <button class="filter-btn" data-category="speed">
                <span>⚡</span> Hız
              </button>
              <button class="filter-btn" data-category="special">
                <span>🌟</span> Özel
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
    `;
  }

  private createAdminPanel(): string {
    return `
      <div class="admin-cp">
        <button class="admin-cp-button" type="button">Geliştirici Paneli</button>
        <div class="admin-cp-items hidden">
          <label class="vzbltyLabel" for="splashPageToggle">
            <input type="radio" name="pT" class="toggleCheckbox" id="splashPageToggle">Splash
          </label>
          <label class="vzbltyLabel" for="welcomePageToggle">
            <input type="radio" name="pT" class="toggleCheckbox" id="welcomePageToggle">Hoş Geldin
          </label>
          <label class="vzbltyLabel" for="gameMenuPageToggle">
            <input type="radio" name="pT" class="toggleCheckbox" id="gameMenuPageToggle" checked>Ana Menü
          </label>
          <label class="vzbltyLabel" for="tutorialPageToggle">
            <input type="radio" name="pT" class="toggleCheckbox" id="tutorialPageToggle">Öğretici
          </label>
          <label class="vzbltyLabel" for="playAreaPageToggle">
            <input type="radio" name="pT" class="toggleCheckbox" id="playAreaPageToggle">Oyun Alanı
          </label>
          <label class="vzbltyLabel" for="aboutPageToggle">
            <input type="radio" name="pT" class="toggleCheckbox" id="aboutPageToggle">Hakkında
          </label>
        </div>
      </div>
    `;
  }

  private initializeNavigation(): void {
    console.log('🔧 Navigation başlatılıyor...');
    
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
    
    console.log('✅ Navigation listenerlari hazir');
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
      languageBtn.addEventListener('click', () => this.showLanguageModal());
      languageBtn.addEventListener('touchstart', () => this.showLanguageModal());
    }

    // Initialize language modal listeners
    this.initializeLanguageModalListeners();

    // Update current language display
    this.updateLanguageDisplay();
  }

  private initializeTutorialListeners(): void {
    const tutorialStartBtn = this.container.querySelector('#tutPgStartGameBtn');
    const tutorialBackBtn = this.container.querySelector('#tutPgBackBtn');
    
    if (tutorialStartBtn) {
      console.log('🎮 Tutorial butonu bulundu ve event listener ekleniyor');
      
      tutorialStartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🎯 Tutorial butonuna tıklandı!');
        this.gameManager.startGameFromTutorial();
      });
      
      tutorialStartBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        console.log('🎯 Tutorial butonuna dokunuldu!');
        this.gameManager.startGameFromTutorial();
      });
    } else {
      console.error('❌ Tutorial butonu bulunamadı! ID: #tutPgStartGameBtn');
    }
    
    if (tutorialBackBtn) {
      console.log('🔙 Tutorial geri butonu bulundu ve event listener ekleniyor');
      
      tutorialBackBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🔙 Tutorial geri butonuna tıklandı!');
        this.navigateToPage(PAGES.GAME_MENU);
      });
      
      tutorialBackBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        console.log('🔙 Tutorial geri butonuna dokunuldu!');
        this.navigateToPage(PAGES.GAME_MENU);
      });
    } else {
      console.error('❌ Tutorial geri butonu bulunamadı! ID: #tutPgBackBtn');
    }
  }

  private showAchievements(): void {
    console.log('🏅 Başarımlar sayfası açılıyor...');
    this.navigateToPage(PAGES.ACHIEVEMENTS);
  }

  private showSettings(): void {
    console.log('⚙️ Ayarlar sayfası açılıyor...');
    this.navigateToPage(PAGES.SETTINGS);
  }

  private continueGame(): void {
    // TODO: Implement continue game logic
    console.log('▶️ Oyun devam etme sistemi yakında gelecek!');
  }

  private showLanguageModal(): void {
    console.log('🌐 Dil seçim modal\'ı açılıyor...');
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
    // Close modal button
    const closeBtn = this.container.querySelector('#closeLanguageModal');
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
    console.log(`🌐 Dil değiştiriliyor: ${language}`);
    
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
      
      console.log(`✅ Dil başarıyla değiştirildi: ${language}`);
      
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
      
      console.log('🔄 Tüm sayfa içerikleri yeni dille güncellendi');
      
    } catch (error) {
      console.error('❌ İçerik güncellenirken hata:', error);
    }
  }

  private updateWelcomePageText(): void {
    const elements = {
      '.hero-title': LanguageManager.t('Welcome to') + '<br>' + LanguageManager.t('Speedy Tap') + '!',
      '.hero-description': LanguageManager.t('Quick reflex training') + ', ' + 
                          LanguageManager.t('accuracy improvement') + '<br>' +
                          LanguageManager.t('and achieve the highest score') + '!',
      '.welcome-start-btn span': LanguageManager.t('Get Started')
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
      '.menu-title': LanguageManager.t('Speedy Tap'),
      '.menu-subtitle': LanguageManager.t('Every tap matters'),
      '.btn-text': LanguageManager.t('Start Game'),
      '#achievementsBtn .label': LanguageManager.t('Achievements'),
      '#settingsBtn .label': LanguageManager.t('Settings'),
      '#aboutBtn .label': LanguageManager.t('About')
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
      '.tutorial-title': LanguageManager.t('How to Play'),
      '.tutorial-step:nth-child(1) h3': LanguageManager.t('Touch the blue circles').toUpperCase(),
      '.tutorial-step:nth-child(1) p': LanguageManager.t('Blue circles give points'),
      '.tutorial-step:nth-child(2) h3': LanguageManager.t('Avoid the red circles').toUpperCase(),
      '.tutorial-step:nth-child(2) p': LanguageManager.t('Red circles end the game'),
      '.tutorial-step:nth-child(3) h3': LanguageManager.t('Race against time').toUpperCase(),
      '.tutorial-step:nth-child(3) p': LanguageManager.t('Complete all taps before time runs out'),
      '.tutorial-start-btn span': LanguageManager.t('Start Game'),
      '.tutorial-back-btn span:last-child': LanguageManager.t('Back to Menu')
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
      splashText.textContent = LanguageManager.t('Loading...');
    }

    // Update countdown text
    const countdownText = this.container.querySelector('.countdown-text');
    if (countdownText) {
      countdownText.textContent = LanguageManager.t('Ready?');
    }

    // Update game stats labels
    const scoreLabel = this.container.querySelector('.gm-stats-title');
    if (scoreLabel && scoreLabel.textContent === 'Skor') {
      scoreLabel.textContent = LanguageManager.t('Score');
    }
  }

  private initializeSettingsListeners(): void {
    const settingsBackBtn = this.container.querySelector('#settingsBackBtn');
    if (settingsBackBtn) {
      settingsBackBtn.addEventListener('click', () => this.navigateToPage(PAGES.GAME_MENU));
      settingsBackBtn.addEventListener('touchstart', () => this.navigateToPage(PAGES.GAME_MENU));
    }

    console.log('⚙️ Settings listeners initialized');
  }

  private initializeAchievementsListeners(): void {
    const achievementsBackBtn = this.container.querySelector('#achievementsBackBtn');
    if (achievementsBackBtn) {
      achievementsBackBtn.addEventListener('click', () => this.navigateToPage(PAGES.GAME_MENU));
      achievementsBackBtn.addEventListener('touchstart', () => this.navigateToPage(PAGES.GAME_MENU));
    }

    console.log('🏅 Achievements listeners initialized');
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
      
      console.log(`📱 Sayfa değişti: ${page}`);
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
    console.log('💫 Modern splash screen gösteriliyor...');
    
    // Animate progress bar
    const progressFill = this.container.querySelector('#splashProgress') as HTMLElement;
    const loadingText = this.container.querySelector('#splashScreenTxt') as HTMLElement;
    
    if (progressFill && loadingText) {
      progressFill.style.width = '0%';
      
      // Simulate loading progress with realistic steps
      const steps = [
        { progress: 20, text: 'Oyun dosyaları yükleniyor...', delay: 400 },
        { progress: 45, text: 'Ses dosyaları hazırlanıyor...', delay: 600 },
        { progress: 70, text: 'Grafikler optimize ediliyor...', delay: 800 },
        { progress: 90, text: 'Son kontrollar yapılıyor...', delay: 1000 },
        { progress: 100, text: 'Hoş geldin!', delay: 1200 }
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
    
    console.log('✨ Splash screen tamamlandı - Welcome sayfasına yönlendiriliyor');
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