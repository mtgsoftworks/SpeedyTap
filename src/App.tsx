import { useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { adMobService } from './services/AdMobService';
import { audioService } from './services/AudioService';
import { BatteryOptimizer } from './services/BatteryOptimizer';
import { ScreenAdapter } from './services/ScreenAdapter';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import TouchController from './components/TouchController';
import Settings from './components/Settings';
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

export type GameState = 
  | 'splash'
  | 'menu'
  | 'playing'
  | 'paused'
  | 'game_over'
  | 'level_passed'
  | 'about'
  | 'settings';

export interface GameData {
  score: number;
  level: number;
  highScore: number;
  currentTaps: number;
  requiredTaps: number;
  timeLeft: number;
  maxTime: number;
}

function App() {
  // Phase 1 - Performans monitörü görünürlüğü - false olarak ayarlayalım
  const showPerformance = false;

  // Oyun durumu
  const [gameState, setGameState] = useState<GameState>('splash');
  const [gameData, setGameData] = useState<GameData>({
    score: 0,
    level: 1,
    highScore: parseInt(localStorage.getItem('speedytap_highscore') || '0'),
    currentTaps: 0,
    requiredTaps: 10,
    timeLeft: 30000, // 30 saniye başlangıç
    maxTime: 30000
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
  const startNewGame = () => {
    setGameData({
      score: 0,
      level: 1,
      highScore: gameData.highScore,
      currentTaps: 0,
      requiredTaps: 10,
      timeLeft: 30000, // 30 saniye başlangıç
      maxTime: 30000
    });
    changeGameState('playing');
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
          // Oyun sonu interstitial göster
          await adMobService.showGameEndAd();
          break;
        case 'level_passed':
          // Level geçişinde %50 şans ile interstitial
          if (Math.random() > 0.5) {
            await adMobService.showInterstitialAd();
          }
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
              setGameData(prev => ({
                ...prev,
                level: prev.level + 1,
                requiredTaps: prev.requiredTaps + 3, // Her seviyede +3 tıklama
                currentTaps: 0,
                timeLeft: Math.max(15000, prev.maxTime - 1000), // En az 15 saniye, her seviyede -1 saniye
                maxTime: Math.max(15000, prev.maxTime - 1000)
              }));
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
      default:
        return <GameMenu highScore={gameData.highScore} onNewGame={startNewGame} onAbout={() => changeGameState('about')} onSettings={() => changeGameState('settings')} />;
    }
  };

  return (
    <div className="app">
      {/* Phase 1 - Touch Controller */}
      <TouchController />
      
      {/* Ana oyun ekranı */}
      {renderCurrentScreen()}
      
      {/* Phase 1 - Performans Monitörü */}
      <PerformanceMonitor isVisible={showPerformance} />
    </div>
  );
}

export default App;
