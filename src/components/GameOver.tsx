interface GameOverProps {
  score: number;
  highScore: number;
  onTryAgain: () => void;
  onMenu: () => void;
}

const GameOver = ({ score, highScore, onTryAgain, onMenu }: GameOverProps) => {
  const isNewHighScore = score > highScore;

  return (
    <div className="game-over">
      <div className="game-over-content">
        <div className="game-over-header">
          <h2>{isNewHighScore ? 'Yeni Rekor!' : 'Oyun Bitti'}</h2>
          <div className="final-score">
            <span className="score-label">Final Skor</span>
            <span className="score-value">{score.toLocaleString()}</span>
          </div>
          {isNewHighScore && <p className="new-record-text">Tebrikler! Yeni rekor kırdınız!</p>}
        </div>
        <div className="game-over-buttons">
          <button className="game-over-btn primary" onClick={onTryAgain}>
            <span>Tekrar Dene</span>
          </button>
          <button className="game-over-btn secondary" onClick={onMenu}>
            <span>Ana Menü</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver; 