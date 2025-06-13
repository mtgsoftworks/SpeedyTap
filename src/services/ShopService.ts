import { CurrencyService } from './CurrencyService';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ShopCategory;
  price: number;
  currency: 'coins' | 'gems';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockLevel: number;
  unlockConditions?: string[];
  isUnlocked: boolean;
  isPurchased: boolean;
  isEquipped?: boolean;
  effects?: ItemEffect[];
  preview?: string; // Base64 image or URL
  duration?: number; // For temporary items (minutes)
  usageCount?: number; // For consumable items
  discount?: {
    percentage: number;
    endDate: string;
  };
}

export interface ItemEffect {
  type: 'score_multiplier' | 'time_freeze' | 'auto_tap' | 'circle_magnet' | 'extra_life' | 'slow_motion' | 'lucky_strike' | 'theme_change' | 'particle_effect' | 'sound_pack';
  value: number;
  duration?: number;
  description: string;
}

export type ShopCategory = 'powerups' | 'themes' | 'boosts' | 'cosmetics' | 'bundles' | 'featured';

export interface ShopData {
  purchasedItems: string[];
  equippedItems: {
    theme: string | null;
    particleEffect: string | null;
    soundPack: string | null;
  };
  inventory: {
    [itemId: string]: {
      quantity: number;
      purchaseDate: string;
      usagesLeft?: number;
    };
  };
  featuredItems: string[];
  dailyDeals: {
    date: string;
    items: string[];
  };
  purchaseHistory: PurchaseRecord[];
}

export interface PurchaseRecord {
  itemId: string;
  price: number;
  currency: 'coins' | 'gems';
  purchaseDate: string;
  wasOnSale: boolean;
}

export class ShopService {
  private static instance: ShopService;
  private currencyService: CurrencyService;
  private shopData: ShopData;
  private shopItems: Map<string, ShopItem> = new Map();
  private listeners: ((shopData: ShopData) => void)[] = [];

  public static getInstance(): ShopService {
    if (!ShopService.instance) {
      ShopService.instance = new ShopService();
    }
    return ShopService.instance;
  }

  private constructor() {
    this.currencyService = CurrencyService.getInstance();
    this.shopData = this.loadShopData();
    this.initializeShopItems();
    this.updateDailyDeals();
    this.updateFeaturedItems();
  }

  private initializeDefaultShopData(): ShopData {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      purchasedItems: [],
      equippedItems: {
        theme: null,
        particleEffect: null,
        soundPack: null
      },
      inventory: {},
      featuredItems: [],
      dailyDeals: {
        date: today,
        items: []
      },
      purchaseHistory: []
    };
  }

  private loadShopData(): ShopData {
    try {
      const saved = localStorage.getItem('speedytap_shop');
      if (saved) {
        return { ...this.initializeDefaultShopData(), ...JSON.parse(saved) };
      } else {
        return this.initializeDefaultShopData();
      }
    } catch (error) {
      console.warn('Failed to load shop data:', error);
      return this.initializeDefaultShopData();
    }
  }

  private saveShopData(): void {
    try {
      localStorage.setItem('speedytap_shop', JSON.stringify(this.shopData));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save shop data:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.shopData }));
  }

  private initializeShopItems(): void {
    const items: ShopItem[] = [
      // POWER-UPS
      {
        id: 'auto_tap_basic',
        name: 'Auto Tap',
        description: '5 saniye boyunca otomatik tıklama',
        icon: '🤖',
        category: 'powerups',
        price: 100,
        currency: 'coins',
        rarity: 'common',
        unlockLevel: 5,
        isUnlocked: false,
        isPurchased: false,
        effects: [
          { type: 'auto_tap', value: 5000, description: '5 saniye otomatik tıklama' }
        ],
        duration: 5,
        usageCount: 1
      },
      {
        id: 'time_freeze',
        name: 'Time Freeze',
        description: '3 saniye boyunca zamanı durdur',
        icon: '❄️',
        category: 'powerups',
        price: 150,
        currency: 'coins',
        rarity: 'rare',
        unlockLevel: 8,
        isUnlocked: false,
        isPurchased: false,
        effects: [
          { type: 'time_freeze', value: 3000, description: '3 saniye zaman durdurma' }
        ],
        duration: 3,
        usageCount: 1
      },
      {
        id: 'score_multiplier_2x',
        name: '2x Score',
        description: '30 saniye boyunca çift puan',
        icon: '⭐',
        category: 'powerups',
        price: 200,
        currency: 'coins',
        rarity: 'rare',
        unlockLevel: 12,
        isUnlocked: false,
        isPurchased: false,
        effects: [
          { type: 'score_multiplier', value: 2, duration: 30000, description: '30 saniye 2x puan' }
        ],
        duration: 30,
        usageCount: 1
      },
      {
        id: 'circle_magnet',
        name: 'Circle Magnet',
        description: 'Daireleri otomatik olarak çek',
        icon: '🧲',
        category: 'powerups',
        price: 250,
        currency: 'coins',
        rarity: 'epic',
        unlockLevel: 15,
        isUnlocked: false,
        isPurchased: false,
        effects: [
          { type: 'circle_magnet', value: 1, duration: 20000, description: '20 saniye mıknatıs efekti' }
        ],
        duration: 20,
        usageCount: 1
      },

      // THEMES
      {
        id: 'neon_theme',
        name: 'Neon Glow',
        description: 'Neon renklerle parlayan tema',
        icon: '🌈',
        category: 'themes',
        price: 500,
        currency: 'coins',
        rarity: 'rare',
        unlockLevel: 10,
        unlockConditions: ['reach_score_1000'],
        isUnlocked: false,
        isPurchased: false,
        effects: [
          { type: 'theme_change', value: 1, description: 'Neon tema aktif' }
        ]
      },
      {
        id: 'galaxy_theme',
        name: 'Galaxy Dreams',
        description: 'Uzay temalı galaksi görünümü',
        icon: '🌌',
        category: 'themes',
        price: 800,
        currency: 'coins',
        rarity: 'epic',
        unlockLevel: 18,
        unlockConditions: ['reach_level_15'],
        isUnlocked: false,
        isPurchased: false,
        effects: [
          { type: 'theme_change', value: 1, description: 'Galaksi tema aktif' }
        ]
      },
      {
        id: 'premium_dark',
        name: 'Premium Dark',
        description: 'Şık ve modern karanlık tema',
        icon: '🖤',
        category: 'themes',
        price: 50,
        currency: 'gems',
        rarity: 'legendary',
        unlockLevel: 20,
        isUnlocked: false,
        isPurchased: false,
        effects: [
          { type: 'theme_change', value: 1, description: 'Premium dark tema aktif' }
        ]
      },

      // GAMEPLAY BOOSTS
      {
        id: 'extra_life',
        name: 'Extra Life',
        description: 'Bir yanlış tıklama hakkı',
        icon: '❤️',
        category: 'boosts',
        price: 300,
        currency: 'coins',
        rarity: 'rare',
        unlockLevel: 12,
        isUnlocked: false,
        isPurchased: false,
        effects: [
          { type: 'extra_life', value: 1, description: '1 ekstra hak' }
        ],
        usageCount: 1
      },
      {
        id: 'slow_motion',
        name: 'Slow Motion',
        description: '%50 yavaşlatma efekti',
        icon: '🐌',
        category: 'boosts',
        price: 400,
        currency: 'coins',
        rarity: 'epic',
        unlockLevel: 16,
        isUnlocked: false,
        isPurchased: false,
        effects: [
          { type: 'slow_motion', value: 0.5, duration: 15000, description: '15 saniye yavaş hareket' }
        ],
        duration: 15,
        usageCount: 1
      },
      {
        id: 'lucky_strike',
        name: 'Lucky Strike',
        description: '%25 şansla çift puan',
        icon: '🍀',
        category: 'boosts',
        price: 500,
        currency: 'coins',
        rarity: 'epic',
        unlockLevel: 20,
        isUnlocked: false,
        isPurchased: false,
        effects: [
          { type: 'lucky_strike', value: 0.25, duration: 60000, description: '60 saniye şans bonusu' }
        ],
        duration: 60,
        usageCount: 1
      },

      // COSMETICS
      {
        id: 'rainbow_particles',
        name: 'Rainbow Particles',
        description: 'Gökkuşağı rengi parçacık efekti',
        icon: '✨',
        category: 'cosmetics',
        price: 150,
        currency: 'coins',
        rarity: 'common',
        unlockLevel: 8,
        isUnlocked: false,
        isPurchased: false,
        effects: [
          { type: 'particle_effect', value: 1, description: 'Gökkuşağı parçacık efekti' }
        ]
      },
      {
        id: 'fire_particles',
        name: 'Fire Effect',
        description: 'Ateş parçacık efekti',
        icon: '🔥',
        category: 'cosmetics',
        price: 250,
        currency: 'coins',
        rarity: 'rare',
        unlockLevel: 14,
        isUnlocked: false,
        isPurchased: false,
        effects: [
          { type: 'particle_effect', value: 1, description: 'Ateş parçacık efekti' }
        ]
      },
      {
        id: 'retro_sound_pack',
        name: 'Retro Sounds',
        description: '8-bit retro ses paketi',
        icon: '🕹️',
        category: 'cosmetics',
        price: 300,
        currency: 'coins',
        rarity: 'rare',
        unlockLevel: 12,
        isUnlocked: false,
        isPurchased: false,
        effects: [
          { type: 'sound_pack', value: 1, description: 'Retro ses paketi aktif' }
        ]
      },

      // BUNDLES
      {
        id: 'starter_bundle',
        name: 'Starter Pack',
        description: 'Yeni başlayanlar için ideal paket',
        icon: '📦',
        category: 'bundles',
        price: 400,
        currency: 'coins',
        rarity: 'common',
        unlockLevel: 5,
        isUnlocked: false,
        isPurchased: false,
        effects: [
          { type: 'auto_tap', value: 3000, description: '3 Auto Tap' },
          { type: 'score_multiplier', value: 2, description: '2 Score Multiplier' },
          { type: 'extra_life', value: 2, description: '2 Extra Life' }
        ],
        discount: {
          percentage: 30,
          endDate: '2024-12-31'
        }
      }
    ];

    // Add items to map
    items.forEach(item => {
      this.shopItems.set(item.id, item);
    });

    // Update unlock status based on player level and conditions
    this.updateItemUnlockStatus();
  }

  private updateItemUnlockStatus(): void {
    const currency = this.currencyService.getCurrencyData();
    const playerLevel = currency.level;

    this.shopItems.forEach(item => {
      // Level check
      if (playerLevel >= item.unlockLevel) {
        item.isUnlocked = true;
      }

      // Additional unlock conditions check (to be implemented)
      if (item.unlockConditions) {
        // TODO: Check specific conditions like achievements, scores, etc.
      }

      // Check if already purchased
      if (this.shopData.purchasedItems.includes(item.id)) {
        item.isPurchased = true;
      }
    });
  }

  private updateDailyDeals(): void {
    const today = new Date().toISOString().split('T')[0];
    
    if (this.shopData.dailyDeals.date !== today) {
      // New day - generate new daily deals
      const availableItems = Array.from(this.shopItems.values())
        .filter(item => item.isUnlocked && !item.isPurchased && item.category !== 'bundles')
        .slice(0, 3); // Pick 3 random items

      this.shopData.dailyDeals = {
        date: today,
        items: availableItems.map(item => item.id)
      };

      // Apply discounts to daily deals
      availableItems.forEach(item => {
        if (!item.discount) {
          item.discount = {
            percentage: 20 + Math.floor(Math.random() * 30), // 20-50% discount
            endDate: today
          };
        }
      });

      this.saveShopData();
    }
  }

  private updateFeaturedItems(): void {
    // Update featured items weekly or based on special events
    const featuredCandidates = Array.from(this.shopItems.values())
      .filter(item => item.rarity === 'epic' || item.rarity === 'legendary')
      .slice(0, 2);

    this.shopData.featuredItems = featuredCandidates.map(item => item.id);
  }

  // Public methods
  public getShopData(): ShopData {
    return { ...this.shopData };
  }

  public getItemsByCategory(category: ShopCategory): ShopItem[] {
    return Array.from(this.shopItems.values())
      .filter(item => item.category === category)
      .sort((a, b) => {
        // Sort by unlock status, then by price
        if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1;
        return a.price - b.price;
      });
  }

  public getItem(itemId: string): ShopItem | undefined {
    return this.shopItems.get(itemId);
  }

  public getFeaturedItems(): ShopItem[] {
    return this.shopData.featuredItems
      .map(id => this.shopItems.get(id))
      .filter(item => item !== undefined) as ShopItem[];
  }

  public getDailyDeals(): ShopItem[] {
    return this.shopData.dailyDeals.items
      .map(id => this.shopItems.get(id))
      .filter(item => item !== undefined) as ShopItem[];
  }

  public canPurchaseItem(itemId: string): { canPurchase: boolean; reason?: string } {
    const item = this.shopItems.get(itemId);
    
    if (!item) {
      return { canPurchase: false, reason: 'Item not found' };
    }

    if (!item.isUnlocked) {
      return { canPurchase: false, reason: `Requires level ${item.unlockLevel}` };
    }

    if (item.isPurchased) {
      return { canPurchase: false, reason: 'Already purchased' };
    }

    const finalPrice = this.getItemPrice(itemId);
    if (!this.currencyService.canAfford(finalPrice, item.currency)) {
      return { canPurchase: false, reason: `Not enough ${item.currency}` };
    }

    return { canPurchase: true };
  }

  public getItemPrice(itemId: string): number {
    const item = this.shopItems.get(itemId);
    if (!item) return 0;

    let price = item.price;

    // Apply discount if available
    if (item.discount) {
      const today = new Date().toISOString().split('T')[0];
      if (item.discount.endDate >= today) {
        price = Math.floor(price * (1 - item.discount.percentage / 100));
      }
    }

    return price;
  }

  public purchaseItem(itemId: string): { success: boolean; message: string } {
    const purchaseCheck = this.canPurchaseItem(itemId);
    
    if (!purchaseCheck.canPurchase) {
      return { success: false, message: purchaseCheck.reason || 'Cannot purchase' };
    }

    const item = this.shopItems.get(itemId)!;
    const finalPrice = this.getItemPrice(itemId);
    const wasOnSale = !!item.discount;

    // Attempt purchase
    const spendSuccess = this.currencyService.spendCurrency(finalPrice, item.currency);
    
    if (!spendSuccess) {
      return { success: false, message: `Not enough ${item.currency}` };
    }

    // Mark as purchased
    item.isPurchased = true;
    this.shopData.purchasedItems.push(itemId);

    // Add to inventory
    this.shopData.inventory[itemId] = {
      quantity: item.usageCount || 1,
      purchaseDate: new Date().toISOString(),
      usagesLeft: item.usageCount
    };

    // Record purchase
    this.shopData.purchaseHistory.push({
      itemId,
      price: finalPrice,
      currency: item.currency,
      purchaseDate: new Date().toISOString(),
      wasOnSale
    });

    // Auto-equip themes and cosmetics
    if (item.category === 'themes') {
      this.shopData.equippedItems.theme = itemId;
    } else if (item.category === 'cosmetics') {
      if (item.effects?.some(e => e.type === 'particle_effect')) {
        this.shopData.equippedItems.particleEffect = itemId;
      } else if (item.effects?.some(e => e.type === 'sound_pack')) {
        this.shopData.equippedItems.soundPack = itemId;
      }
    }

    this.saveShopData();
    return { success: true, message: `Successfully purchased ${item.name}!` };
  }

  public useItem(itemId: string): { success: boolean; message: string } {
    const inventory = this.shopData.inventory[itemId];
    
    if (!inventory || inventory.quantity <= 0) {
      return { success: false, message: 'Item not available in inventory' };
    }

    const item = this.shopItems.get(itemId);
    if (!item) {
      return { success: false, message: 'Item not found' };
    }

    // Decrease usage count for consumables
    if (item.usageCount && inventory.usagesLeft) {
      inventory.usagesLeft--;
      if (inventory.usagesLeft <= 0) {
        inventory.quantity--;
      }
    }

    this.saveShopData();
    return { success: true, message: `Used ${item.name}!` };
  }

  public equipItem(itemId: string, equipType: 'theme' | 'particleEffect' | 'soundPack'): boolean {
    const item = this.shopItems.get(itemId);
    
    if (!item || !item.isPurchased) {
      return false;
    }

    this.shopData.equippedItems[equipType] = itemId;
    this.saveShopData();
    return true;
  }

  public getEquippedItems(): { theme: string | null; particleEffect: string | null; soundPack: string | null } {
    return { ...this.shopData.equippedItems };
  }

  public getPurchaseHistory(): PurchaseRecord[] {
    return [...this.shopData.purchaseHistory];
  }

  public getTotalSpent(): { coins: number; gems: number } {
    return this.shopData.purchaseHistory.reduce(
      (total, record) => {
        total[record.currency] += record.price;
        return total;
      },
      { coins: 0, gems: 0 }
    );
  }

  // Event listeners
  public addListener(listener: (shopData: ShopData) => void): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: (shopData: ShopData) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Admin/Debug methods
  public unlockAllItems(): void {
    this.shopItems.forEach(item => {
      item.isUnlocked = true;
    });
    this.saveShopData();
  }

  public resetShopData(): void {
    this.shopData = this.initializeDefaultShopData();
    this.shopItems.forEach(item => {
      item.isPurchased = false;
    });
    this.saveShopData();
  }
} 