import { useTranslation } from 'react-i18next';
import { audioService } from '../services/AudioService';
import './GameMenu.css';

interface GameMenuProps {
  highScore: number;
  onNewGame: () => void;
  onModeSelector: () => void;
  onStatistics: () => void;
  onDailyChallenges: () => void;
  onShop: () => void;
  onAbout: () => void;
  onSettings: () => void;
}

const GameMenu = ({ 
  highScore, 
  onNewGame, 
  onModeSelector,
  onStatistics,
  onDailyChallenges,
  onShop,
  onAbout, 
  onSettings 
}: GameMenuProps) => {
  const { t } = useTranslation();

  const handleNewGame = async () => {
    await audioService.playClick();
    onNewGame();
  };

  const handleModeSelector = async () => {
    await audioService.playButtonTap();
    onModeSelector();
  };

  const handleStatistics = async () => {
    await audioService.playButtonTap();
    onStatistics();
  };

  const handleDailyChallenges = async () => {
    await audioService.playButtonTap();
    onDailyChallenges();
  };

  const handleShop = async () => {
    await audioService.playButtonTap();
    onShop();
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
            <span>🎯 Hızlı Başlat</span>
          </button>
          
          <div className="menu-grid">
            <button className="menu-btn secondary grid-btn" onClick={handleModeSelector}>
              <span className="btn-icon">🎮</span>
              <span className="btn-text">Oyun Modları</span>
            </button>
            <button className="menu-btn secondary grid-btn" onClick={handleDailyChallenges}>
              <span className="btn-icon">📅</span>
              <span className="btn-text">Günlük Görevler</span>
            </button>
            <button className="menu-btn secondary grid-btn shop-btn" onClick={handleShop}>
              <span className="btn-icon">🏪</span>
              <span className="btn-text">Mağaza</span>
            </button>
            <button className="menu-btn secondary grid-btn" onClick={handleStatistics}>
              <span className="btn-icon">📊</span>
              <span className="btn-text">İstatistikler</span>
            </button>
            <button className="menu-btn secondary grid-btn" onClick={handleSettings}>
              <span className="btn-icon">⚙️</span>
              <span className="btn-text">{t('menu.settings')}</span>
            </button>
          </div>
          
          <button className="menu-btn tertiary" onClick={handleAbout}>
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