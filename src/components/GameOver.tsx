import { useTranslation } from 'react-i18next';

interface GameOverProps {
  score: number;
  highScore: number;
  onTryAgain: () => void;
  onMenu: () => void;
}

const GameOver = ({ score, highScore, onTryAgain, onMenu }: GameOverProps) => {
  const { t } = useTranslation();
  const isNewHighScore = score > highScore;

  return (
    <div className="game-over">
      <div className="game-over-content">
        <div className="game-over-header">
          <h2>{isNewHighScore ? t('game.new_record') : t('game.game_over')}</h2>
          <div className="final-score">
            <span className="score-label">{t('game.final_score')}</span>
            <span className="score-value">{score.toLocaleString()}</span>
          </div>
          {isNewHighScore && <p className="new-record-text">{t('game.congratulations')}</p>}
        </div>
        <div className="game-over-buttons">
          <button className="game-over-btn primary" onClick={onTryAgain}>
            <span>{t('game.try_again')}</span>
          </button>
          <button className="game-over-btn secondary" onClick={onMenu}>
            <span>{t('menu.main_menu')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver; 