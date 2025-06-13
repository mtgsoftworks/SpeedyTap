import type { CurrencyData } from '../services/CurrencyService';
import './CurrencyDisplay.css';

interface CurrencyDisplayProps {
  currency: CurrencyData;
  onClaimDaily?: () => void;
  showDailyButton?: boolean;
}

const CurrencyDisplay = ({ 
  currency, 
  onClaimDaily, 
  showDailyButton = true 
}: CurrencyDisplayProps) => {
  const today = new Date().toISOString().split('T')[0];
  const canClaimDaily = currency.lastClaimDate !== today;

  return (
    <div className="currency-display">
      <div className="currency-items">
        {/* Coins */}
        <div className="currency-item coins">
          <span className="currency-icon">🪙</span>
          <span className="currency-amount">{currency.coins.toLocaleString()}</span>
        </div>

        {/* Gems */}
        <div className="currency-item gems">
          <span className="currency-icon">💎</span>
          <span className="currency-amount">{currency.gems.toLocaleString()}</span>
        </div>

        {/* XP (in smaller display) */}
        <div className="currency-item xp">
          <span className="currency-icon">⭐</span>
          <span className="currency-amount">{currency.xp.toLocaleString()}</span>
        </div>
      </div>

      {/* Daily Claim Button */}
      {showDailyButton && onClaimDaily && (
        <button 
          className={`daily-claim-button ${canClaimDaily ? 'available' : 'claimed'}`}
          onClick={onClaimDaily}
          disabled={!canClaimDaily}
        >
          {canClaimDaily ? (
            <>
              <span className="daily-icon">🎁</span>
              <span className="daily-text">Günlük</span>
            </>
          ) : (
            <>
              <span className="daily-icon">✅</span>
              <span className="daily-text">Alındı</span>
            </>
          )}
        </button>
      )}

      {/* Login Streak (if applicable) */}
      {currency.loginStreak > 1 && (
        <div className="streak-indicator">
          <span className="streak-fire">🔥</span>
          <span className="streak-count">{currency.loginStreak}</span>
        </div>
      )}
    </div>
  );
};

export default CurrencyDisplay; 