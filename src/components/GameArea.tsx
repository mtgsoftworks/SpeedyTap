import { useState, useEffect, useRef, useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { ImpactStyle } from '@capacitor/haptics';
import { audioService } from '../services/AudioService';
import { PowerUpService } from '../services/PowerUpService';
import type { PowerUp } from '../services/PowerUpService';
import { ComboService } from '../services/ComboService';
import { ParticleService } from '../services/ParticleService';
import { ThemeService } from '../services/ThemeService';
import { StatisticsService } from '../services/StatisticsService';
import PowerUpDisplay from './PowerUpDisplay';
import ComboDisplay from './ComboDisplay';
import type { GameData } from '../App';
import './GameArea.css';
import './PowerUpDisplay.css';
import './ComboDisplay.css';

interface GameAreaProps {
  gameData: GameData;
  setGameData: Dispatch<SetStateAction<GameData>>;
  onPause: () => void;
  onGameOver: () => void;
  onLevelPassed: () => void;
  triggerHaptic: (style?: ImpactStyle) => Promise<void>;
}

interface Circle {
  id: number;
  x: number;
  y: number;
  color: 'blue' | 'red';
  size: number;
  isClicked: boolean;
  powerUp?: PowerUp;
  isAutoTapped?: boolean;
}

const GameArea = ({
  gameData,
  setGameData,
  onPause,
  onGameOver,
  onLevelPassed,
  triggerHaptic
}: GameAreaProps) => {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [gameRunning, setGameRunning] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [totalTaps, setTotalTaps] = useState(0);
  const [successfulHits, setSuccessfulHits] = useState(0);
  const [missedHits, setMissedHits] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoTapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const circleIdRef = useRef(0);
  
  // Services
  const powerUpService = PowerUpService.getInstance();
  const comboService = ComboService.getInstance();
  const particleService = ParticleService.getInstance();
  const themeService = ThemeService.getInstance();
  const statisticsService = StatisticsService.getInstance();

  // Initialize services ve state'leri reset et
  useEffect(() => {
    if (particleCanvasRef.current && !isInitialized) {
      particleService.initialize(particleCanvasRef.current);
    }
    
    // State'leri reset et
    setCircles([]);
    setGameRunning(false);
    setShowCountdown(true);
    setCountdown(3);
    setTotalTaps(0);
    setSuccessfulHits(0);
    setMissedHits(0);
    setGameStartTime(Date.now());
    setIsInitialized(true);
    
    // Statistics tracking başlat
    statisticsService.startGame(gameData.level, themeService.getCurrentTheme().id);
    
    // Timers'ı temizle
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Services'ları reset et
    comboService.resetForNewGame();
    powerUpService.clearAllPowerUps();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (autoTapTimerRef.current) {
        clearInterval(autoTapTimerRef.current);
      }
      particleService.cleanup();
    };
  }, [gameData.level]); // gameData.level değiştiğinde yeniden başlat

  // Power-up effects dinleme
  useEffect(() => {
    const unsubscribe = powerUpService.onEffectChange((type, active) => {
      if (type === 'auto_tap' && active) {
        startAutoTap();
      } else if (type === 'auto_tap' && !active) {
        stopAutoTap();
      }
      
      if (type === 'time_boost' && active) {
        // Zaman artırma efekti
        setGameData(prev => ({ 
          ...prev, 
          timeLeft: Math.min(prev.maxTime, prev.timeLeft + 5000) 
        }));
      }
    });

    return unsubscribe;
  }, []);

  // Oyun başlatma countdown'u
  useEffect(() => {
    if (showCountdown && isInitialized) {
      console.log('Countdown başlatılıyor:', countdown);
      const countdownTimer = setInterval(async () => {
        setCountdown(prev => {
          console.log('Countdown:', prev);
          if (prev <= 1) {
            setShowCountdown(false);
            startGame();
            return 0;
          }
          triggerHaptic(ImpactStyle.Light);
          audioService.playCountdown();
          return prev - 1;
        });
      }, 1000);
      return () => {
        console.log('Countdown timer temizleniyor');
        clearInterval(countdownTimer);
      };
    }
  }, [showCountdown, isInitialized, triggerHaptic]);

  // Auto-tap sistem
  const startAutoTap = useCallback(() => {
    if (autoTapTimerRef.current) return;
    
    autoTapTimerRef.current = setInterval(() => {
      setCircles(prev => {
        const untappedCircles = prev.filter(c => !c.isClicked);
        if (untappedCircles.length > 0) {
          const randomCircle = untappedCircles[Math.floor(Math.random() * untappedCircles.length)];
          handleCircleClick(randomCircle, true);
        }
        return prev;
      });
    }, 500); // 0.5 saniyede bir otomatik tap
  }, []);

  const stopAutoTap = useCallback(() => {
    if (autoTapTimerRef.current) {
      clearInterval(autoTapTimerRef.current);
      autoTapTimerRef.current = null;
    }
  }, []);

  // Oyunu başlat
  const startGame = useCallback(() => {
    console.log('Starting game...');
    setGameRunning(true);
    
    // Önceki timer'ı temizle
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    generateCircle();
    
    // Timer başlat
    timerRef.current = setInterval(() => {
      setGameData(prev => {
        // Power-up effect'leri kontrol et
        const effects = powerUpService.getActiveEffects();
        let deltaTime = 50;
        
        // Slow motion effect
        if (effects.slowMotion) {
          deltaTime = deltaTime * effects.slowMotion;
        }
        
        // Freeze time effect
        if (effects.freezeTime) {
          deltaTime = 0;
        }
        
        const newTimeLeft = Math.max(0, prev.timeLeft - deltaTime);
        
        // Power-up'ları güncelle
        powerUpService.update(50);
        
        // Zaman azalırken uyarı sesi (son 3 saniye)
        if (newTimeLeft <= 3000 && newTimeLeft > 2950) {
          audioService.playTimeWarning();
        }
        
        if (newTimeLeft <= 0) {
          endGame();
        }
        
        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 50);
  }, [setGameData]);

  // Oyunu bitir
  const endGame = useCallback(() => {
    console.log('Oyun bitiriliyor...');
    setGameRunning(false);
    stopAutoTap();
    
    // Timer'ı temizle
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Circles'ı temizle
    setCircles([]);
    
    // Statistics kaydet
    statisticsService.endGame(
      gameData.score,
      comboService.getCurrentCombo(),
      totalTaps,
      successfulHits,
      missedHits
    );
    
    // Combo stats kaydet
    comboService.saveComboStats();
    
    audioService.playGameOver();
    onGameOver();
  }, [gameData.score, totalTaps, successfulHits, missedHits, onGameOver]);

  // Rastgele circle oluştur
  const generateCircle = useCallback(async () => {
    if (!gameAreaRef.current || !gameRunning) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const circleSize = 80 + Math.random() * 40;
    const maxX = rect.width - circleSize;
    const maxY = rect.height - circleSize;

    // Power-up şansı kontrol et
    const powerUp = powerUpService.generateRandomPowerUp(gameData.level);
    
    // Theme'den circle color al
    let color: 'blue' | 'red' = Math.random() > 0.5 ? 'blue' : 'red';
    if (themeService.getCurrentTheme().id === 'rainbow') {
      // Rainbow tema için özel renk
      color = 'blue'; // Ana renk, CSS'de rainbow effect olacak
    }

    const newCircle: Circle = {
      id: circleIdRef.current++,
      x: Math.random() * maxX,
      y: Math.random() * maxY,
      color,
      size: circleSize,
      isClicked: false,
      powerUp: powerUp || undefined
    };

    setCircles(prev => [...prev, newCircle]);
    
    await audioService.playCircleAppear();

    // Circle'ı belirli süre sonra kaldır
    const lifetime = 2000 + Math.random() * 1000;
    setTimeout(() => {
      setCircles(prev => {
        const stillExists = prev.find(c => c.id === newCircle.id);
        if (stillExists && !stillExists.isClicked) {
          // Missed hit
          setMissedHits(prev => prev + 1);
          comboService.onMissedHit();
          
          // Miss particle effect
          particleService.createCircleHitEffect(
            newCircle.x + newCircle.size / 2,
            newCircle.y + newCircle.size / 2,
            '#ff4444',
            false
          );
        }
        return prev.filter(c => c.id !== newCircle.id);
      });
    }, lifetime);

  }, [gameRunning, gameData.level]);

  // Circle'a tıklama
  const handleCircleClick = useCallback(async (circle: Circle, isAutoTap = false) => {
    if (!gameRunning || circle.isClicked) return;

    const clickX = circle.x + circle.size / 2;
    const clickY = circle.y + circle.size / 2;

    // Circle'ı tıklanmış olarak işaretle
    setCircles(prev => 
      prev.map(c => c.id === circle.id ? { ...c, isClicked: true, isAutoTapped: isAutoTap } : c)
    );

    // KIRMIZI DAİREYE DOKUNMA - OYUN BİTİŞİ!
    if (circle.color === 'red') {
      // Kırmızı particle effect
      particleService.createCircleHitEffect(clickX, clickY, '#ff0000', false);
      
      // Explosion effect
      particleService.createExplosionEffect(clickX, clickY, '#ff0000', 20);
      
      // Score popup
      particleService.createScorePopup(
        clickX, clickY - 30, 
        'GAME OVER!', 
        '#ff0000', 
        24
      );
      
      // Kırmızı ses efekti
      await audioService.playCircleTap(false);
      await triggerHaptic(ImpactStyle.Heavy);
      
      // Combo'yu sıfırla
      comboService.onMissedHit();
      
      // Oyunu bitir
      setGameRunning(false);
      stopAutoTap();
      
      setTimeout(() => {
        endGame();
      }, 800);
      
      return;
    }

    // Tap timing kaydet
    statisticsService.recordTapTiming(200); // Ortalama response time

    setTotalTaps(prev => prev + 1);
    setSuccessfulHits(prev => prev + 1);

    // Combo sistem
    comboService.onSuccessfulHit();
    
    // Power-up aktive et
    if (circle.powerUp) {
      powerUpService.activatePowerUp(circle.powerUp);
      statisticsService.recordPowerUpUsage(circle.powerUp.type, 100);
      
      // Power-up particle effect
      particleService.createPowerUpEffect(
        clickX, clickY, 
        circle.powerUp.type, 
        circle.powerUp.rarity
      );
    }

    // Skor hesapla
    let points = circle.color === 'blue' ? 10 : 5;
    
    // Power-up effect'lerini uygula
    const effects = powerUpService.getActiveEffects();
    if (effects.scoreMultiplier) {
      points = Math.round(points * effects.scoreMultiplier);
    }
    if (effects.doublePoints) {
      points += (circle.color === 'blue' ? 10 : 5);
    }
    
    // Combo multiplier uygula
    const comboMultiplier = comboService.getComboMultiplier();
    points = Math.round(points * comboMultiplier);

    // Theme'den particle color al
    const themeColors = themeService.getParticleColors();
    const particleColor = themeColors[Math.floor(Math.random() * themeColors.length)];
    
    // Hit particle effect
    particleService.createCircleHitEffect(clickX, clickY, particleColor, true);
    
    // Combo effect
    if (comboService.getCurrentCombo() > 1) {
      const streakLevel = comboService.getCurrentStreakLevel();
      particleService.createComboEffect(
        clickX, clickY, 
        comboService.getCurrentCombo(), 
        streakLevel.color
      );
    }
    
    // Score popup
    particleService.createScorePopup(
      clickX, clickY - 30, 
      `+${points}`, 
      particleColor, 
      18
    );
    
    setGameData(prev => {
      const newCurrentTaps = prev.currentTaps + 1;
      const newScore = prev.score + points;
      
      // Level geçiş kontrolü
      if (newCurrentTaps >= prev.requiredTaps) {
        setGameRunning(false);
        statisticsService.recordLevelCompletion(gameData.level, Date.now() - gameStartTime);
        
        // Perfect streak kontrolü
        if (comboService.getCurrentCombo() >= prev.requiredTaps) {
          statisticsService.recordPerfectStreak();
        }
        
        audioService.playLevelPassed();
        setTimeout(() => onLevelPassed(), 500);
      }
      
      return {
        ...prev,
        score: newScore,
        currentTaps: newCurrentTaps
      };
    });

    // Haptic feedback ve ses
    triggerHaptic(circle.color === 'blue' ? ImpactStyle.Medium : ImpactStyle.Light);
    await audioService.playCircleTap(circle.color === 'blue');

    // Circle'ı kaldır
    setTimeout(() => {
      setCircles(prev => prev.filter(c => c.id !== circle.id));
    }, 200);

  }, [gameRunning, gameData.level, gameStartTime, setGameData, onLevelPassed, triggerHaptic]);

  // Play area'ya tıklama (miss)
  const handlePlayAreaClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!gameRunning) return;
    
    // Eğer circle'a tıklanmadıysa miss
    const target = event.target as HTMLElement;
    if (target.classList.contains('play-area')) {
      // Shield effect kontrol et
      const effects = powerUpService.getActiveEffects();
      if (!effects.shieldActive) {
        setMissedHits(prev => prev + 1);
        comboService.onMissedHit();
        statisticsService.recordComboBreak();
        
        // Miss effect
        const rect = target.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        particleService.createCircleHitEffect(clickX, clickY, '#ff4444', false);
      }
    }
  }, [gameRunning]);

  // Yeni circle'lar oluşturmaya devam et
  useEffect(() => {
    if (!gameRunning || showCountdown) return;

    const generateInterval = setInterval(() => {
      if (circles.length < 3) {
        generateCircle();
      }
    }, 800 + Math.random() * 400);

    return () => clearInterval(generateInterval);
  }, [gameRunning, showCountdown, circles.length, generateCircle]);

  // Component unmount olduğunda temizlik
  useEffect(() => {
    return () => {
      console.log('GameArea unmounting...');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (autoTapTimerRef.current) {
        clearInterval(autoTapTimerRef.current);
      }
    };
  }, []);

  const timeProgress = (gameData.timeLeft / gameData.maxTime) * 100;

  if (showCountdown) {
    return (
      <div className="game-area countdown-screen">
        <div className="countdown-content">
          <div className="countdown-number">{countdown > 0 ? countdown : "GO!"}</div>
          <p>{countdown > 0 ? "Hazır ol!" : "Başla!"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-area">
      {/* Particle Canvas */}
      <canvas 
        ref={particleCanvasRef}
        className="particle-canvas"
        width={window.innerWidth}
        height={window.innerHeight}
      />
      
      {/* Power-up Display */}
      <PowerUpDisplay position="top" compact={false} />
      
      {/* Combo Display */}
      <ComboDisplay 
        position="center" 
        showMultiplier={true} 
        showTimeRemaining={true} 
      />

      {/* Oyun istatistikleri */}
      <div className="game-stats">
        <div className="time-progress">
          <div 
            className="time-bar"
            style={{ width: `${timeProgress}%` }}
          />
        </div>
        
        <div className="stats-row">
          <button className="pause-btn" onClick={onPause}>
            ⏸️
          </button>
          
          <div className="score-info">
            <span className="score-label">Skor</span>
            <span className="score-value">{gameData.score.toLocaleString()}</span>
          </div>
          
          <div className="level-info">
            <span className="level-label">Seviye {gameData.level}</span>
            <span className="tap-count">
              {gameData.currentTaps}/{gameData.requiredTaps}
            </span>
          </div>
          
          <div className="accuracy-info">
            <span className="accuracy-label">İsabet</span>
            <span className="accuracy-value">
              {totalTaps > 0 ? Math.round((successfulHits / totalTaps) * 100) : 100}%
            </span>
          </div>
        </div>
      </div>

      {/* Oyun alanı */}
      <div 
        className="play-area" 
        ref={gameAreaRef}
        onClick={handlePlayAreaClick}
      >
        {circles.map(circle => {
          // Rainbow theme için özel renk
          const circleColor = themeService.getCurrentTheme().id === 'rainbow' 
            ? themeService.getRainbowCircleColor(circle.id)
            : undefined;
            
          return (
            <div
              key={circle.id}
              className={`game-circle ${circle.color} ${circle.isClicked ? 'clicked' : ''} ${circle.powerUp ? 'has-powerup' : ''} ${circle.isAutoTapped ? 'auto-tapped' : ''}`}
              style={{
                left: circle.x,
                top: circle.y,
                width: circle.size,
                height: circle.size,
                backgroundColor: circleColor,
                borderColor: circleColor,
                ...(circle.powerUp && {
                  boxShadow: `0 0 20px ${circle.powerUp.rarity === 'legendary' ? '#FFD700' : 
                    circle.powerUp.rarity === 'epic' ? '#8B5CF6' : 
                    circle.powerUp.rarity === 'rare' ? '#3B82F6' : '#9CA3AF'}`
                })
              }}
              onClick={() => handleCircleClick(circle)}
            >
              {circle.powerUp && (
                <div className="powerup-icon">
                  {circle.powerUp.icon}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameArea; 