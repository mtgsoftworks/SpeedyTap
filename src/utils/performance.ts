// Performance Utilities
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// RAF-based utilities
export const requestAnimationFrame = (callback: () => void): number => {
  return window.requestAnimationFrame(callback);
};

export const cancelAnimationFrame = (id: number): void => {
  window.cancelAnimationFrame(id);
};

// Frame Rate Utilities
export const measureFPS = (): Promise<number> => {
  return new Promise((resolve) => {
    let frames = 0;
    const startTime = performance.now();
    
    const measureFrame = () => {
      frames++;
      if (frames >= 60) {
        const endTime = performance.now();
        const fps = Math.round((frames * 1000) / (endTime - startTime));
        resolve(fps);
      } else {
        requestAnimationFrame(measureFrame);
      }
    };
    
    requestAnimationFrame(measureFrame);
  });
};

// Memory utilities
export const getMemoryUsage = (): number => {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
};

// Time-based utilities
export const createTimer = () => {
  const startTime = performance.now();
  
  return {
    getElapsed: () => performance.now() - startTime,
    reset: () => performance.now()
  };
};

// Performance Utils - HTML5 Game Optimization
// Implementing web-optimized performance techniques for smooth gameplay

import { LanguageManager } from './i18n';

interface PerformanceMetrics {
  fps: number;
  deltaTime: number;
  averageFps: number;
  frameCount: number;
  lastFrameTime: number;
}

interface FrameCallback {
  (deltaTime: number, fps: number): void;
}

export class GameLoop {
  private static instance: GameLoop;
  private isRunning = false;
  private animationId: number | null = null;
  private callbacks = new Set<FrameCallback>();
  
  // Performance tracking
  private metrics: PerformanceMetrics = {
    fps: 60,
    deltaTime: 0,
    averageFps: 60,
    frameCount: 0,
    lastFrameTime: 0
  };
  
  private fpsHistory: number[] = [];
  private readonly FPS_HISTORY_SIZE = 60; // Track last 60 frames
  
  public static getInstance(): GameLoop {
    if (!GameLoop.instance) {
      GameLoop.instance = new GameLoop();
    }
    return GameLoop.instance;
  }
  
  private constructor() {
    this.metrics.lastFrameTime = performance.now();
  }
  
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.metrics.lastFrameTime = performance.now();
    this.loop();
    
    console.log('🎮 ' + LanguageManager.t('console.optimizedGameLoopStarted'));
  }
  
  public stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    console.log('⏹️ ' + LanguageManager.t('console.gameLoopStopped'));
  }
  
  public subscribe(callback: FrameCallback): void {
    this.callbacks.add(callback);
  }
  
  public unsubscribe(callback: FrameCallback): void {
    this.callbacks.delete(callback);
  }
  
  private loop = (): void => {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    this.metrics.deltaTime = currentTime - this.metrics.lastFrameTime;
    this.metrics.lastFrameTime = currentTime;
    
    // Calculate FPS
    if (this.metrics.deltaTime > 0) {
      this.metrics.fps = 1000 / this.metrics.deltaTime;
      this.updateFpsHistory(this.metrics.fps);
    }
    
    this.metrics.frameCount++;
    
    // Call all registered callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(this.metrics.deltaTime, this.metrics.fps);
      } catch (error) {
        console.error('❌ Game loop callback error:', error);
      }
    });
    
    // Schedule next frame
    this.animationId = requestAnimationFrame(this.loop);
  };
  
  private updateFpsHistory(fps: number): void {
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > this.FPS_HISTORY_SIZE) {
      this.fpsHistory.shift();
    }
    
    // Calculate average FPS
    this.metrics.averageFps = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
  }
  
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  public isOptimalPerformance(): boolean {
    return this.metrics.averageFps >= 55; // Allow 5fps tolerance
  }
}

// Delta Time Based Timer - Web Optimized
export class DeltaTimer {
  private totalTime = 0;
  private duration: number;
  private onUpdate?: (progress: number, timeLeft: number) => void;
  private onComplete?: () => void;
  private isActive = false;
  private gameLoop: GameLoop;
  
  constructor(
    duration: number,
    onUpdate?: (progress: number, timeLeft: number) => void,
    onComplete?: () => void
  ) {
    this.duration = duration;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.gameLoop = GameLoop.getInstance();
  }
  
  public start(): void {
    if (this.isActive) return;
    
    this.totalTime = 0;
    this.isActive = true;
    this.gameLoop.subscribe(this.update);
    
    if (!this.gameLoop['isRunning']) {
      this.gameLoop.start();
    }
  }
  
  public stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    this.gameLoop.unsubscribe(this.update);
  }
  
  public pause(): void {
    this.isActive = false;
    this.gameLoop.unsubscribe(this.update);
  }
  
  public resume(): void {
    if (!this.isActive) {
      this.isActive = true;
      this.gameLoop.subscribe(this.update);
    }
  }
  
  private update = (deltaTime: number): void => {
    if (!this.isActive) return;
    
    this.totalTime += deltaTime;
    const timeLeft = Math.max(0, this.duration - this.totalTime);
    const progress = Math.min(100, (this.totalTime / this.duration) * 100);
    
    this.onUpdate?.(progress, timeLeft);
    
    if (timeLeft <= 0) {
      this.stop();
      this.onComplete?.();
    }
  };
  
  public getTimeLeft(): number {
    return Math.max(0, this.duration - this.totalTime);
  }
  
  public getProgress(): number {
    return Math.min(100, (this.totalTime / this.duration) * 100);
  }
}

// Performance Monitor for debugging
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private displayElement: HTMLElement | null = null;
  private gameLoop: GameLoop;
  private isVisible = false;
  
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  private constructor() {
    this.gameLoop = GameLoop.getInstance();
  }
  
  public show(): void {
    if (this.isVisible) return;
    
    this.createDisplayElement();
    this.isVisible = true;
    this.gameLoop.subscribe(this.updateDisplay);
    
    console.log('📊 ' + LanguageManager.t('console.performanceMonitorEnabled'));
  }
  
  public hide(): void {
    if (!this.isVisible) return;
    
    this.isVisible = false;
    this.gameLoop.unsubscribe(this.updateDisplay);
    
    if (this.displayElement) {
      this.displayElement.remove();
      this.displayElement = null;
    }
    
    console.log('📊 ' + LanguageManager.t('console.performanceMonitorDisabled'));
  }
  
  private createDisplayElement(): void {
    this.displayElement = document.createElement('div');
    this.displayElement.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #00FF6B;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      pointer-events: none;
      min-width: 120px;
    `;
    document.body.appendChild(this.displayElement);
  }
  
  private updateDisplay = (): void => {
    if (!this.displayElement) return;
    
    const metrics = this.gameLoop.getMetrics();
    const memoryInfo = (performance as any).memory;
    
    this.displayElement.innerHTML = `
      <div>FPS: ${Math.round(metrics.fps)}</div>
      <div>Avg: ${Math.round(metrics.averageFps)}</div>
      <div>ΔT: ${Math.round(metrics.deltaTime)}ms</div>
      ${memoryInfo ? `<div>MEM: ${Math.round(memoryInfo.usedJSHeapSize / 1048576)}MB</div>` : ''}
      <div>Status: ${this.gameLoop.isOptimalPerformance() ? '✅' : '⚠️'}</div>
    `;
  };
}

// Web Performance Utilities
export const WebPerformance = {
  // Optimize asset loading with lazy loading
  lazyLoadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  },
  
  // Batch DOM updates
  batchDOMUpdates(updates: (() => void)[]): void {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  },
  
  // Debounce function for performance-critical operations
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },
  
  // Throttle function for limiting function calls
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
  
  // Check if device supports high performance features
  isHighPerformanceDevice(): boolean {
    // Check for hardware concurrency (number of CPU cores)
    const cores = navigator.hardwareConcurrency || 1;
    
    // Check memory (if available)
    const memory = (navigator as any).deviceMemory || 1;
    
    // Check for WebGL support
    const canvas = document.createElement('canvas');
    const webgl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    return cores >= 4 && memory >= 2 && !!webgl;
  },
  
  // Get optimal frame rate based on device capabilities
  getOptimalFrameRate(): number {
    const isHighPerf = this.isHighPerformanceDevice();
    // Use 60fps as default since screen.refreshRate is not widely supported
    const refresh = (screen as any).refreshRate || 60;
    
    if (isHighPerf && refresh >= 120) return 120;
    if (isHighPerf && refresh >= 90) return 90;
    return 60;
  }
}; 