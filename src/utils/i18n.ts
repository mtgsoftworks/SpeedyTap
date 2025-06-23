import i18nInstance from '../i18n/index';

// Language utility functions
export class LanguageManager {
  // Mevcut dili al
  static getCurrentLanguage(): string {
    return i18nInstance.language;
  }

  // Dil değiştir
  static async changeLanguage(language: 'tr' | 'en'): Promise<void> {
    try {
      await i18nInstance.changeLanguage(language);
      localStorage.setItem('selectedLanguage', language);
      
      // HTML lang attribute'unu güncelle
      document.documentElement.lang = language;
      
      console.log(`🌐 Dil değiştirildi: ${language}`);
      
      // Page title'ı güncelle
      document.title = i18nInstance.t('navigation.speedyTap') + ' - ' + i18nInstance.t('navigation.quickReflexesGame');
      
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

  // Geçerli dil kontrolü
  private static isValidLanguage(lang: string): lang is 'tr' | 'en' {
    return lang === 'tr' || lang === 'en';
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
    return i18nInstance.t(key, options) as string;
  }

  // Dil değişiklik listener'ı ekle (i18next built-in event system kullanarak)
  static onLanguageChange(callback: (language: string) => void): () => void {
    i18nInstance.on('languageChanged', callback);
    
    // Cleanup function return et
    return () => {
      i18nInstance.off('languageChanged', callback);
    };
  }

  // Tüm çevirileri al (debug için)
  static getAllTranslations(language?: string): any {
    const lang = language || this.getCurrentLanguage();
    return i18nInstance.getResourceBundle(lang, 'translation');
  }

  // Initialize language system
  static async initialize(): Promise<void> {
    try {
      const savedLanguage = this.loadSavedLanguage();
      await this.changeLanguage(savedLanguage);
      console.log('✅ ' + i18nInstance.t('debug.languageManagerInitialized'));
    } catch (error) {
      console.error('❌ Failed to initialize Language Manager:', error);
      throw error;
    }
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
      t: (key: string, options?: any): string => i18nInstance.t(key, options) as string,
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
  return i18nInstance.t(key, options) as string;
};

export default LanguageManager; 