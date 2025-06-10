import { useTranslation } from 'react-i18next';
import { audioService } from '../services/AudioService';
import './GameMenu.css';

interface GameMenuProps {
  highScore: number;
  onNewGame: () => void;
  onAbout: () => void;
  onSettings: () => void;
}

const GameMenu = ({ highScore, onNewGame, onAbout, onSettings }: GameMenuProps) => {
  const { t } = useTranslation();

  const handleNewGame = async () => {
    await audioService.playClick();
    onNewGame();
  };

  const handleAbout = async () => {
    await audioService.playButtonTap();
    onAbout();
  };

  const handleSettings = async () => {
    await audioService.playButtonTap();
    onSettings();
  };
  return (
    <div className="game-menu">
      <div className="menu-content">
        <div className="menu-header">
          <div className="menu-logo">
            <div className="logo-circle"></div>
          </div>
          <h1 className="menu-title">{t('game.title')}</h1>
          <p className="menu-subtitle">{t('game.subtitle')}</p>
        </div>

        <div className="menu-stats">
          <div className="high-score">
            <span className="high-score-label">{t('statistics.best_score')}</span>
            <span className="high-score-value">{highScore.toLocaleString()}</span>
          </div>
        </div>

        <div className="menu-buttons">
          <button className="menu-btn primary" onClick={handleNewGame}>
            <span>{t('menu.play')}</span>
          </button>
          <button className="menu-btn secondary" onClick={handleSettings}>
            <span>⚙️ {t('menu.settings')}</span>
          </button>
          <button className="menu-btn secondary" onClick={handleAbout}>
            <span>{t('menu.about')}</span>
          </button>
        </div>

        <div className="menu-footer">
          <p>{t('game.subtitle')}</p>
          <div className="copyright">
            <p>2025 © MTG Softworks · SpeedyTap™ Game · All Rights Reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMenu; 