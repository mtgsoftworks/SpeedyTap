import { useState, useEffect } from 'react';

import type { ShopCategory } from '../services/ShopService';
import { CurrencyService } from '../services/CurrencyService';
import type { CurrencyData } from '../services/CurrencyService';
import { ImpactStyle } from '@capacitor/haptics';
import ShopCategoryComponent from './ShopCategory';
import CurrencyDisplay from './CurrencyDisplay';
import './Shop.css';

interface ShopProps {
  onBack: () => void;
  triggerHaptic?: (style?: ImpactStyle) => Promise<void>;
}

const Shop = ({ onBack, triggerHaptic }: ShopProps) => {
  const [activeCategory, setActiveCategory] = useState<ShopCategory>('powerups');
  const [currency, setCurrency] = useState<CurrencyData | null>(null);
  const [purchaseMessage, setPurchaseMessage] = useState<{
    text: string;
    type: 'success' | 'error';
    visible: boolean;
  }>({
    text: '',
    type: 'success',
    visible: false
  });


  const currencyService = CurrencyService.getInstance();

  useEffect(() => {
    // Initialize currency data
    setCurrency(currencyService.getCurrencyData());
    
    // Initialize shop service

    // Listen to currency changes
    const handleCurrencyUpdate = (newCurrency: CurrencyData) => {
      setCurrency(newCurrency);
    };

    currencyService.addListener(handleCurrencyUpdate);

    return () => {
      currencyService.removeListener(handleCurrencyUpdate);
    };
  }, []);

  const categories: { id: ShopCategory; name: string; icon: string }[] = [
    { id: 'powerups', name: 'Güçlendirici', icon: '⚡' },
    { id: 'themes', name: 'Temalar', icon: '🎨' },
    { id: 'boosts', name: 'Destekler', icon: '🚀' },
    { id: 'cosmetics', name: 'Kozmetik', icon: '✨' },
    { id: 'bundles', name: 'Paketler', icon: '📦' }
  ];

  const handleCategoryChange = async (category: ShopCategory) => {
    if (triggerHaptic) {
      await triggerHaptic(ImpactStyle.Light);
    }
    setActiveCategory(category);
  };

  const handlePurchaseSuccess = (message: string) => {
    setPurchaseMessage({
      text: message,
      type: 'success',
      visible: true
    });
    
    // Update shop items
    
    // Hide message after 3 seconds
    setTimeout(() => {
      setPurchaseMessage(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handlePurchaseError = (message: string) => {
    setPurchaseMessage({
      text: message,
      type: 'error',
      visible: true
    });
    
    // Hide message after 3 seconds
    setTimeout(() => {
      setPurchaseMessage(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleBack = async () => {
    if (triggerHaptic) {
      await triggerHaptic(ImpactStyle.Light);
    }
    onBack();
  };

  const claimDailyReward = async () => {
    const success = currencyService.claimDailyReward();
    
    if (success) {
      if (triggerHaptic) {
        await triggerHaptic(ImpactStyle.Medium);
      }
      
      const reward = currencyService.getDailyLoginReward();
      setPurchaseMessage({
        text: `Günlük ödül alındı! +${reward.coins} coin, +${reward.gems} gem`,
        type: 'success',
        visible: true
      });
      
      setTimeout(() => {
        setPurchaseMessage(prev => ({ ...prev, visible: false }));
      }, 3000);
    } else {
      setPurchaseMessage({
        text: 'Günlük ödül zaten alındı!',
        type: 'error',
        visible: true
      });
      
      setTimeout(() => {
        setPurchaseMessage(prev => ({ ...prev, visible: false }));
      }, 3000);
    }
  };

  if (!currency) {
    return (
      <div className="shop loading">
        <div className="loading-spinner">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="shop">
      {/* Header */}
      <div className="shop-header">
        <button className="back-button" onClick={handleBack}>
          ← Geri
        </button>
        <h1 className="shop-title">🏪 Mağaza</h1>
        <CurrencyDisplay 
          currency={currency}
          onClaimDaily={claimDailyReward}
        />
      </div>

      {/* Purchase Message */}
      {purchaseMessage.visible && (
        <div className={`purchase-message ${purchaseMessage.type}`}>
          {purchaseMessage.text}
        </div>
      )}

      {/* Player Info */}
      <div className="player-info">
        <div className="level-info">
          <span className="level">Level {currency.level}</span>
          <div className="xp-bar">
            <div 
              className="xp-fill" 
              style={{ width: `${currencyService.getLevelProgress()}%` }}
            />
            <span className="xp-text">
              {currencyService.getXPToNextLevel()} XP to next level
            </span>
          </div>
        </div>
        
        {currency.loginStreak > 1 && (
          <div className="login-streak">
            🔥 {currency.loginStreak} gün streak!
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Shop Content */}
      <div className="shop-content">
        <ShopCategoryComponent
          category={activeCategory}
          onPurchaseSuccess={handlePurchaseSuccess}
          onPurchaseError={handlePurchaseError}
          triggerHaptic={triggerHaptic}
        />
      </div>
    </div>
  );
};

export default Shop; 