import './GamePause.css';

interface GamePauseProps {
  score: number;
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

const GamePause = ({ score, onResume, onRestart, onMenu }: GamePauseProps) => {
  return (
    <div className="game-pause">
      <div className="pause-content">
        <div className="pause-header">
          <h2>Oyun Duraklatıldı</h2>
          <div className="current-score">
            <span className="score-label">Mevcut Skor</span>
            <span className="score-value">{score.toLocaleString()}</span>
          </div>
        </div>

        <div className="pause-buttons">
          <button className="pause-btn primary" onClick={onResume}>
            <span>Devam Et</span>
          </button>
          <button className="pause-btn secondary" onClick={onRestart}>
            <span>Yeniden Başla</span>
          </button>
          <button className="pause-btn tertiary" onClick={onMenu}>
            <span>Ana Menü</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamePause; 