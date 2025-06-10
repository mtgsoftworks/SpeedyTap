import { useTranslation } from 'react-i18next';

interface AboutProps {
  onBack: () => void;
}

const About = ({ onBack }: AboutProps) => {
  const { t } = useTranslation();

  return (
    <div className="about-page">
      <div className="about-content">
        <div className="about-header">
          <h2>{t('menu.about')}</h2>
        </div>
        <div className="about-info">
          <p><strong>{t('game.title')}</strong> - {t('about.description')}</p>
          <p>{t('about.instruction')}</p>
          <br />
          <p>{t('about.developer')}: <strong>Mesut Taha Güven</strong></p>
          <br />
          <p>{t('about.version')}: 2.0.0</p>
          <br />
          <div className="copyright">
            <p>2025 © MTG Softworks · SpeedyTap™ Game · All Rights Reserved</p>
          </div>
        </div>
        <div className="about-buttons">
          <button className="about-btn primary" onClick={onBack}>
            <span>{t('settings.back')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default About; 