import i18n, { Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import JSON translation files
import enTranslations from './en.json';
import trTranslations from './tr.json';

// Translation resources from JSON files
const resources: Resource = {
  en: {
    translation: enTranslations
  },
  tr: {
    translation: trTranslations
  }
};

// i18next configuration
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'tr',
    debug: false,
    
    // Interpolation settings
    interpolation: {
      escapeValue: false // React already escapes
    },
    
    // Language detection settings
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'selectedLanguage',
      excludeCacheFor: ['cimode']
    },
    
    // Namespace and separator settings
    defaultNS: 'translation',
    fallbackNS: 'translation',
    keySeparator: '.',
    nsSeparator: ':',
    
    // Load settings
    load: 'languageOnly',
    cleanCode: true,
    
    // React settings
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i']
    }
  });

// Helper function to translate using nested keys
export const t = (key: string, options?: any): string => {
  return i18n.t(key, options) as string;
};

// Helper function to get current language
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

// Helper function to change language
export const changeLanguage = async (language: 'tr' | 'en'): Promise<void> => {
  try {
    await i18n.changeLanguage(language);
    localStorage.setItem('selectedLanguage', language);
    
    // Update HTML lang attribute
    document.documentElement.lang = language;
    
    console.log(`🌐 Language changed to: ${language}`);
    
    // Update page title
    document.title = t('navigation.speedyTap') + ' - ' + t('navigation.quickReflexesGame');
    
  } catch (error) {
    console.error('❌ Failed to change language:', error);
    throw error;
  }
};

// Helper function to get supported languages
export const getSupportedLanguages = (): Array<{code: string, name: string, nativeName: string}> => {
  return [
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'en', name: 'English', nativeName: 'English' }
  ];
};

// Helper function to detect browser language
export const detectBrowserLanguage = (): 'tr' | 'en' => {
  const browserLang = navigator.language.toLowerCase();
  
  if (browserLang.startsWith('tr')) {
    return 'tr';
  }
  
  return 'en'; // Default to English
};

// Helper function to load saved language
export const loadSavedLanguage = (): 'tr' | 'en' => {
  const saved = localStorage.getItem('selectedLanguage');
  
  if (saved && (saved === 'tr' || saved === 'en')) {
    return saved as 'tr' | 'en';
  }
  
  return detectBrowserLanguage();
};

// Export the configured i18n instance as default
export default i18n; 