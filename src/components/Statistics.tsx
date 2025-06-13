import { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
import { StatisticsService } from '../services/StatisticsService';
import type { GameStatistics, Achievement } from '../services/StatisticsService';
import './Statistics.css';

interface StatisticsProps {
  onBack: () => void;
}

const Statistics = ({ onBack }: StatisticsProps) => {
  // const { t } = useTranslation();
  const [stats, setStats] = useState<GameStatistics | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'records'>('overview');

  const statisticsService = StatisticsService.getInstance();

  useEffect(() => {
    const currentStats = statisticsService.getStatistics();
    const currentAchievements = statisticsService.getAchievements();
    
    setStats(currentStats);
    setAchievements(currentAchievements);
  }, []);

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}s ${minutes % 60}d ${seconds % 60}sn`;
    } else if (minutes > 0) {
      return `${minutes}d ${seconds % 60}sn`;
    } else {
      return `${seconds}sn`;
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('tr-TR');
  };

  const getAchievementProgress = (achievement: Achievement) => {
    return Math.min((achievement.progress / achievement.maxProgress) * 100, 100);
  };

  if (!stats) {
    return (
      <div className="statistics-loading">
        <div className="loading-spinner">📊</div>
        <p>İstatistikler yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="statistics-page">
      <div className="statistics-header">
        <button className="back-btn" onClick={onBack}>
          ← Geri
        </button>
        <h2>İstatistikler</h2>
      </div>

      <div className="statistics-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Genel Bakış
        </button>
        <button
          className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          🏆 Başarımlar
        </button>
        <button
          className={`tab-btn ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          🥇 Rekorlar
        </button>
      </div>

      <div className="statistics-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card highlight">
                <div className="stat-icon">🎯</div>
                <div className="stat-value">{stats.totalGamesPlayed}</div>
                <div className="stat-label">Toplam Oyun</div>
              </div>
              
              <div className="stat-card highlight">
                <div className="stat-icon">👑</div>
                <div className="stat-value">{stats.highScore.toLocaleString()}</div>
                <div className="stat-label">En Yüksek Skor</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⏱️</div>
                <div className="stat-value">{formatTime(stats.totalTimePlayed)}</div>
                <div className="stat-label">Toplam Süre</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-value">{stats.averageScore.toLocaleString()}</div>
                <div className="stat-label">Ortalama Skor</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-value">{stats.maxCombo}</div>
                <div className="stat-label">Maksimum Kombo</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🎪</div>
                <div className="stat-value">{stats.accuracy.toFixed(1)}%</div>
                <div className="stat-label">İsabet Oranı</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🏔️</div>
                <div className="stat-value">{stats.maxLevelReached}</div>
                <div className="stat-label">Maksimum Level</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">✨</div>
                <div className="stat-value">{stats.perfectStreaks}</div>
                <div className="stat-label">Mükemmel Seriler</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-tab">
            <div className="achievements-summary">
              <div className="achievement-progress-overview">
                <h3>Başarım İlerlemesi</h3>
                <div className="achievement-stats">
                  <span className="unlocked-count">
                    {achievements.filter(a => a.unlocked).length}
                  </span>
                  <span className="total-count">/ {achievements.length}</span>
                  <span className="percentage">
                    ({Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="achievements-list">
              {achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="achievement-icon-wrapper">
                    <span className="achievement-icon">{achievement.icon}</span>
                    {achievement.unlocked && <div className="unlock-glow" />}
                  </div>
                  
                  <div className="achievement-info">
                    <h4 className="achievement-name">{achievement.title}</h4>
                    <p className="achievement-desc">{achievement.description}</p>
                    
                    <div className="achievement-progress-bar">
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${getAchievementProgress(achievement)}%` }}
                        />
                      </div>
                      <span className="progress-numbers">
                        {achievement.progress} / {achievement.maxProgress}
                      </span>
                    </div>
                  </div>
                  
                  {achievement.unlocked && (
                    <div className="unlock-badge">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="records-tab">
            <div className="records-grid">
              <div className="record-card">
                <h3>📈 Skor Rekorları</h3>
                <div className="record-item">
                  <span className="record-label">En Yüksek Skor:</span>
                  <span className="record-value">{stats.highScore.toLocaleString()}</span>
                </div>
                <div className="record-item">
                  <span className="record-label">Ortalama Skor:</span>
                  <span className="record-value">{stats.averageScore.toLocaleString()}</span>
                </div>
                <div className="record-item">
                  <span className="record-label">Toplam Skor:</span>
                  <span className="record-value">{stats.totalScore.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="record-card">
                <h3>⚡ Performans Rekorları</h3>
                <div className="record-item">
                  <span className="record-label">Maksimum Kombo:</span>
                  <span className="record-value">{stats.maxCombo}</span>
                </div>
                <div className="record-item">
                  <span className="record-label">İsabet Oranı:</span>
                  <span className="record-value">{stats.accuracy.toFixed(1)}%</span>
                </div>
                <div className="record-item">
                  <span className="record-label">En Hızlı Tap:</span>
                  <span className="record-value">{stats.fastestTap}ms</span>
                </div>
              </div>
              
              <div className="record-card">
                <h3>🎮 Oyun Rekorları</h3>
                <div className="record-item">
                  <span className="record-label">Maksimum Level:</span>
                  <span className="record-value">{stats.maxLevelReached}</span>
                </div>
                <div className="record-item">
                  <span className="record-label">Tamamlanan Levellar:</span>
                  <span className="record-value">{stats.totalLevelsCompleted}</span>
                </div>
                <div className="record-item">
                  <span className="record-label">Mükemmel Seriler:</span>
                  <span className="record-value">{stats.perfectStreaks}</span>
                </div>
              </div>
              
              <div className="record-card">
                <h3>📅 Genel İstatistikler</h3>
                <div className="record-item">
                  <span className="record-label">İlk Oyun:</span>
                  <span className="record-value">{formatDate(stats.firstPlayDate)}</span>
                </div>
                <div className="record-item">
                  <span className="record-label">Son Oyun:</span>
                  <span className="record-value">{formatDate(stats.lastPlayDate)}</span>
                </div>
                <div className="record-item">
                  <span className="record-label">Ardışık Günler:</span>
                  <span className="record-value">{stats.consecutiveDays}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics; 