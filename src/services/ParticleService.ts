export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  size: number;
  color: string;
  opacity: number;
  life: number; // 0-1
  maxLife: number;
  type: ParticleType;
  rotation?: number;
  rotationSpeed?: number;
  scale?: number;
  gravity?: number;
}

export type ParticleType = 
  | 'tap' 
  | 'combo' 
  | 'powerup' 
  | 'explosion' 
  | 'star' 
  | 'heart' 
  | 'sparkle'
  | 'trail'
  | 'circle_hit'
  | 'score_popup';

export interface ParticleEmitter {
  x: number;
  y: number;
  type: ParticleType;
  count: number;
  spread: number;
  velocity: number;
  colors: string[];
  size: number;
  life: number;
}

export class ParticleService {
  private static instance: ParticleService;
  private particles: Map<string, Particle> = new Map();
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrame: number | null = null;
  private isEnabled = true;
  private particleCounter = 0;

  public static getInstance(): ParticleService {
    if (!ParticleService.instance) {
      ParticleService.instance = new ParticleService();
    }
    return ParticleService.instance;
  }

  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.startAnimation();
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.clearAllParticles();
    }
  }

  // Circle hit effect
  createCircleHitEffect(x: number, y: number, color: string, isCorrect: boolean = true): void {
    if (!this.isEnabled) return;

    if (isCorrect) {
      // Başarılı hit - patlama efekti
      this.createExplosion(x, y, [color, '#FFD700', '#FFFFFF'], 8, 120, 15);
      
      // Yıldız parçacıkları
      this.createStars(x, y, 4, color);
      
      // Daire dalgası
      this.createRipple(x, y, color);
    } else {
      // Yanlış hit - kırmızı X efekti
      this.createCrossEffect(x, y, '#FF4444', '#FF8888');
    }
  }

  // Combo effect
  createComboEffect(x: number, y: number, combo: number, streakColor: string): void {
    if (!this.isEnabled) return;

    const intensity = Math.min(combo / 10, 3); // Max 3x intensity
    
    // Ana patlama
    this.createExplosion(x, y, [streakColor, '#FFD700', '#FFF'], 
      Math.floor(6 + intensity * 4), 80 + intensity * 40, 10 + intensity * 5);
    
    // Combo text effect
    this.createScorePopup(x, y - 30, `${combo}x COMBO!`, streakColor, 24);
    
    // Spiral effect for high combos
    if (combo >= 10) {
      this.createSpiral(x, y, streakColor, combo);
    }
    
    // Screen shake particles
    if (combo >= 20) {
      this.createScreenBurst(streakColor);
    }
  }

  // Power-up pickup effect
  createPowerUpEffect(x: number, y: number, powerUpType: string, rarity: string): void {
    if (!this.isEnabled) return;

    const rarityColors = {
      common: ['#9CA3AF', '#D1D5DB'],
      rare: ['#3B82F6', '#60A5FA'],
      epic: ['#8B5CF6', '#A78BFA'],
      legendary: ['#F59E0B', '#FBBF24', '#FFD700']
    };

    const colors = rarityColors[rarity as keyof typeof rarityColors] || rarityColors.common;
    
    // Rarity'ye göre effect intensity
    const intensity = rarity === 'legendary' ? 3 : rarity === 'epic' ? 2 : rarity === 'rare' ? 1.5 : 1;
    
    // Ana effect
    this.createExplosion(x, y, colors, Math.floor(8 * intensity), 100 * intensity, 20);
    
    // Özel effect'ler
    if (rarity === 'legendary') {
      this.createGoldenBurst(x, y);
      this.createRainbowRing(x, y);
    } else if (rarity === 'epic') {
      this.createPurpleWave(x, y);
    }
    
    // Floating hearts/stars
    this.createFloatingSymbols(x, y, powerUpType === 'shield' ? '🛡️' : '⭐', colors[0]);
  }

  // Score popup
  createScorePopup(x: number, y: number, text: string, color: string, size: number = 18): void {
    if (!this.isEnabled) return;

    const particle: Particle = {
      id: `score_${this.particleCounter++}`,
      x,
      y,
      vx: 0,
      vy: -50, // Yukarı hareket
      size,
      color,
      opacity: 1,
      life: 1,
      maxLife: 2000,
      type: 'score_popup',
      scale: 1,
      gravity: 0
    };

    // Text render için özel property
    (particle as any).text = text;
    
    this.particles.set(particle.id, particle);
  }

  // Public explosion effect method
  createExplosionEffect(x: number, y: number, color: string, count: number = 15): void {
    if (!this.isEnabled) return;
    this.createExplosion(x, y, [color, '#FF4444', '#FFAAAA'], count, 150, 20);
  }

  // Explosion effect
  private createExplosion(x: number, y: number, colors: string[], count: number, velocity: number, size: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = velocity * (0.7 + Math.random() * 0.6);
      
      const particle: Particle = {
        id: `explosion_${this.particleCounter++}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: size * (0.7 + Math.random() * 0.6),
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        life: 1,
        maxLife: 800 + Math.random() * 400,
        type: 'explosion',
        gravity: 100
      };
      
      this.particles.set(particle.id, particle);
    }
  }

  // Stars effect
  private createStars(x: number, y: number, count: number, color: string): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 60;
      
      const particle: Particle = {
        id: `star_${this.particleCounter++}`,
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        color,
        opacity: 1,
        life: 1,
        maxLife: 1000 + Math.random() * 500,
        type: 'star',
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 10,
        gravity: 50
      };
      
      this.particles.set(particle.id, particle);
    }
  }

  // Ripple effect
  private createRipple(x: number, y: number, color: string): void {
    const particle: Particle = {
      id: `ripple_${this.particleCounter++}`,
      x,
      y,
      vx: 0,
      vy: 0,
      size: 5,
      color,
      opacity: 0.8,
      life: 1,
      maxLife: 600,
      type: 'circle_hit',
      scale: 1,
      gravity: 0
    };
    
    this.particles.set(particle.id, particle);
  }

  // Cross effect for wrong hits
  private createCrossEffect(x: number, y: number, color1: string, color2: string): void {
    // X pattern particles
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 4) + (Math.PI / 2) * i;
      const speed = 120;
      
      const particle: Particle = {
        id: `cross_${this.particleCounter++}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 8,
        color: i % 2 === 0 ? color1 : color2,
        opacity: 1,
        life: 1,
        maxLife: 500,
        type: 'explosion',
        gravity: 0
      };
      
      this.particles.set(particle.id, particle);
    }
  }

  // Spiral effect for high combos
  private createSpiral(x: number, y: number, color: string, combo: number): void {
    const spiralCount = Math.min(combo, 30);
    
    for (let i = 0; i < spiralCount; i++) {
      const angle = (i / spiralCount) * Math.PI * 4; // 2 full rotations
      const radius = 30 + (i / spiralCount) * 60;
      
      const particle: Particle = {
        id: `spiral_${this.particleCounter++}`,
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        vx: Math.cos(angle + Math.PI/2) * 50,
        vy: Math.sin(angle + Math.PI/2) * 50,
        size: 6,
        color,
        opacity: 0.8,
        life: 1,
        maxLife: 1500,
        type: 'sparkle',
        gravity: 0
      };
      
      this.particles.set(particle.id, particle);
    }
  }

  // Screen burst for mega combos
  private createScreenBurst(color: string): void {
    const count = 20;
    const centerX = (this.canvas?.width || 400) / 2;
    const centerY = (this.canvas?.height || 600) / 2;
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 200 + Math.random() * 200;
      
      const particle: Particle = {
        id: `burst_${this.particleCounter++}`,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 8 + Math.random() * 8,
        color,
        opacity: 1,
        life: 1,
        maxLife: 2000,
        type: 'star',
        gravity: 80
      };
      
      this.particles.set(particle.id, particle);
    }
  }

  // Golden burst for legendary power-ups
  private createGoldenBurst(x: number, y: number): void {
    const colors = ['#FFD700', '#FFA500', '#FFFF00', '#FFF8DC'];
    
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16;
      const speed = 150 + Math.random() * 100;
      
      const particle: Particle = {
        id: `golden_${this.particleCounter++}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 8 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        life: 1,
        maxLife: 1500,
        type: 'star',
        rotation: 0,
        rotationSpeed: 5,
        gravity: 60
      };
      
      this.particles.set(particle.id, particle);
    }
  }

  // Rainbow ring effect
  private createRainbowRing(x: number, y: number): void {
    const colors = ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#0080FF', '#8000FF'];
    
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24;
      const radius = 40;
      
      setTimeout(() => {
        const particle: Particle = {
          id: `rainbow_${this.particleCounter++}`,
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          vx: Math.cos(angle) * 100,
          vy: Math.sin(angle) * 100,
          size: 6,
          color: colors[i % colors.length],
          opacity: 1,
          life: 1,
          maxLife: 1200,
          type: 'sparkle',
          gravity: 0
        };
        
        this.particles.set(particle.id, particle);
      }, i * 50);
    }
  }

  // Purple wave effect
  private createPurpleWave(x: number, y: number): void {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const particle: Particle = {
          id: `wave_${this.particleCounter++}`,
          x,
          y,
          vx: 0,
          vy: 0,
          size: 20,
          color: '#8B5CF6',
          opacity: 0.6,
          life: 1,
          maxLife: 800,
          type: 'circle_hit',
          scale: 1,
          gravity: 0
        };
        
        this.particles.set(particle.id, particle);
      }, i * 200);
    }
  }

  // Floating symbols
  private createFloatingSymbols(x: number, y: number, symbol: string, color: string): void {
    for (let i = 0; i < 3; i++) {
      const particle: Particle = {
        id: `symbol_${this.particleCounter++}`,
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 30,
        vy: -80 - Math.random() * 40,
        size: 20,
        color,
        opacity: 1,
        life: 1,
        maxLife: 2000,
        type: 'heart',
        scale: 1,
        gravity: -20 // Yukarı float
      };
      
      (particle as any).symbol = symbol;
      this.particles.set(particle.id, particle);
    }
  }

  // Animation loop
  private startAnimation(): void {
    const animate = () => {
      this.update();
      this.render();
      this.animationFrame = requestAnimationFrame(animate);
    };
    animate();
  }

  private update(): void {
    const deltaTime = 16; // ~60 FPS
    const expiredParticles: string[] = [];

    for (const [id, particle] of this.particles) {
      // Update life
      particle.life -= deltaTime / particle.maxLife;
      
      if (particle.life <= 0) {
        expiredParticles.push(id);
        continue;
      }
      
      // Update position
      particle.x += particle.vx * (deltaTime / 1000);
      particle.y += particle.vy * (deltaTime / 1000);
      
      // Apply gravity
      if (particle.gravity) {
        particle.vy += particle.gravity * (deltaTime / 1000);
      }
      
      // Update opacity
      particle.opacity = particle.life;
      
      // Update rotation
      if (particle.rotationSpeed) {
        particle.rotation = (particle.rotation || 0) + particle.rotationSpeed * (deltaTime / 1000);
      }
      
      // Update scale for ripple effects
      if (particle.type === 'circle_hit') {
        particle.scale = 1 + (1 - particle.life) * 3;
        particle.opacity = particle.life * 0.5;
      }
      
      // Update scale for score popups
      if (particle.type === 'score_popup') {
        particle.scale = 1 + (1 - particle.life) * 0.3;
      }
    }

    // Remove expired particles
    expiredParticles.forEach(id => this.particles.delete(id));
  }

  private render(): void {
    if (!this.ctx || !this.canvas) return;

    // Canvas'ı temizleme (transparent)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const particle of this.particles.values()) {
      this.ctx.save();
      
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.translate(particle.x, particle.y);
      
      if (particle.rotation) {
        this.ctx.rotate(particle.rotation);
      }
      
      if (particle.scale) {
        this.ctx.scale(particle.scale, particle.scale);
      }
      
      this.renderParticle(particle);
      
      this.ctx.restore();
    }
  }

  private renderParticle(particle: Particle): void {
    if (!this.ctx) return;

    this.ctx.fillStyle = particle.color;
    
    switch (particle.type) {
      case 'explosion':
      case 'tap':
        this.ctx.beginPath();
        this.ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        break;
        
      case 'star':
        this.renderStar(particle.size / 2);
        break;
        
      case 'sparkle':
        this.renderSparkle(particle.size / 2);
        break;
        
      case 'circle_hit':
        this.ctx.strokeStyle = particle.color;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        this.ctx.stroke();
        break;
        
      case 'score_popup':
        this.ctx.fillStyle = particle.color;
        this.ctx.font = `bold ${particle.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        const text = (particle as any).text || '';
        this.ctx.strokeText(text, 0, 0);
        this.ctx.fillText(text, 0, 0);
        break;
        
      case 'heart':
        const symbol = (particle as any).symbol || '❤️';
        this.ctx.font = `${particle.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(symbol, 0, 0);
        break;
    }
  }

  private renderStar(radius: number): void {
    if (!this.ctx) return;

    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
      
      // Inner point
      const innerAngle = angle + Math.PI / 5;
      const innerX = Math.cos(innerAngle) * radius * 0.4;
      const innerY = Math.sin(innerAngle) * radius * 0.4;
      this.ctx.lineTo(innerX, innerY);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  private renderSparkle(size: number): void {
    if (!this.ctx) return;

    // Plus shape
    this.ctx.fillRect(-size, -size/4, size*2, size/2);
    this.ctx.fillRect(-size/4, -size, size/2, size*2);
  }

  // Public methods
  clearAllParticles(): void {
    this.particles.clear();
  }

  getParticleCount(): number {
    return this.particles.size;
  }

  cleanup(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.clearAllParticles();
  }
} 