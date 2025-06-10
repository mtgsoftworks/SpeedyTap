import { useTranslation } from 'react-i18next';

interface LevelPassedProps {
  score: number;
  level: number;
  onContinue: () => void;
  onMenu: () => void;
}

const LevelPassed = ({ score, level, onContinue, onMenu }: LevelPassedProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="level-passed">
      <div className="level-passed-content">
        <div className="level-passed-header">
          <h2>{t('game.level_completed')}</h2>
          <div className="level-info">
            <span className="level-label">{t('game.level')} {level}</span>
            <span className="score-value">{score.toLocaleString()}</span>
          </div>
          <p className="next-level-text">{t('game.next_level_harder')}</p>
        </div>
        <div className="level-passed-buttons">
          <button className="level-btn primary" onClick={onContinue}>
            <span>{t('game.continue')}</span>
          </button>
          <button className="level-btn secondary" onClick={onMenu}>
            <span>{t('menu.main_menu')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelPassed; 