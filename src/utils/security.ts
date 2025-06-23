/**
 * SpeedyTap Security Utilities
 * Runtime koruma ve anti-tampering sistemi
 */

interface SecurityCheck {
  isValid: boolean;
  threat?: string;
}

class SecurityManager {
  private static instance: SecurityManager;
  private readonly securityKey = 'ST_' + Math.random().toString(36).substr(2, 9);
  private integrityChecks: string[] = [];
  private debugCheckInterval?: number;

  private constructor() {
    this.initializeSecurity();
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Güvenlik sistemini başlat
   */
  private initializeSecurity(): void {
    this.performIntegrityCheck();
    this.startDebugProtection();
    this.detectDevTools();
    this.protectConsole();
  }

  /**
   * Kod bütünlüğü kontrolü
   */
  private performIntegrityCheck(): SecurityCheck {
    try {
      // Function toString kontrolü
      const originalAlert = window.alert;
      if (originalAlert.toString().indexOf('[native code]') === -1) {
        return { isValid: false, threat: 'Function hijacking detected' };
      }

      // Script tag kontrolü
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src && !this.isAllowedScript(scripts[i].src)) {
          return { isValid: false, threat: 'Unauthorized script injection' };
        }
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, threat: 'Integrity check failed' };
    }
  }

  /**
   * İzin verilen script kaynakları
   */
  private isAllowedScript(src: string): boolean {
    const allowedDomains = [
      location.origin,
      'https://pagead2.googlesyndication.com',
      'https://googleads.g.doubleclick.net',
    ];
    
    return allowedDomains.some(domain => src.startsWith(domain));
  }

  /**
   * Debug koruma sistemi
   */
  private startDebugProtection(): void {
    const debugCheck = () => {
      const start = performance.now();
      debugger; // Bu satır debug'da durursa tespit edilir
      const end = performance.now();
      
      if (end - start > 100) {
        this.handleSecurityThreat('Debug tools detected');
      }
    };

    // Rastgele aralıklarla debug kontrolü
    this.debugCheckInterval = window.setInterval(debugCheck, 5000 + Math.random() * 10000);
  }

  /**
   * DevTools tespit sistemi
   */
  private detectDevTools(): void {
    let devtools = { open: false, orientation: null };
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || 
          window.outerWidth - window.innerWidth > 200) {
        if (!devtools.open) {
          devtools.open = true;
          this.handleSecurityThreat('Developer tools opened');
        }
      } else {
        devtools.open = false;
      }
    }, 1000);
  }

  /**
   * Console koruma sistemi
   */
  private protectConsole(): void {
    // Console metodlarını override et
    const noop = () => {};
    if (typeof console !== 'undefined') {
      console.log = noop;
      console.warn = noop;
      console.error = noop;
      console.info = noop;
      console.debug = noop;
      console.trace = noop;
      console.dir = noop;
      console.group = noop;
      console.groupEnd = noop;
      console.time = noop;
      console.timeEnd = noop;
      console.profile = noop;
      console.profileEnd = noop;
      console.clear = noop;
    }
  }

  /**
   * Context menu engelleme
   */
  public blockContextMenu(): void {
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('selectstart', e => e.preventDefault());
    document.addEventListener('dragstart', e => e.preventDefault());
  }

  /**
   * Klavye kısayolları engelleme
   */
  public blockKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // F12, Ctrl+Shift+I, Ctrl+U vb.
      if (e.keyCode === 123 || 
          (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
          (e.ctrlKey && e.keyCode === 85)) {
        e.preventDefault();
        this.handleSecurityThreat('Debug shortcut attempted');
      }
    });
  }

  /**
   * Güvenlik tehdidi işleme
   */
  private handleSecurityThreat(threat: string): void {
    // Oyunu durdur
    window.location.reload();
    
    // İsteğe bağlı: Sunucuya rapor gönder
    // this.reportThreat(threat);
  }

  /**
   * Tehdit raporlama (opsiyonel)
   */
  private reportThreat(threat: string): void {
    // Güvenlik olayını logla
    console.warn(`Security threat detected: ${threat}`);
  }

  /**
   * Güvenlik durumunu kontrol et
   */
  public checkSecurity(): SecurityCheck {
    return this.performIntegrityCheck();
  }

  /**
   * Güvenlik sistemini temizle
   */
  public cleanup(): void {
    if (this.debugCheckInterval) {
      clearInterval(this.debugCheckInterval);
    }
  }
}

// Export singleton instance
export const securityManager = SecurityManager.getInstance();

// Hemen başlat
securityManager.blockContextMenu();
securityManager.blockKeyboardShortcuts(); 