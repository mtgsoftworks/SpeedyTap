interface LevelPassedProps {
  score: number;
  level: number;
  onContinue: () => void;
  onMenu: () => void;
}

const LevelPassed = ({ score, level, onContinue, onMenu }: LevelPassedProps) => {
  return (
    <div className="level-passed">
      <div className="level-passed-content">
        <div className="level-passed-header">
          <h2>Seviye Tamamlandı!</h2>
          <div className="level-info">
            <span className="level-label">Seviye {level}</span>
            <span className="score-value">{score.toLocaleString()}</span>
          </div>
          <p className="next-level-text">Sonraki seviye daha zor olacak!</p>
        </div>
        <div className="level-passed-buttons">
          <button className="level-btn primary" onClick={onContinue}>
            <span>Devam Et</span>
          </button>
          <button className="level-btn secondary" onClick={onMenu}>
            <span>Ana Menü</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelPassed; 