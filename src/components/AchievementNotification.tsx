import { useEffect, useState } from 'react';
import type { Achievement } from '../services/StatisticsService';
import './AchievementNotification.css';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
  isVisible: boolean;
}

const AchievementNotification = ({ achievement, onClose, isVisible }: AchievementNotificationProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isVisible && achievement) {
      setAnimate(true);
      
      // Auto close after 4 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, achievement]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!achievement || !isVisible) return null;

  return (
    <div className={`achievement-overlay ${animate ? 'show' : ''}`}>
      <div className={`achievement-notification ${animate ? 'animate' : ''}`}>
        <div className="achievement-header">
          <div className="achievement-badge">
            <span className="achievement-icon">{achievement.icon}</span>
          </div>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="achievement-content">
          <div className="achievement-unlock-text">🎉 Başarım Açıldı!</div>
          <h3 className="achievement-title">{achievement.title}</h3>
          <p className="achievement-description">{achievement.description}</p>
          
          <div className="achievement-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${(achievement.progress / achievement.maxProgress) * 100}%` 
                }}
              />
            </div>
            <span className="progress-text">
              {achievement.progress}/{achievement.maxProgress}
            </span>
          </div>
        </div>
        
        <div className="achievement-footer">
          <div className="achievement-reward">
            <span className="reward-icon">💎</span>
            <span className="reward-text">+100 XP</span>
          </div>
        </div>
        
        <div className="achievement-particles">
          {[...Array(8)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}>✨</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification; 