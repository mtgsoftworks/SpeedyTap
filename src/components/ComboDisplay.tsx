import React, { useState, useEffect } from 'react';
import { ComboService } from '../services/ComboService';
import type { ComboEvent, StreakLevel } from '../services/ComboService';
import './ComboDisplay.css';

interface ComboDisplayProps {
  position?: 'center' | 'top-right' | 'bottom';
  showMultiplier?: boolean;
  showTimeRemaining?: boolean;
}

const ComboDisplay: React.FC<ComboDisplayProps> = ({ 
  position = 'center',
  showMultiplier = true,
  showTimeRemaining = true
}) => {
  const [currentCombo, setCurrentCombo] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [streakLevel, setStreakLevel] = useState<StreakLevel | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [animation, setAnimation] = useState<string>('');
  const [lastEvent, setLastEvent] = useState<ComboEvent | null>(null);

  const comboService = ComboService.getInstance();

  useEffect(() => {
    const unsubscribe = comboService.onComboEvent((event) => {
      setLastEvent(event);
      handleComboEvent(event);
    });

    // Timer için interval
    const timer = setInterval(() => {
      const remaining = comboService.getComboTimeRemaining();
      setTimeRemaining(remaining);
      
      // Combo state güncelle
      setCurrentCombo(comboService.getCurrentCombo());
      setComboMultiplier(comboService.getComboMultiplier());
      setStreakLevel(comboService.getCurrentStreakLevel());
      setIsVisible(comboService.isComboActive());
    }, 100);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [comboService]);

  const handleComboEvent = (event: ComboEvent) => {
    switch (event.type) {
      case 'combo_start':
        setAnimation('combo-start');
        setTimeout(() => setAnimation(''), 500);
        break;
        
      case 'combo_increase':
        setAnimation('combo-increase');
        setTimeout(() => setAnimation(''), 300);
        break;
        
      case 'combo_break':
        setAnimation('combo-break');
        setTimeout(() => setAnimation(''), 800);
        break;
        
      case 'streak_level_up':
        setAnimation('streak-level-up');
        setTimeout(() => setAnimation(''), 1000);
        break;
    }
  };

  const getStreakLevelClass = (): string => {
    if (!streakLevel) return '';
    
    const levelMap: { [key: string]: string } = {
      'Başlangıç': 'streak-normal',
      'İyi': 'streak-good',
      'Harika': 'streak-great',
      'Mükemmel': 'streak-perfect',
      'Efsane': 'streak-legendary',
      'İmkansız': 'streak-impossible',
      'Tanrısal': 'streak-godlike'
    };
    
    return levelMap[streakLevel.name] || 'streak-normal';
  };

  const formatTimeRemaining = (): string => {
    const seconds = Math.ceil(timeRemaining / 1000);
    return `${seconds}s`;
  };

  const getTimePercentage = (): number => {
    const maxTime = 2000; // 2 seconds default
    return Math.max(0, (timeRemaining / maxTime) * 100);
  };

  const getComboSize = (): string => {
    if (currentCombo >= 100) return 'combo-huge';
    if (currentCombo >= 50) return 'combo-large';
    if (currentCombo >= 25) return 'combo-medium';
    if (currentCombo >= 10) return 'combo-small';
    return '';
  };

  if (!isVisible || currentCombo === 0) {
    return null;
  }

  return (
    <div className={`combo-display combo-display-${position} ${animation} ${getStreakLevelClass()} ${getComboSize()}`}>
      {/* Ana combo sayısı */}
      <div className="combo-main">
        <div className="combo-number">
          {currentCombo}
        </div>
        <div className="combo-label">
          COMBO
        </div>
      </div>

      {/* Streak level gösterimi */}
      {streakLevel && streakLevel.name !== 'Başlangıç' && (
        <div className="combo-streak">
          <div className="streak-icon">
            {streakLevel.icon}
          </div>
          <div className="streak-name">
            {streakLevel.name}
          </div>
        </div>
      )}

      {/* Multiplier gösterimi */}
      {showMultiplier && comboMultiplier > 1 && (
        <div className="combo-multiplier">
          <span className="multiplier-text">
            {comboMultiplier.toFixed(1)}x
          </span>
          <span className="multiplier-label">
            Çarpan
          </span>
        </div>
      )}

      {/* Zaman gösterimi */}
      {showTimeRemaining && timeRemaining > 0 && (
        <div className="combo-timer">
          <div className="timer-text">
            {formatTimeRemaining()}
          </div>
          <div className="timer-progress">
            <div 
              className="timer-progress-bar"
              style={{ width: `${getTimePercentage()}%` }}
            />
          </div>
        </div>
      )}

      {/* Özel event mesajları */}
      {lastEvent?.type === 'streak_level_up' && (
        <div className="streak-level-up-message">
          <div className="level-up-text">
            LEVEL UP!
          </div>
          <div className="level-up-name">
            {lastEvent.streakLevel?.name}
          </div>
        </div>
      )}

      {/* Combo milestone mesajları */}
      {currentCombo > 0 && currentCombo % 25 === 0 && (
        <div className="combo-milestone">
          <div className="milestone-text">
            🔥 INCREDIBLE! 🔥
          </div>
        </div>
      )}

      {/* Break effect */}
      {animation === 'combo-break' && (
        <div className="combo-break-overlay">
          <div className="break-text">
            COMBO BROKEN
          </div>
          <div className="break-icon">
            💥
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboDisplay; 