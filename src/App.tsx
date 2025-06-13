import { useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { adMobService } from './services/AdMobService';
import { audioService } from './services/AudioService';
import { BatteryOptimizer } from './services/BatteryOptimizer';
import { ScreenAdapter } from './services/ScreenAdapter';
import './i18n'; // i18n sistemini başlat
import './App.css';

// Oyun sayfaları
import SplashScreen from './components/SplashScreen';
import GameMenu from './components/GameMenu';
import GameArea from './components/GameArea';
import GamePause from './components/GamePause';
import GameOver from './components/GameOver';
import LevelPassed from './components/LevelPassed';
import About from './components/About';
import Settings from './components/Settings';
import TouchController from './components/TouchController';
import GameModeSelector, { type GameMode } from './components/GameModeSelector';
import AchievementNotification from './components/AchievementNotification';
import Statistics from './components/Statistics';
import DailyChallenges from './components/DailyChallenges';
import Shop from './components/Shop';
import type { Achievement } from './services/StatisticsService';

export type GameState = 
  | 'splash'
  | 'menu'
  | 'mode_selector'
  | 'playing'
  | 'paused'
  | 'game_over'
  | 'level_passed'
  | 'about'
  | 'settings'
  | 'statistics'
  | 'daily_challenges'
  | 'shop';

export interface GameData {
  score: number;
  level: number;
  highScore: number;
  currentTaps: number;
  requiredTaps: number;
  timeLeft: number;
  maxTime: number;
  gameMode: 'classic' | 'target' | 'survival' | 'speed';
  targetCircles?: number; // Target mode için
  targetsHit?: number; // Target mode için
}

function App() {
  // Oyun durumu
  const [gameState, setGameState] = useState<GameState>('splash');
  const [gameData, setGameData] = useState<GameData>({
    score: 0,
    level: 1,
    highScore: parseInt(localStorage.getItem('speedytap_highscore') || '0'),
    currentTaps: 0,
    requiredTaps: 10,
    timeLeft: 30000,
    maxTime: 30000,
    gameMode: 'classic'
  });
  const [winStreak, setWinStreak] = useState(0); // Kazanç streak tracking
  
  // Achievement notification state
  const [achievementNotification, setAchievementNotification] = useState<{
    achievement: Achievement | null;
    isVisible: boolean;
  }>({
    achievement: null,
    isVisible: false
  });

  // Phase 1 - Sistem servisleri
  const batteryOptimizer = BatteryOptimizer.getInstance();
  const screenAdapter = ScreenAdapter.getInstance();
  
  // Haptic feedback fonksiyonu
  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.log('Haptic feedback not available');
    }
  };

  // High score güncelleme
  const updateHighScore = (newScore: number) => {
    if (newScore > gameData.highScore) {
      setGameData(prev => ({ ...prev, highScore: newScore }));
      localStorage.setItem('speedytap_highscore', newScore.toString());
    }
  };

  // Oyun durumu değiştirme
  const changeGameState = (newState: GameState) => {
    triggerHaptic(ImpactStyle.Light);
    setGameState(newState);
  };

  // Yeni oyun başlatma
  const startNewGame = (gameMode: GameMode = 'classic') => {
    setGameData({
      score: 0,
      level: 1,
      highScore: gameData.highScore,
      currentTaps: 0,
      requiredTaps: 10,
      timeLeft: 30000, // 30 saniye başlangıç
      maxTime: 30000,
      gameMode
    });
    changeGameState('playing');
  };

  // Achievement notification fonksiyonları
  const showAchievementNotification = (achievement: Achievement) => {
    setAchievementNotification({
      achievement,
      isVisible: true
    });
  };

  const hideAchievementNotification = () => {
    setAchievementNotification({
      achievement: null,
      isVisible: false
    });
  };

  // App başlatma ve servisler initialize
  useEffect(() => {
    const initializeApp = async () => {
      // AdMob'u başlat
      await adMobService.initialize();
      // Audio sistemi hazır
      audioService.setVolume(0.8);
      
      // Phase 1 - Sistem servislerini başlat
      await batteryOptimizer.initialize();
      await screenAdapter.initialize();
      
      // CSS değişkenlerini güncelle
      screenAdapter.updateCSSVariables();
    };
    
    initializeApp();
  }, []);

  // Splash screen'den sonra ana menüye geç
  useEffect(() => {
    if (gameState === 'splash') {
      const timer = setTimeout(async () => {
        changeGameState('menu');
        // Ana menüde banner reklamını göster
        await adMobService.showMenuBanner();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Oyun durumu değişikliklerinde reklam yönetimi
  useEffect(() => {
    const handleAdState = async () => {
      switch (gameState) {
        case 'playing':
          // Oyun sırasında banner'ı gizle
          await adMobService.hideGameBanner();
          break;
        case 'menu':
          // Menüde banner göster
          await adMobService.showMenuBanner();
          break;
        case 'game_over':
          // Oyun kaybında her zaman interstitial göster
          await adMobService.showGameEndAd();
          // Win streak sıfırla
          console.log(`Game over, resetting win streak from ${winStreak} to 0`);
          setWinStreak(0);
          break;
        case 'level_passed':
          // Level geçişinde win streak artır
          setWinStreak(prev => {
            const newStreak = prev + 1;
            console.log(`Win streak: ${newStreak}`);
            // 4 level üst üste kazanınca reklam göster
            if (newStreak >= 4) {
              console.log('4 win streak reached, showing ad');
              adMobService.showInterstitialAd();
              return 0; // Streak'i sıfırla
            }
            return newStreak;
          });
          break;
      }
    };

    handleAdState();
  }, [gameState]);

  const renderCurrentScreen = () => {
    switch (gameState) {
      case 'splash':
        return <SplashScreen />;
      case 'menu':
        return (
          <GameMenu
            highScore={gameData.highScore}
            onNewGame={startNewGame}
            onModeSelector={() => changeGameState('mode_selector')}
            onStatistics={() => changeGameState('statistics')}
            onDailyChallenges={() => changeGameState('daily_challenges')}
            onShop={() => changeGameState('shop')}
            onAbout={() => changeGameState('about')}
            onSettings={() => changeGameState('settings')}
          />
        );
      case 'playing':
        return (
          <GameArea
            gameData={gameData}
            setGameData={setGameData}
            onPause={() => changeGameState('paused')}
            onGameOver={() => {
              updateHighScore(gameData.score);
              changeGameState('game_over');
            }}
            onLevelPassed={() => changeGameState('level_passed')}
            triggerHaptic={triggerHaptic}
            showAchievementNotification={showAchievementNotification}
          />
        );
      case 'paused':
        return (
          <GamePause
            score={gameData.score}
            onResume={() => changeGameState('playing')}
            onRestart={startNewGame}
            onMenu={() => changeGameState('menu')}
          />
        );
      case 'game_over':
        return (
          <GameOver
            score={gameData.score}
            highScore={gameData.highScore}
            onTryAgain={startNewGame}
            onMenu={() => changeGameState('menu')}
          />
        );
      case 'level_passed':
        return (
          <LevelPassed
            score={gameData.score}
            level={gameData.level}
            onContinue={() => {
              // Seviye arttır ve oyuna devam et
              setGameData(prev => {
                const newLevel = Math.min(prev.level + 1, 50); // Maksimum 50 level
                
                return {
                  ...prev,
                  level: newLevel,
                  requiredTaps: Math.min(prev.requiredTaps + 2, 30), // Maksimum 30 tap, daha az artış
                  currentTaps: 0,
                  timeLeft: Math.max(12000, 30000 - (newLevel * 500)), // Minimum 12s, her level -0.5s
                  maxTime: Math.max(12000, 30000 - (newLevel * 500)),
                  gameMode: 'classic'
                };
              });
              changeGameState('playing');
            }}
            onMenu={() => changeGameState('menu')}
          />
        );
      case 'about':
        return (
          <About
            onBack={() => changeGameState('menu')}
          />
        );
      case 'settings':
        return (
          <Settings
            onBack={() => changeGameState('menu')}
          />
        );
      case 'mode_selector':
        return (
          <GameModeSelector
            onSelectMode={(mode) => startNewGame(mode)}
            onBack={() => changeGameState('menu')}
          />
        );
      case 'statistics':
        return (
          <Statistics
            onBack={() => changeGameState('menu')}
          />
        );
      case 'daily_challenges':
        return (
          <DailyChallenges
            onBack={() => changeGameState('menu')}
            onStartChallenge={(challenge) => {
              // Daily challenge için özel oyun moduna geç
              setGameData(prev => ({
                ...prev,
                gameMode: challenge.type === 'speed' ? 'speed' : 
                         challenge.type === 'accuracy' ? 'target' : 
                         challenge.type === 'survival' ? 'survival' : 'classic',
                targetCircles: challenge.type === 'accuracy' ? challenge.target : undefined
              }));
              startNewGame();
            }}
          />
        );
      case 'shop':
        return (
          <Shop
            onBack={() => changeGameState('menu')}
            triggerHaptic={triggerHaptic}
          />
        );
      default:
        return (
          <GameMenu
            highScore={gameData.highScore}
            onNewGame={startNewGame}
            onModeSelector={() => changeGameState('mode_selector')}
            onStatistics={() => changeGameState('statistics')}
            onDailyChallenges={() => changeGameState('daily_challenges')}
            onShop={() => changeGameState('shop')}
            onAbout={() => changeGameState('about')}
            onSettings={() => changeGameState('settings')}
          />
        );
    }
  };

  return (
    <div className="app">
      {/* Phase 1 - Touch Controller */}
      <TouchController />
      
      {/* Ana oyun ekranı */}
      {renderCurrentScreen()}
      
      {/* Achievement notification */}
      <AchievementNotification
        achievement={achievementNotification.achievement}
        isVisible={achievementNotification.isVisible}
        onClose={hideAchievementNotification}
      />
    </div>
  );
}

export default App;
