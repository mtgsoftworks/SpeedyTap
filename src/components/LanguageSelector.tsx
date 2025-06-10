import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

interface LanguageSelectorProps {
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { i18n, t } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={`language-selector ${className}`}>
      <label>{t('settings.language')}:</label>
      <div className="language-buttons">
        <button 
          className={`lang-btn ${i18n.language === 'tr' ? 'active' : ''}`}
          onClick={() => changeLanguage('tr')}
        >
          🇹🇷 {t('settings.turkish')}
        </button>
        <button 
          className={`lang-btn ${i18n.language === 'en' ? 'active' : ''}`}
          onClick={() => changeLanguage('en')}
        >
          🇺🇸 {t('settings.english')}
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector; 