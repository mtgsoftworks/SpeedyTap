import { useState } from 'react';
// import { useTranslation } from 'react-i18next';
import './GameModeSelector.css';

export type GameMode = 'classic' | 'target' | 'survival' | 'speed';

interface GameModeInfo {
  id: GameMode;
  title: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  unlocked: boolean;
}

interface GameModeSelectorProps {
  onSelectMode: (mode: GameMode) => void;
  onBack: () => void;
}

const GameModeSelector = ({ onSelectMode, onBack }: GameModeSelectorProps) => {
  // const { t } = useTranslation();
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');

  const gameModes: GameModeInfo[] = [
    {
      id: 'classic',
      title: 'Klasik Mod',
      description: 'Geleneksel oyun modu. Mavi dairelere tıkla, kırmızılardan kaçın!',
      icon: '🎯',
      difficulty: 'easy',
      unlocked: true
    },
    {
      id: 'target',
      title: 'Hedef Modu',
      description: 'Sadece mavi daireler! Belirli sayıda hedefe ulaş.',
      icon: '🏹',
      difficulty: 'medium',
      unlocked: true
    },
    {
      id: 'survival',
      title: 'Hayatta Kalma',
      description: 'Çok fazla kırmızı daire! Mümkün olduğunca uzun süre hayatta kal.',
      icon: '⚔️',
      difficulty: 'hard',
      unlocked: true
    },
    {
      id: 'speed',
      title: 'Hız Modu',
      description: 'Ultra hızlı oyun! Daireler çok hızlı beliriyor ve kayboluyor.',
      icon: '⚡',
      difficulty: 'extreme',
      unlocked: true
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#22C55E';
      case 'medium': return '#EAB308';
      case 'hard': return '#EF4444';
      case 'extreme': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Kolay';
      case 'medium': return 'Orta';
      case 'hard': return 'Zor';
      case 'extreme': return 'Ekstrem';
      default: return 'Bilinmeyen';
    }
  };

  return (
    <div className="game-mode-selector">
      <div className="mode-selector-header">
        <button className="back-btn" onClick={onBack}>
          ← Geri
        </button>
        <h2>Oyun Modu Seç</h2>
      </div>

      <div className="mode-grid">
        {gameModes.map(mode => (
          <div
            key={mode.id}
            className={`mode-card ${selectedMode === mode.id ? 'selected' : ''} ${!mode.unlocked ? 'locked' : ''}`}
            onClick={() => mode.unlocked && setSelectedMode(mode.id)}
          >
            <div className="mode-icon">{mode.icon}</div>
            <h3 className="mode-title">{mode.title}</h3>
            <p className="mode-description">{mode.description}</p>
            
            <div className="mode-difficulty">
              <span 
                className="difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(mode.difficulty) }}
              >
                {getDifficultyText(mode.difficulty)}
              </span>
            </div>

            {!mode.unlocked && (
              <div className="lock-overlay">
                <span className="lock-icon">🔒</span>
                <span className="unlock-text">Kilitli</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mode-actions">
        <button 
          className="play-btn primary"
          onClick={() => onSelectMode(selectedMode)}
          disabled={!gameModes.find(m => m.id === selectedMode)?.unlocked}
        >
          <span className="play-icon">▶️</span>
          Oyunu Başlat
        </button>
      </div>
    </div>
  );
};

export default GameModeSelector; 