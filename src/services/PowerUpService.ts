export interface PowerUp {
  id: string;
  type: PowerUpType;
  name: string;
  description: string;
  icon: string;
  duration: number; // ms
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect: PowerUpEffect;
}

export interface PowerUpEffect {
  scoreMultiplier?: number;
  timeExtension?: number; // ms
  slowMotion?: number; // 0.5 = yarı hız
  autoTap?: boolean;
  shieldActive?: boolean;
  doublePoints?: boolean;
  freezeTime?: boolean;
}

export type PowerUpType = 
  | 'time_boost'
  | 'score_multiplier' 
  | 'slow_motion'
  | 'auto_tap'
  | 'shield'
  | 'double_points'
  | 'freeze_time';

export interface ActivePowerUp {
  powerUp: PowerUp;
  startTime: number;
  remaining: number;
}

export class PowerUpService {
  private static instance: PowerUpService;
  private activePowerUps: Map<string, ActivePowerUp> = new Map();
  private listeners: ((powerUps: ActivePowerUp[]) => void)[] = [];
  private effectListeners: ((type: PowerUpType, active: boolean) => void)[] = [];

  public static getInstance(): PowerUpService {
    if (!PowerUpService.instance) {
      PowerUpService.instance = new PowerUpService();
    }
    return PowerUpService.instance;
  }

  // Tüm power-up'lar
  private powerUps: PowerUp[] = [
    {
      id: 'time_boost',
      type: 'time_boost',
      name: 'Zaman Artırıcı',
      description: '+5 saniye ek süre',
      icon: '⏰',
      duration: 0, // Anlık etki
      rarity: 'common',
      effect: { timeExtension: 5000 }
    },
    {
      id: 'score_2x',
      type: 'score_multiplier',
      name: '2x Skor',
      description: '10 saniye 2x skor',
      icon: '⭐',
      duration: 10000,
      rarity: 'common',
      effect: { scoreMultiplier: 2 }
    },
    {
      id: 'score_3x',
      type: 'score_multiplier',
      name: '3x Skor',
      description: '8 saniye 3x skor',
      icon: '🌟',
      duration: 8000,
      rarity: 'rare',
      effect: { scoreMultiplier: 3 }
    },
    {
      id: 'slow_motion',
      type: 'slow_motion',
      name: 'Ağır Çekim',
      description: '6 saniye ağır çekim',
      icon: '🐌',
      duration: 6000,
      rarity: 'rare',
      effect: { slowMotion: 0.5 }
    },
    {
      id: 'auto_tap',
      type: 'auto_tap',
      name: 'Otomatik Dokunuş',
      description: '5 saniye otomatik dokunuş',
      icon: '🤖',
      duration: 5000,
      rarity: 'epic',
      effect: { autoTap: true }
    },
    {
      id: 'shield',
      type: 'shield',
      name: 'Kalkan',
      description: '8 saniye yanlış tıklama koruması',
      icon: '🛡️',
      duration: 8000,
      rarity: 'rare',
      effect: { shieldActive: true }
    },
    {
      id: 'double_points',
      type: 'double_points',
      name: 'Çifte Puan',
      description: '12 saniye her tıklama +2 puan',
      icon: '💎',
      duration: 12000,
      rarity: 'epic',
      effect: { doublePoints: true }
    },
    {
      id: 'freeze_time',
      type: 'freeze_time',
      name: 'Zaman Durdur',
      description: '4 saniye zaman durur',
      icon: '🧊',
      duration: 4000,
      rarity: 'legendary',
      effect: { freezeTime: true }
    }
  ];

  // Power-up spawn etme
  generateRandomPowerUp(level: number): PowerUp | null {
    // Level ile spawn şansı artır
    const baseChance = 0.15; // %15 base chance
    const levelBonus = Math.min(level * 0.02, 0.35); // Level başına %2, max %35
    const spawnChance = baseChance + levelBonus;

    if (Math.random() > spawnChance) {
      return null;
    }

    // Rarity'ye göre ağırlıklı seçim
    const rarityWeights = {
      common: 50,
      rare: 25,
      epic: 15,
      legendary: 10
    };

    // Level ile daha iyi power-up'lar çıkma şansı
    if (level >= 5) rarityWeights.rare += 10;
    if (level >= 10) rarityWeights.epic += 10;
    if (level >= 15) rarityWeights.legendary += 15;

    const totalWeight = Object.values(rarityWeights).reduce((a, b) => a + b, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    let selectedRarity: keyof typeof rarityWeights = 'common';
    
    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      currentWeight += weight;
      if (random <= currentWeight) {
        selectedRarity = rarity as keyof typeof rarityWeights;
        break;
      }
    }

    // Seçilen rarity'den rastgele power-up seç
    const availablePowerUps = this.powerUps.filter(p => p.rarity === selectedRarity);
    return availablePowerUps[Math.floor(Math.random() * availablePowerUps.length)];
  }

  // Power-up aktive etme
  activatePowerUp(powerUp: PowerUp): void {
    const now = Date.now();
    
    // Eğer aynı tipte active power-up varsa, yeni süreyle değiştir
    const activeOfSameType = Array.from(this.activePowerUps.values())
      .find(active => active.powerUp.type === powerUp.type);
    
    if (activeOfSameType) {
      this.activePowerUps.delete(activeOfSameType.powerUp.id);
    }

    // Yeni power-up'ı aktive et
    if (powerUp.duration > 0) {
      const activePowerUp: ActivePowerUp = {
        powerUp,
        startTime: now,
        remaining: powerUp.duration
      };
      
      this.activePowerUps.set(powerUp.id, activePowerUp);
    }

    // Effect listeners'ı bilgilendir
    this.effectListeners.forEach(listener => 
      listener(powerUp.type, true)
    );

    // Listeners'ı güncelle
    this.notifyListeners();
  }

  // Power-up'ları güncelle (game loop'ta çağrılır)
  update(_deltaTime: number): void {
    const now = Date.now();
    const expiredPowerUps: string[] = [];

    for (const [id, activePowerUp] of this.activePowerUps) {
      const elapsed = now - activePowerUp.startTime;
      activePowerUp.remaining = Math.max(0, activePowerUp.powerUp.duration - elapsed);

      if (activePowerUp.remaining <= 0) {
        expiredPowerUps.push(id);
        
        // Effect listeners'ı bilgilendir
        this.effectListeners.forEach(listener => 
          listener(activePowerUp.powerUp.type, false)
        );
      }
    }

    // Süresi dolan power-up'ları kaldır
    expiredPowerUps.forEach(id => this.activePowerUps.delete(id));

    if (expiredPowerUps.length > 0) {
      this.notifyListeners();
    }
  }

  // Aktif power-up'ları al
  getActivePowerUps(): ActivePowerUp[] {
    return Array.from(this.activePowerUps.values());
  }

  // Belirli bir effect aktif mi?
  isEffectActive(type: PowerUpType): boolean {
    return Array.from(this.activePowerUps.values())
      .some(active => active.powerUp.type === type);
  }

  // Aktif effect'ler
  getActiveEffects(): PowerUpEffect {
    const effects: PowerUpEffect = {};
    
    for (const active of this.activePowerUps.values()) {
      const effect = active.powerUp.effect;
      
      // Score multiplier'ları biriktir
      if (effect.scoreMultiplier) {
        effects.scoreMultiplier = (effects.scoreMultiplier || 1) * effect.scoreMultiplier;
      }
      
      // Diğer boolean effect'ler
      if (effect.autoTap) effects.autoTap = true;
      if (effect.shieldActive) effects.shieldActive = true;
      if (effect.doublePoints) effects.doublePoints = true;
      if (effect.freezeTime) effects.freezeTime = true;
      
      // Slow motion en düşük değeri alır
      if (effect.slowMotion) {
        effects.slowMotion = Math.min(effects.slowMotion || 1, effect.slowMotion);
      }
    }
    
    return effects;
  }

  // Tüm power-up'ları temizle
  clearAllPowerUps(): void {
    const types = Array.from(this.activePowerUps.values())
      .map(active => active.powerUp.type);
    
    this.activePowerUps.clear();
    
    // Effect listeners'ı bilgilendir
    types.forEach(type => {
      this.effectListeners.forEach(listener => listener(type, false));
    });
    
    this.notifyListeners();
  }

  // Listeners
  onPowerUpChange(callback: (powerUps: ActivePowerUp[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  onEffectChange(callback: (type: PowerUpType, active: boolean) => void): () => void {
    this.effectListeners.push(callback);
    return () => {
      const index = this.effectListeners.indexOf(callback);
      if (index > -1) this.effectListeners.splice(index, 1);
    };
  }

  private notifyListeners(): void {
    const activePowerUps = this.getActivePowerUps();
    this.listeners.forEach(listener => listener(activePowerUps));
  }

  // Power-up'ları kaydet/yükle
  savePowerUpStats(): void {
    const stats = {
      totalActivated: this.getTotalActivatedCount(),
      favoriteType: this.getMostUsedType(),
      lastUsed: Date.now()
    };
    localStorage.setItem('speedytap_powerup_stats', JSON.stringify(stats));
  }

  private getTotalActivatedCount(): number {
    // Bu gerçek implementasyonda bir counter olmalı
    return parseInt(localStorage.getItem('speedytap_powerup_total') || '0');
  }

  private getMostUsedType(): PowerUpType | null {
    // Bu gerçek implementasyonda usage tracking olmalı
    return 'score_multiplier'; // Placeholder
  }

  // Debug/test için
  getAllPowerUps(): PowerUp[] {
    return [...this.powerUps];
  }
} 