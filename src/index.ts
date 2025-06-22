// Entry Point - Modern SpeedyTap Architecture
// Rule 3: Clean Navigation - App.ts remains clean with provider wrappers only

import './i18n'; // i18n configuration
import '@/assets';
import { APP_CONFIG } from '@/config';
import { preventZoomAndScroll, detectMobileFeatures } from '@/utils';
import { SpeedyTapApp } from '@/navigation';

// Mobile optimizations
import { CapacitorConfig } from '@capacitor/cli';

// Capacitor integration
let Capacitor: any;
let StatusBar: any;
let SplashScreen: any;

// Module hot replacement types
declare const module: NodeJS.Module & {
  hot?: {
    accept: (dependency?: string, callback?: () => void) => void;
  };
};

// Capacitor modules yüklenmesi
async function loadCapacitorModules() {
  try {
    const capacitorCore = await import('@capacitor/core');
    Capacitor = capacitorCore.Capacitor;
    
    if (Capacitor?.isNativePlatform()) {
      const statusBarModule = await import('@capacitor/status-bar');
      const splashScreenModule = await import('@capacitor/splash-screen');
      
      StatusBar = statusBarModule.StatusBar;
      SplashScreen = splashScreenModule.SplashScreen;
      
      console.log('📱 Capacitor modülleri yüklendi');
    }
  } catch (error) {
    console.warn('⚠️ Capacitor modülleri yüklenemedi (web modunda çalışıyor):', error);
  }
}

// Enhanced error handling
class AppError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AppError';
  }
}

// Main application initialization
async function initializeApp(): Promise<void> {
  console.log('🚀 SpeedyTap Modern Architecture başlatılıyor...');
  
  try {
    // Load Capacitor modules if available
    await loadCapacitorModules();
    
    // Hide splash screen
    if (SplashScreen) {
      await SplashScreen.hide();
    }
    
    // Configure status bar
    if (StatusBar) {
      await StatusBar.setStyle({ style: 'DARK' });
      await StatusBar.setBackgroundColor({ color: '#000000' });
    }
    
    // Get app container
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      throw new AppError('App container bulunamadı', 'CONTAINER_NOT_FOUND');
    }
    
    // Initialize SpeedyTap application
    const app = new SpeedyTapApp(appContainer);
    await app.initialize();
    
    // Mobile optimizations
    initializeMobileOptimizations();
    
    // Development mode configurations
    if (APP_CONFIG.DEVELOPMENT.WEBPACK_DEV_SERVER) {
      enableHotModuleReplacement();
    }
    
    console.log('✅ SpeedyTap başarıyla başlatıldı!');
    
  } catch (error) {
    console.error('❌ Uygulama başlatılamadı:', error);
    showErrorScreen(error as Error);
  }
}

// Mobile optimizations
function initializeMobileOptimizations(): void {
  // Prevent zoom on mobile
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  }
  
  // Prevent rubber band effect on iOS
  document.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });
  
  // Prevent double tap zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // Add mobile-specific CSS class
  document.body.classList.add('mobile-optimized');
  
  console.log('📱 Mobile optimizasyonları aktif');
}

// Hot module replacement for development
function enableHotModuleReplacement(): void {
  try {
    if (typeof module !== 'undefined' && module.hot) {
      module.hot.accept('./navigation', () => {
        console.log('🔄 Navigation module güncellendi');
        // Graceful reload of navigation
        location.reload();
      });
      
      module.hot.accept('@/assets', () => {
        console.log('🎨 Assets güncellendi');
      });
      
      console.log('🔥 Hot Module Replacement aktif');
    }
  } catch (error) {
    console.warn('HMR desteklenmiyor:', error);
  }
}

// Error screen display
function showErrorScreen(error: Error): void {
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.innerHTML = `
      <div class="error-screen">
        <div class="error-content">
          <h2>⚠️ Bir Hata Oluştu</h2>
          <p>Uygulama başlatılırken bir sorun meydana geldi.</p>
          <details>
            <summary>Teknik Detaylar</summary>
            <pre>${error.message}</pre>
            ${error.stack ? `<pre>${error.stack}</pre>` : ''}
          </details>
          <button onclick="location.reload()" class="retry-button">
            🔄 Tekrar Dene
          </button>
        </div>
      </div>
    `;
  }
}

// DOM ready check
function domReady(callback: () => void): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

// Initialize when DOM is ready (orijinal habibiScript.js'teki gibi)
domReady(() => {
  initializeApp().catch(error => {
    console.error('❌ Kritik başlatma hatası:', error);
    showErrorScreen(error as Error);
  });
});

// Export for global access if needed
declare global {
  interface Window {
    SpeedyTapApp?: any;
  }
}

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('💥 Global hata:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('💥 Yakalanmamış Promise hatası:', event.reason);
});

// Capacitor ready event
document.addEventListener('deviceready', () => {
  console.log('📱 Capacitor cihaz hazır');
});

console.log('🎮 SpeedyTap Modern - Orijinal Oyun Mantığı Korunarak Modernize Edildi'); 