import { useState, useEffect } from 'react';
import { ShopService } from '../services/ShopService';
import type { ShopItem } from '../services/ShopService';
import type { ShopCategory } from '../services/ShopService';

import { ImpactStyle } from '@capacitor/haptics';
import './ShopCategory.css';
import { useTranslation } from 'react-i18next';

interface ShopCategoryProps {
  category: ShopCategory;
  onPurchaseSuccess: (message: string) => void;
  onPurchaseError: (message: string) => void;
  triggerHaptic?: (style?: ImpactStyle) => Promise<void>;
}

interface ShopItemProps {
  item: ShopItem;
  onPurchaseSuccess: (message: string) => void;
  onPurchaseError: (message: string) => void;
  triggerHaptic?: (style?: ImpactStyle) => Promise<void>;
  isDailyDeal?: boolean;
  isFeatured?: boolean;
}

const ShopItem = ({ 
  item, 
  onPurchaseSuccess, 
  onPurchaseError, 
  triggerHaptic,
  isDailyDeal = false,
  isFeatured = false
}: ShopItemProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const shopService = ShopService.getInstance();

  const finalPrice = shopService.getItemPrice(item.id);
  const originalPrice = item.price;
  const hasDiscount = finalPrice < originalPrice;
  const discountPercentage = hasDiscount ? 
    Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

  const purchaseCheck = shopService.canPurchaseItem(item.id);

  const handlePurchase = async () => {
    if (!purchaseCheck.canPurchase || isLoading) return;

    setIsLoading(true);
    
    if (triggerHaptic) {
      await triggerHaptic(ImpactStyle.Medium);
    }

    try {
      const result = shopService.purchaseItem(item.id);
      
      if (result.success) {
        onPurchaseSuccess(result.message);
      } else {
        onPurchaseError(result.message);
      }
    } catch (error) {
      onPurchaseError('Satın alma hatası!');
    } finally {
      setIsLoading(false);
    }
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return '#9CA3AF';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#FFD700';
      default: return '#9CA3AF';
    }
  };

  const getRarityName = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'Yaygın';
      case 'rare': return 'Nadir';
      case 'epic': return 'Epik';
      case 'legendary': return 'Efsanevi';
      default: return 'Yaygın';
    }
  };

  return (
    <div 
      className={`shop-item ${item.rarity} ${!item.isUnlocked ? 'locked' : ''} ${item.isPurchased ? 'purchased' : ''} ${isDailyDeal ? 'daily-deal' : ''} ${isFeatured ? 'featured' : ''}`}
      style={{ borderColor: getRarityColor(item.rarity) }}
    >
      {/* Special badges */}
      {isDailyDeal && <div className="deal-badge">🔥 FIRSATTAN</div>}
      {isFeatured && <div className="featured-badge">⭐ ÖNE ÇIKAN</div>}
      {hasDiscount && (
        <div className="discount-badge">-%{discountPercentage}</div>
      )}

      {/* Item Icon */}
      <div className="item-icon">
        {item.icon}
      </div>

      {/* Item Info */}
      <div className="item-info">
        <div className="item-header">
          <h3 className="item-name">{item.name}</h3>
          <span 
            className="item-rarity"
            style={{ color: getRarityColor(item.rarity) }}
          >
            {getRarityName(item.rarity)}
          </span>
        </div>
        
        <p className="item-description">{item.description}</p>

        {/* Item Effects */}
        {item.effects && item.effects.length > 0 && (
          <div className="item-effects">
            {item.effects.map((effect, index) => (
              <div key={index} className="effect-tag">
                {effect.description}
              </div>
            ))}
          </div>
        )}

        {/* Usage Info */}
        {item.duration && (
          <div className="usage-info">
            ⏱️ Süre: {item.duration} saniye
          </div>
        )}
        
        {item.usageCount && (
          <div className="usage-info">
            🔄 Kullanım: {item.usageCount}x
          </div>
        )}
      </div>

      {/* Item Footer */}
      <div className="item-footer">
        {!item.isUnlocked ? (
          <div className="unlock-requirement">
            🔒 Level {item.unlockLevel} gerekli
          </div>
        ) : item.isPurchased ? (
          <div className="purchased-status">
            ✅ Satın Alındı
          </div>
        ) : (
          <div className="purchase-section">
            <div className="price-display">
              {hasDiscount && (
                <span className="original-price">
                  {originalPrice} {item.currency === 'coins' ? '🪙' : '💎'}
                </span>
              )}
              <span className="final-price">
                {finalPrice} {item.currency === 'coins' ? '🪙' : '💎'}
              </span>
            </div>
            
            <button
              className={`purchase-button ${purchaseCheck.canPurchase ? 'available' : 'unavailable'}`}
              onClick={handlePurchase}
              disabled={!purchaseCheck.canPurchase || isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner">⏳</span>
              ) : purchaseCheck.canPurchase ? (
                'Satın Al'
              ) : (
                purchaseCheck.reason || 'Satın Alınamaz'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ShopCategoryComponent = ({ 
  category, 
  onPurchaseSuccess, 
  onPurchaseError, 
  triggerHaptic 
}: ShopCategoryProps) => {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked' | 'purchased'>('all');
  const [sortBy, setSortBy] = useState<'price' | 'rarity' | 'level'>('price');
  
  const shopService = ShopService.getInstance();
  const { t } = useTranslation();

  useEffect(() => {
    loadItems();
  }, [category]);

  const loadItems = () => {
    const categoryItems = shopService.getItemsByCategory(category);
    setItems(categoryItems);
  };

  const getFilteredAndSortedItems = (): ShopItem[] => {
    let filtered = items;

    // Apply filter
    switch (filter) {
      case 'unlocked':
        filtered = items.filter(item => item.isUnlocked && !item.isPurchased);
        break;
      case 'locked':
        filtered = items.filter(item => !item.isUnlocked);
        break;
      case 'purchased':
        filtered = items.filter(item => item.isPurchased);
        break;
      default:
        filtered = items;
    }

    // Apply sort
    switch (sortBy) {
      case 'price':
        filtered.sort((a, b) => shopService.getItemPrice(a.id) - shopService.getItemPrice(b.id));
        break;
      case 'rarity':
        const rarityOrder = { 'common': 1, 'rare': 2, 'epic': 3, 'legendary': 4 };
        filtered.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
        break;
      case 'level':
        filtered.sort((a, b) => a.unlockLevel - b.unlockLevel);
        break;
    }

    return filtered;
  };

  const getCategoryTitle = (cat: ShopCategory): string => {
    switch (cat) {
      case 'powerups': return `⚡ ${t('shop.powerups')}`;
      case 'themes': return `🎨 ${t('shop.themes')}`;
      case 'boosts': return `🚀 ${t('shop.boosts')}`;
      case 'cosmetics': return `✨ ${t('shop.cosmetics')}`;
      case 'bundles': return `📦 ${t('shop.bundles')}`;
      default: return `🛍️ ${t('shop.products')}`;
    }
  };

  const getCategoryDescription = (cat: ShopCategory): string => {
    switch (cat) {
      case 'powerups': return t('shop.powerups_desc');
      case 'themes': return t('shop.themes_desc');
      case 'boosts': return t('shop.boosts_desc');
      case 'cosmetics': return t('shop.cosmetics_desc');
      case 'bundles': return t('shop.bundles_desc');
      default: return t('shop.products_desc');
    }
  };

  const filteredItems = getFilteredAndSortedItems();

  return (
    <div className="shop-category">
      {/* Category Header */}
      <div className="category-header">
        <h2 className="category-title">{getCategoryTitle(category)}</h2>
        <p className="category-description">{getCategoryDescription(category)}</p>
      </div>

      {/* Filters and Sort */}
      <div className="category-controls">
        <div className="filter-buttons">
          <span className="control-label">Filtre:</span>
          {[
            { key: 'all' as const, label: 'Tümü', icon: '📋' },
            { key: 'unlocked' as const, label: 'Mevcut', icon: '🔓' },
            { key: 'locked' as const, label: 'Kilitli', icon: '🔒' },
            { key: 'purchased' as const, label: 'Satın Alınan', icon: '✅' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              className={`filter-button ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <div className="sort-controls">
          <span className="control-label">Sırala:</span>
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'price' | 'rarity' | 'level')}
          >
            <option value="price">Fiyat</option>
            <option value="rarity">Nadir</option>
            <option value="level">Level</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      <div className="items-grid">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <ShopItem
              key={item.id}
              item={item}
              onPurchaseSuccess={onPurchaseSuccess}
              onPurchaseError={onPurchaseError}
              triggerHaptic={triggerHaptic}
            />
          ))
        ) : (
          <div className="no-items">
            <div className="no-items-icon">🔍</div>
            <p className="no-items-text">Bu kategoride ürün bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Export both components
export type { ShopItem };
export default ShopCategoryComponent; 