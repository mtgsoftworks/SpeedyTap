import i18n from '../i18n';

// Language utility functions
export class LanguageManager {
  // Mevcut dili al
  static getCurrentLanguage(): string {
    return i18n.language;
  }

  // Dil değiştir
  static async changeLanguage(language: 'tr' | 'en'): Promise<void> {
    try {
      await i18n.changeLanguage(language);
      localStorage.setItem('selectedLanguage', language);
      
      // HTML lang attribute'unu güncelle
      document.documentElement.lang = language;
      
      console.log(`🌐 Dil değiştirildi: ${language}`);
      
      // Page title'ı güncelle
      document.title = i18n.t('Speedy Tap') + ' - ' + i18n.t('Quick Reflexes Game');
      
    } catch (error) {
      console.error('❌ Dil değiştirilemedi:', error);
      throw error;
    }
  }

  // Desteklenen dilleri al
  static getSupportedLanguages(): Array<{code: string, name: string, nativeName: string}> {
    return [
      { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
      { code: 'en', name: 'English', nativeName: 'English' }
    ];
  }

  // Dil kodu geçerli mi kontrol et
  static isValidLanguage(language: string): language is 'tr' | 'en' {
    return ['tr', 'en'].includes(language);
  }

  // Tarayıcı dilini algıla
  static detectBrowserLanguage(): 'tr' | 'en' {
    const browserLang = navigator.language.toLowerCase();
    
    if (browserLang.startsWith('tr')) {
      return 'tr';
    }
    
    return 'en'; // Default to English
  }

  // Kaydedilmiş dili yükle
  static loadSavedLanguage(): 'tr' | 'en' {
    const saved = localStorage.getItem('selectedLanguage');
    
    if (saved && this.isValidLanguage(saved)) {
      return saved;
    }
    
    return this.detectBrowserLanguage();
  }

  // Translation kısayolu (global olmadan)
  static t(key: string, options?: any): string {
    return i18n.t(key, options) as string;
  }

  // Dil değişiklik listener'ı ekle
  static onLanguageChange(callback: (language: string) => void): () => void {
    i18n.on('languageChanged', callback);
    
    // Cleanup function return et
    return () => {
      i18n.off('languageChanged', callback);
    };
  }

  // Tüm çevirileri al (debug için)
  static getAllTranslations(language?: string): any {
    const lang = language || this.getCurrentLanguage();
    return i18n.getResourceBundle(lang, 'translation');
  }

  // Eksik çevirileri kontrol et
  static checkMissingTranslations(): void {
    const supportedLangs = ['tr', 'en'];
    const allKeys = new Set<string>();
    
    // Tüm key'leri topla
    supportedLangs.forEach(lang => {
      const translations = this.getAllTranslations(lang);
      Object.keys(translations).forEach(key => allKeys.add(key));
    });

    // Eksik key'leri bul
    supportedLangs.forEach(lang => {
      const translations = this.getAllTranslations(lang);
      const missingKeys = Array.from(allKeys).filter(key => !translations[key]);
      
      if (missingKeys.length > 0) {
        console.warn(`🔍 ${lang.toUpperCase()} dilinde eksik çeviriler:`, missingKeys);
      }
    });
  }
}

// React Hook benzeri kullanım için
export class I18nReactive {
  private static listeners: Array<() => void> = [];

  // Component'lar için reactive hook benzeri
  static useTranslation(): {
    t: (key: string, options?: any) => string;
    language: string;
    changeLanguage: (lang: 'tr' | 'en') => Promise<void>;
  } {
    return {
      t: (key: string, options?: any): string => i18n.t(key, options) as string,
      language: LanguageManager.getCurrentLanguage(),
      changeLanguage: async (lang: 'tr' | 'en') => {
        await LanguageManager.changeLanguage(lang);
        // Notify all listeners
        this.listeners.forEach(listener => listener());
      }
    };
  }

  // Listener ekle
  static subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

// Global t function (optional, direkt LanguageManager.t kullanılabilir)
export const t = (key: string, options?: any): string => {
  return i18n.t(key, options) as string;
};

export default LanguageManager; 