import { useEffect, useState } from 'react';
import { DailyChallengeService } from '../services/DailyChallengeService';
import type { DailyChallenge, DailyChallengeProgress } from '../services/DailyChallengeService';
import './DailyChallenges.css';

interface DailyChallengesProps {
  onBack: () => void;
  onStartChallenge?: (challenge: DailyChallenge) => void;
}

const DailyChallenges = ({ onBack, onStartChallenge }: DailyChallengesProps) => {
  const [todaysChallenge, setTodaysChallenge] = useState<DailyChallenge | null>(null);
  const [challengeProgress, setChallengeProgress] = useState<DailyChallengeProgress | null>(null);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalPoints: 0,
    streak: 0
  });

  const challengeService = DailyChallengeService.getInstance();

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = () => {
    const challenge = challengeService.getTodaysChallenge();
    setTodaysChallenge(challenge);
    
    if (challenge) {
      const progress = challengeService.getChallengeProgress(challenge.id);
      setChallengeProgress(progress);
    }

    setStats({
      totalCompleted: challengeService.getCompletedChallengesCount(),
      totalPoints: challengeService.getTotalPointsEarned(),
      streak: challengeService.getStreakDays()
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#22C55E';
      case 'medium': return '#EAB308';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Kolay';
      case 'medium': return 'Orta';
      case 'hard': return 'Zor';
      default: return 'Bilinmeyen';
    }
  };

  const getProgressPercentage = (challenge: DailyChallenge, progress: DailyChallengeProgress | null) => {
    if (!progress) return 0;
    return Math.min((progress.progress / challenge.target) * 100, 100);
  };

  const formatTimeRemaining = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeRemaining = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}s ${minutes}d`;
  };

  const handleStartChallenge = () => {
    if (todaysChallenge && onStartChallenge) {
      onStartChallenge(todaysChallenge);
    }
  };

  return (
    <div className="daily-challenges">
      <div className="challenges-header">
        <button className="back-btn" onClick={onBack}>
          ← Geri
        </button>
        <h2>Günlük Görevler</h2>
      </div>

      {/* Stats overview */}
      <div className="challenge-stats">
        <div className="stat-item">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{stats.totalCompleted}</div>
          <div className="stat-label">Tamamlanan</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">💎</div>
          <div className="stat-value">{stats.totalPoints}</div>
          <div className="stat-label">Toplam Puan</div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats.streak}</div>
          <div className="stat-label">Seri</div>
        </div>
      </div>

      {/* Today's Challenge */}
      <div className="todays-challenge-section">
        <div className="section-header">
          <h3>Bugünün Görevi</h3>
          <div className="time-remaining">
            ⏰ {formatTimeRemaining()} kaldı
          </div>
        </div>

        {todaysChallenge ? (
          <div className={`challenge-card today ${challengeProgress?.completed ? 'completed' : ''}`}>
            <div className="challenge-header">
              <div className="challenge-icon">{todaysChallenge.icon}</div>
              <div className="challenge-info">
                <h4 className="challenge-title">{todaysChallenge.title}</h4>
                <p className="challenge-description">{todaysChallenge.description}</p>
              </div>
              <div className="challenge-difficulty">
                <span 
                  className="difficulty-badge"
                  style={{ backgroundColor: getDifficultyColor(todaysChallenge.difficulty) }}
                >
                  {getDifficultyText(todaysChallenge.difficulty)}
                </span>
              </div>
            </div>

            <div className="challenge-progress">
              <div className="progress-info">
                <span className="progress-label">İlerleme</span>
                <span className="progress-value">
                  {challengeProgress?.progress || 0} / {todaysChallenge.target}
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${getProgressPercentage(todaysChallenge, challengeProgress)}%` 
                  }}
                />
              </div>
            </div>

            <div className="challenge-reward">
              <div className="reward-info">
                <span className="reward-icon">{todaysChallenge.reward.badge}</span>
                <span className="reward-text">+{todaysChallenge.reward.points} puan</span>
              </div>
              
              {challengeProgress?.completed ? (
                <div className="completed-badge">
                  <span className="completed-icon">✅</span>
                  <span className="completed-text">Tamamlandı!</span>
                </div>
              ) : (
                <button className="start-challenge-btn" onClick={handleStartChallenge}>
                  <span className="play-icon">▶️</span>
                  Göreve Başla
                </button>
              )}
            </div>

            {challengeProgress && challengeProgress.attempts > 0 && (
              <div className="challenge-attempts">
                <div className="attempts-info">
                  <span className="attempts-icon">🎯</span>
                  <span className="attempts-text">
                    {challengeProgress.attempts} deneme yapıldı
                  </span>
                  {challengeProgress.bestScore && (
                    <span className="best-score">
                      (En iyi: {challengeProgress.bestScore.toLocaleString()})
                    </span>
                  )}
                </div>
              </div>
            )}

            {challengeProgress?.completed && (
              <div className="completion-effects">
                <div className="completion-particles">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`particle particle-${i + 1}`}>✨</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-challenge">
            <div className="no-challenge-icon">🎯</div>
            <h4>Görev yükleniyor...</h4>
            <p>Bugünün görevi hazırlanıyor, lütfen bekleyin.</p>
          </div>
        )}
      </div>

      {/* Challenge Types Info */}
      <div className="challenge-types-section">
        <h3>Görev Türleri</h3>
        <div className="challenge-types-grid">
          <div className="type-card">
            <div className="type-icon">🎯</div>
            <h4>Skor Ustası</h4>
            <p>Belirli bir skora ulaş</p>
          </div>
          <div className="type-card">
            <div className="type-icon">🎪</div>
            <h4>Hassas Nişancı</h4>
            <p>Yüksek isabet oranı</p>
          </div>
          <div className="type-card">
            <div className="type-icon">🔥</div>
            <h4>Kombo Kralı</h4>
            <p>Uzun kombo zincirleri</p>
          </div>
          <div className="type-card">
            <div className="type-icon">⚡</div>
            <h4>Hız Şampiyonu</h4>
            <p>Hızlı puan toplama</p>
          </div>
          <div className="type-card">
            <div className="type-icon">⚔️</div>
            <h4>Hayatta Kalma</h4>
            <p>Uzun süre hayatta kal</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="tips-section">
        <h3>💡 İpuçları</h3>
        <div className="tips-list">
          <div className="tip-item">
            <span className="tip-icon">🎯</span>
            <span className="tip-text">Her gün yeni bir görev otomatik olarak oluşturulur</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🔥</span>
            <span className="tip-text">Ardışık günlerde görev tamamlayarak seri yapabilirsin</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">💎</span>
            <span className="tip-text">Zor görevler daha fazla puan ve özel rozetler verir</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">⏰</span>
            <span className="tip-text">Görevlerin gece yarısında yenilenir</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallenges; 