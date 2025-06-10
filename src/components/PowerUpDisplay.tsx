import React, { useState, useEffect } from 'react';
import { PowerUpService } from '../services/PowerUpService';
import type { ActivePowerUp } from '../services/PowerUpService';
import './PowerUpDisplay.css';

interface PowerUpDisplayProps {
  position?: 'top' | 'bottom' | 'side';
  compact?: boolean;
}

const PowerUpDisplay: React.FC<PowerUpDisplayProps> = ({ 
  position = 'top', 
  compact = false 
}) => {
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const powerUpService = PowerUpService.getInstance();

  useEffect(() => {
    const unsubscribe = powerUpService.onPowerUpChange((powerUps) => {
      setActivePowerUps(powerUps);
    });

    // İlk yükleme
    setActivePowerUps(powerUpService.getActivePowerUps());

    return unsubscribe;
  }, [powerUpService]);

  const formatTimeRemaining = (remaining: number): string => {
    const seconds = Math.ceil(remaining / 1000);
    return `${seconds}s`;
  };

  const getProgressPercentage = (active: ActivePowerUp): number => {
    const elapsed = Date.now() - active.startTime;
    const progress = elapsed / active.powerUp.duration;
    return Math.max(0, Math.min(100, (1 - progress) * 100));
  };

  const getRarityClass = (rarity: string): string => {
    return `powerup-rarity-${rarity}`;
  };

  if (activePowerUps.length === 0) {
    return null;
  }

  return (
    <div className={`powerup-display powerup-display-${position} ${compact ? 'compact' : ''}`}>
      <div className="powerup-header">
        <span className="powerup-title">
          {compact ? '⚡' : '⚡ Aktif Güçler'}
        </span>
      </div>
      
      <div className="powerup-list">
        {activePowerUps.map((active) => (
          <div 
            key={active.powerUp.id} 
            className={`powerup-item ${getRarityClass(active.powerUp.rarity)}`}
          >
            <div className="powerup-icon">
              {active.powerUp.icon}
            </div>
            
            {!compact && (
              <div className="powerup-info">
                <div className="powerup-name">
                  {active.powerUp.name}
                </div>
                <div className="powerup-description">
                  {active.powerUp.description}
                </div>
              </div>
            )}
            
            <div className="powerup-timer">
              <div className="powerup-time-text">
                {formatTimeRemaining(active.remaining)}
              </div>
              <div className="powerup-progress">
                <div 
                  className="powerup-progress-bar"
                  style={{ width: `${getProgressPercentage(active)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Combo effect display */}
      {!compact && (
        <div className="powerup-effects">
          {activePowerUps.map((active) => (
            <div key={`effect-${active.powerUp.id}`} className="powerup-effect">
              {active.powerUp.effect.scoreMultiplier && (
                <span className="effect-multiplier">
                  {active.powerUp.effect.scoreMultiplier}x Skor
                </span>
              )}
              {active.powerUp.effect.slowMotion && (
                <span className="effect-slow">
                  {Math.round((1 - active.powerUp.effect.slowMotion) * 100)}% Yavaş
                </span>
              )}
              {active.powerUp.effect.autoTap && (
                <span className="effect-auto">
                  Otomatik Dokunuş
                </span>
              )}
              {active.powerUp.effect.shieldActive && (
                <span className="effect-shield">
                  Kalkan Aktif
                </span>
              )}
              {active.powerUp.effect.doublePoints && (
                <span className="effect-double">
                  Çifte Puan
                </span>
              )}
              {active.powerUp.effect.freezeTime && (
                <span className="effect-freeze">
                  Zaman Durdu
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PowerUpDisplay; 