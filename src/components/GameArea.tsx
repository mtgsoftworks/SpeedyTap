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
import { CurrencyService } from '../services/CurrencyService';
import type { Achievement } from '../services/StatisticsService';
import PowerUpDisplay from './PowerUpDisplay';
import ComboDisplay from './ComboDisplay';
import type { GameData } from '../App';
import Logger from '../utils/Logger';
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
  showAchievementNotification: (achievement: Achievement) => void;
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
  // Dinamik efektler için
  isMoving?: boolean;
  moveSpeed?: number;
  colorTransition?: {
    from: string;
    to: string;
    duration: number;
    startTime: number;
  };
  currentColor?: string;
  rotation?: number;
  rotationSpeed?: number;
  pulsating?: boolean;
  trail?: boolean;
  chaosMode?: boolean;
  glitchEffect?: boolean;
  morphing?: boolean;
  ultraCombo?: boolean;
  // Orijinal pozisyonlar - hareket için
  originalX?: number;
  originalY?: number;
  startTime?: number; // Animasyon başlangıç zamanı
}

const GameArea = ({
  gameData,
  setGameData,
  onPause,
  onGameOver,
  onLevelPassed,
  triggerHaptic,
  showAchievementNotification
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
  const circleTimeouts = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const lastTapTime = useRef<number>(0);
  const tappedCircles = useRef<Set<number>>(new Set());
  const circlePool = useRef<Circle[]>([]);
  const poolIndex = useRef<number>(0);
  const animationFrame = useRef<number>(0);
  
  // Services
  const powerUpService = PowerUpService.getInstance();
  const comboService = ComboService.getInstance();
  const particleService = ParticleService.getInstance();
  const themeService = ThemeService.getInstance();
  const statisticsService = StatisticsService.getInstance();
  const currencyService = CurrencyService.getInstance();

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
    
    // Reset refs
    circleTimeouts.current.clear();
    tappedCircles.current.clear();
    lastTapTime.current = 0;
    
    // Initialize circle pool
    if (circlePool.current.length === 0) {
      for (let i = 0; i < 20; i++) {
        circlePool.current.push({
          id: i,
          x: 0,
          y: 0,
          color: 'blue',
          size: 60,
          isClicked: false
        });
      }
    }
    poolIndex.current = 0;
    
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
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      particleService.cleanup();
    };
  }, [gameData.level]); // gameData.level değiştiğinde yeniden başlat

  // Game state değişikliklerini dinle - PAUSE/RESUME için
  useEffect(() => {
    if (!gameRunning) {
      // Oyun durdu - combo pause et
      comboService.pauseCombo();
    } else if (gameRunning && !showCountdown) {
      // Oyun devam ediyor - combo resume et
      comboService.resumeCombo();
    }
  }, [gameRunning, showCountdown]);

  // Circle animasyon güncelleme loop'u
  const updateCircleAnimations = useCallback(() => {
    if (!gameRunning) return;
    
    setCircles(prev => {
      const now = Date.now();
      return prev.map(circle => {
        if (circle.isClicked) return circle;
        
        let updatedCircle = { ...circle };
        
        // Hareket efekti - orijinal pozisyonları kullan
        if (updatedCircle.isMoving && updatedCircle.moveSpeed && updatedCircle.originalX !== undefined && updatedCircle.originalY !== undefined && updatedCircle.startTime && gameAreaRef.current) {
          const rect = gameAreaRef.current.getBoundingClientRect();
          const elapsedTime = (now - updatedCircle.startTime) / 1000; // Saniye cinsinden
          const angle = elapsedTime * updatedCircle.moveSpeed; // Hız faktörü
          
          // Orijinal pozisyondan sinüs dalgası ile hareket
          const amplitude = Math.min(25, rect.width * 0.08); // Ekran boyutuna göre dinamik amplitude
          
          updatedCircle.x = updatedCircle.originalX + Math.sin(angle) * amplitude;
          updatedCircle.y = updatedCircle.originalY + Math.cos(angle * 0.7) * amplitude * 0.6;
          
          // Sınırları kontrol et
          updatedCircle.x = Math.max(0, Math.min(rect.width - updatedCircle.size, updatedCircle.x));
          updatedCircle.y = Math.max(0, Math.min(rect.height - updatedCircle.size, updatedCircle.y));
        }
        
        // Döndürme efekti
        if (updatedCircle.rotationSpeed) {
          updatedCircle.rotation = (updatedCircle.rotation || 0) + updatedCircle.rotationSpeed;
        }
        
        // Renk geçişi efekti
        if (updatedCircle.colorTransition && now >= updatedCircle.colorTransition.startTime) {
          const elapsed = now - updatedCircle.colorTransition.startTime;
          const progress = Math.min(elapsed / updatedCircle.colorTransition.duration, 1);
          
          if (progress >= 1) {
            // Geçiş tamamlandı
            updatedCircle.currentColor = updatedCircle.colorTransition.to;
            updatedCircle.colorTransition = undefined;
          } else {
            // Renkleri interpolate et
            const fromColor = hexToRgb(updatedCircle.colorTransition.from);
            const toColor = hexToRgb(updatedCircle.colorTransition.to);
            
            if (fromColor && toColor) {
              const r = Math.round(fromColor.r + (toColor.r - fromColor.r) * progress);
              const g = Math.round(fromColor.g + (toColor.g - fromColor.g) * progress);
              const b = Math.round(fromColor.b + (toColor.b - fromColor.b) * progress);
              updatedCircle.currentColor = `rgb(${r},${g},${b})`;
            }
          }
        }
        
        return updatedCircle;
      });
    });
    
    if (gameRunning) {
      animationFrame.current = requestAnimationFrame(updateCircleAnimations);
    }
  }, [gameRunning]);

  // Hex to RGB conversion helper
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Animation loop'u başlat
  useEffect(() => {
    if (gameRunning) {
      // Önceki frame'i iptal et
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      updateCircleAnimations();
    } else {
      // Oyun durduğunda frame'i iptal et
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = 0;
      }
    }
    
    // Cleanup function
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [gameRunning]); // updateCircleAnimations dependency'sini kaldır

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
      Logger.log('Countdown başlatılıyor:', countdown);
      const countdownTimer = setInterval(async () => {
        setCountdown(prev => {
          Logger.log('Countdown:', prev);
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
        Logger.log('Countdown timer temizleniyor');
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
          // handleCircleClick yerine doğrudan circle click mantığını uygula
          if (!randomCircle.isClicked) {
            handleCircleClick(randomCircle, true);
          }
        }
        return prev;
      });
    }, 500); // 0.5 saniyede bir otomatik tap
  }, []); // Dependency kaldırıldı

  const stopAutoTap = useCallback(() => {
    if (autoTapTimerRef.current) {
      clearInterval(autoTapTimerRef.current);
      autoTapTimerRef.current = null;
    }
  }, []);

  // Oyunu başlat
  const startGame = useCallback(() => {
    Logger.log('Starting game...');
    setGameRunning(true);
    
    // Önceki timer'ları temizle
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (autoTapTimerRef.current) {
      clearInterval(autoTapTimerRef.current);
      autoTapTimerRef.current = null;
    }
    
    // Önceki timeout'ları temizle
    circleTimeouts.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    circleTimeouts.current.clear();
    tappedCircles.current.clear();
    
    // İlk circle'ı oluştur
    setTimeout(() => {
      generateCircle();
    }, 100);
    
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
          // Game over logic burada
          setGameRunning(false);
          setTimeout(() => {
            onGameOver();
          }, 100);
        }
        
        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 50);
  }, []);

  // Oyunu bitir
  const endGame = useCallback(() => {
    Logger.log('Oyun bitiriliyor...');
    setGameRunning(false);
    
    // Timer'ları temizle
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (autoTapTimerRef.current) {
      clearInterval(autoTapTimerRef.current);
      autoTapTimerRef.current = null;
    }
    
    // Animation frame'i temizle
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = 0;
    }
    
    // Tüm circle timeout'larını temizle - MEMORY LEAK ÇÖZÜMü
    circleTimeouts.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    circleTimeouts.current.clear();
    tappedCircles.current.clear();
    
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
    
    // Currency kazanımları hesapla ve ver
    const accuracy = totalTaps > 0 ? (successfulHits / totalTaps) * 100 : 0;
    const earnings = currencyService.calculateGameEarnings(
      gameData.score,
      gameData.level,
      comboService.getCurrentCombo(),
      accuracy
    );
    
    // Para kazanımlarını uygula
    earnings.forEach(earning => {
      currencyService.earnCurrency(earning);
    });
    
    // Achievement'ları kontrol et
    const newAchievements = statisticsService.checkAchievements();
    
    // Yeni achievement varsa notification göster
    if (newAchievements.length > 0) {
      // İlk achievement'ı göster (birden fazla varsa sırayla göstermek için timeout kullanabiliriz)
      setTimeout(() => {
        showAchievementNotification(newAchievements[0]);
      }, 1000);
    }
    
    audioService.playGameOver();
    onGameOver();
  }, [gameData.score, gameData.level, totalTaps, successfulHits, missedHits, onGameOver, showAchievementNotification]);

  // Collision detection için yardımcı fonksiyon
  const checkCircleCollision = useCallback((x: number, y: number, size: number, existingCircles: Circle[]): boolean => {
    for (const circle of existingCircles) {
      if (circle.isClicked) continue; // Tıklanmış circle'ları göz ardı et
      
      const dx = x - circle.x;
      const dy = y - circle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = (size + circle.size) / 2 + 20; // 20px buffer
      
      if (distance < minDistance) {
        return true; // Çakışma var
      }
    }
    return false; // Çakışma yok
  }, []);

  // Rastgele circle oluştur
  const generateCircle = useCallback(async () => {
    if (!gameAreaRef.current || !gameRunning) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    
    // Seviye bazlı zorluk - circle boyutu küçülür
    const baseSizeMin = Math.max(45, 60 - gameData.level * 2); // Her seviyede -2px
    const baseSizeMax = Math.max(60, 90 - gameData.level * 2); // Her seviyede -2px
    const circleSize = baseSizeMin + Math.random() * (baseSizeMax - baseSizeMin);
    
    const maxX = rect.width - circleSize;
    const maxY = rect.height - circleSize;

    // Theme'den circle color al
    let color: 'blue' | 'red' = Math.random() > 0.5 ? 'blue' : 'red';
    
    // Seviye ilerledikçe kırmızı circle şansı artar
    const redChance = Math.min(0.6, 0.3 + (gameData.level * 0.02)); // Level 1: %32, Level 10: %50, Level 15+: %60
    if (Math.random() < redChance) {
      color = 'red';
    }
    
    // Game mode'a göre özel davranışlar
    if (gameData.gameMode === 'survival') {
      // Survival mode'da daha fazla kırmızı circle
      if (Math.random() < 0.7) {
        color = 'red';
      }
    } else if (gameData.gameMode === 'target') {
      // Target mode'da sadece mavi circle'lar (hedef için)
      color = 'blue';
    }
    
    if (themeService.getCurrentTheme().id === 'rainbow') {
      // Rainbow tema için özel renk
      color = 'blue'; // Ana renk, CSS'de rainbow effect olacak
    }

    // Power-up şansı kontrol et - sadece mavi daireler için
    const powerUp = color === 'blue' ? powerUpService.generateRandomPowerUp(gameData.level) : null;

    // Collision detection ile güvenli pozisyon bul
    let x, y;
    let attempts = 0;
    const maxAttempts = 50;
    
    // Current circles'ı al
    const currentCircles = circles;
    
    do {
      x = Math.random() * maxX;
      y = Math.random() * maxY;
      attempts++;
    } while (
      attempts < maxAttempts && 
      checkCircleCollision(x, y, circleSize, currentCircles)
    );
    
    // Eğer 50 denemede pozisyon bulunamadıysa, rastgele yerleştir
    if (attempts >= maxAttempts) {
      x = Math.random() * maxX;
      y = Math.random() * maxY;
    }

    // Seviye bazlı dinamik efektler - oranlar seviye ile artıyor
    const levelFactor = Math.min(gameData.level / 50, 1); // 0-1 arası
    
    const shouldMove = gameData.level >= 8 && Math.random() < (0.15 + levelFactor * 0.25); // %15-40 arası
    const shouldColorTransition = gameData.level >= 12 && Math.random() < (0.2 + levelFactor * 0.3); // %20-50 arası
    const shouldRotate = gameData.level >= 15 && Math.random() < (0.25 + levelFactor * 0.35); // %25-60 arası
    const shouldPulsate = gameData.level >= 20 && Math.random() < (0.15 + levelFactor * 0.25); // %15-40 arası
    const shouldTrail = gameData.level >= 25 && Math.random() < (0.1 + levelFactor * 0.2); // %10-30 arası
    
    // Extreme efektler - çok yüksek seviyeler için
    const shouldChaos = gameData.level >= 30 && Math.random() < (levelFactor * 0.15);
    const shouldGlitch = gameData.level >= 35 && Math.random() < (levelFactor * 0.12);
    const shouldMorph = gameData.level >= 40 && Math.random() < (levelFactor * 0.1);
    const shouldUltraCombo = gameData.level >= 45 && Math.random() < (levelFactor * 0.08);

    let colorTransition = undefined;
    let currentColor = color === 'blue' ? '#4fd1c7' : '#ff6b6b';

    if (shouldColorTransition) {
      // Kırmızıdan maviye veya maviden kırmızıya geçiş
      const fromColor = color === 'blue' ? '#4fd1c7' : '#ff6b6b';
      const toColor = color === 'blue' ? '#ff6b6b' : '#4fd1c7';
      
      colorTransition = {
        from: fromColor,
        to: toColor,
        duration: 2000 + Math.random() * 3000, // 2-5 saniye arası
        startTime: Date.now() + Math.random() * 1000 // 0-1 saniye gecikme
      };
      currentColor = fromColor;
    }

    const newCircle: Circle = {
      id: circleIdRef.current++,
      x,
      y,
      color,
      size: circleSize,
      isClicked: false,
      powerUp: powerUp || undefined,
      // Dinamik efektler
      isMoving: shouldMove,
      moveSpeed: shouldMove ? 0.3 + Math.random() * 1.2 : 0, // 0.3-1.5 piksel/frame (daha yavaş)
      colorTransition,
      currentColor,
      rotation: 0,
      rotationSpeed: shouldRotate ? (Math.random() - 0.5) * 3 : 0, // -1.5 to +1.5 derece/frame (daha yavaş)
      pulsating: shouldPulsate,
      trail: shouldTrail,
      // Ek özellikler
      chaosMode: shouldChaos,
      glitchEffect: shouldGlitch,
      morphing: shouldMorph,
      ultraCombo: shouldUltraCombo,
      // Orijinal pozisyonlar - hareket için
      originalX: x,
      originalY: y,
      startTime: Date.now()
    };

    setCircles(prev => [...prev, newCircle]);
    
    await audioService.playCircleAppear();

    // Circle'ı belirli süre sonra kaldır - seviye bazlı zorluk
    const baseLifetime = Math.max(1500, 2500 - gameData.level * 50); // Her seviyede -50ms, minimum 1.5s
    let lifetime = baseLifetime + Math.random() * 1000;
    
    // Game mode'a göre lifetime ayarla
    if (gameData.gameMode === 'speed') {
      lifetime = Math.max(800, lifetime * 0.5); // Speed mode'da yarı süre, minimum 0.8s
    } else if (gameData.gameMode === 'survival') {
      lifetime = lifetime * 0.8; // Survival'da biraz daha hızlı
    }
    
    const timeoutId = setTimeout(() => {
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

    circleTimeouts.current.set(newCircle.id, timeoutId);

  }, [gameRunning, gameData.level, gameData.gameMode]); // Sadece gerekli dependency'ler

  // Circle'a tıklama
  const handleCircleClick = useCallback(async (circle: Circle, isAutoTap = false) => {
    if (!gameRunning || circle.isClicked) return;

    // Double tap prevention
    const now = Date.now();
    if (now - lastTapTime.current < 100) return; // 100ms double-tap koruması
    if (tappedCircles.current.has(circle.id)) return; // Bu circle'a zaten tıklanmış
    
    lastTapTime.current = now;
    tappedCircles.current.add(circle.id);

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
    
    // Accuracy bonus - yüksek accuracy için bonus
    const accuracy = totalTaps > 0 ? (successfulHits / totalTaps) * 100 : 100;
    if (accuracy >= 90) {
      points = Math.round(points * 1.5); // %90+ accuracy için %50 bonus
    } else if (accuracy >= 80) {
      points = Math.round(points * 1.2); // %80+ accuracy için %20 bonus
    }
    
    // Streak bonus - ardışık doğru tıklamalar için bonus
    const currentCombo = comboService.getCurrentCombo();
    if (currentCombo >= 20) {
      points = Math.round(points * 2); // 20+ combo için double points
    } else if (currentCombo >= 10) {
      points = Math.round(points * 1.5); // 10+ combo için %50 bonus
    } else if (currentCombo >= 5) {
      points = Math.round(points * 1.2); // 5+ combo için %20 bonus
    }
    
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
      // Timeout'u da temizle
      const timeoutId = circleTimeouts.current.get(circle.id);
      if (timeoutId) {
        clearTimeout(timeoutId);
        circleTimeouts.current.delete(circle.id);
      }
      // Tapped circles'dan da temizle
      tappedCircles.current.delete(circle.id);
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
      const activeCircles = circles.filter(c => !c.isClicked);
      const maxCircles = Math.min(3, Math.floor(gameAreaRef.current?.getBoundingClientRect().width! / 150) || 3);
      
      if (activeCircles.length < maxCircles) {
        generateCircle();
      }
    }, 1200 + Math.random() * 600); // Biraz daha uzun interval

    return () => clearInterval(generateInterval);
  }, [gameRunning, showCountdown, circles.length, generateCircle]);

  // Component unmount olduğunda temizlik
  useEffect(() => {
    return () => {
      Logger.log('GameArea unmounting...');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (autoTapTimerRef.current) {
        clearInterval(autoTapTimerRef.current);
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      // Circle timeout'larını temizle - MEMORY LEAK ÇÖZÜMü
      circleTimeouts.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      circleTimeouts.current.clear();
      tappedCircles.current.clear();
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

  // Game area'ya seviye bazlı sınıf ekle
  const gameAreaClasses = ['game-area'];
  if (gameData.level >= 50) gameAreaClasses.push('legendary-mode');
  else if (gameData.level >= 30) gameAreaClasses.push('extreme-mode');

  return (
    <div className={gameAreaClasses.join(' ')}>
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

          // Dinamik CSS sınıflarını oluştur
          const dynamicClasses = [];
          
          // Seviye bazlı efektler
          if (circle.isMoving && gameData.level >= 8) dynamicClasses.push('moving');
          if (circle.colorTransition && gameData.level >= 12) dynamicClasses.push('color-transition');
          if (circle.rotationSpeed && gameData.level >= 15) dynamicClasses.push('rotating');
          if (circle.pulsating && gameData.level >= 20) dynamicClasses.push('pulsating');
          if (circle.trail && gameData.level >= 25) dynamicClasses.push('trail');
          
          // Extreme level efektleri
          if (circle.chaosMode) dynamicClasses.push('chaos-mode');
          if (circle.glitchEffect) dynamicClasses.push('glitch');
          if (circle.morphing) dynamicClasses.push('morphing');
          if (circle.ultraCombo) dynamicClasses.push('ultra-combo');

          // Renk ve stil hesaplamaları
          const finalBackgroundColor = circle.currentColor || circleColor;
          const rotationTransform = circle.rotation ? `rotate(${circle.rotation}deg)` : '';
            
          return (
            <div
              key={circle.id}
              className={`game-circle ${circle.color} ${circle.isClicked ? 'clicked' : ''} ${circle.powerUp ? 'has-powerup' : ''} ${circle.isAutoTapped ? 'auto-tapped' : ''} ${dynamicClasses.join(' ')}`}
              style={{
                left: circle.x,
                top: circle.y,
                width: circle.size,
                height: circle.size,
                backgroundColor: finalBackgroundColor,
                borderColor: finalBackgroundColor,
                transform: rotationTransform,
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