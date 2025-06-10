import { useTranslation } from 'react-i18next';
import './GamePause.css';

interface GamePauseProps {
  score: number;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

const GamePause = ({ score, onResume, onRestart, onMenu }: GamePauseProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="game-pause">
      <div className="pause-content">
        <div className="pause-header">
          <h2>{t('game.paused')}</h2>
          <div className="current-score">
            <span className="score-label">{t('game.current_score')}</span>
            <span className="score-value">{score.toLocaleString()}</span>
          </div>
        </div>

        <div className="pause-buttons">
          <button className="pause-btn primary" onClick={onResume}>
            <span>{t('game.resume')}</span>
          </button>
          <button className="pause-btn secondary" onClick={onRestart}>
            <span>{t('game.restart')}</span>
          </button>
          <button className="pause-btn tertiary" onClick={onMenu}>
            <span>{t('menu.main_menu')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePause; 