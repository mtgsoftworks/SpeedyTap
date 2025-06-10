import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { audioService } from '../services/AudioService';
import LanguageSelector from './LanguageSelector';
import './Settings.css';

interface SettingsProps {
  onBack: () => void;
}

interface GameSettings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  volume: number;
  difficulty: 'easy' | 'normal' | 'hard';
  showFPS: boolean;
  particleEffects: boolean;
  particleIntensity: number;
  animationSpeed: number;
  glowEffects: boolean;
  shadowIntensity: number;
  comboDisplayEnabled: boolean;
  powerUpDisplayEnabled: boolean;
  comboSoundEnabled: boolean;
  powerUpSoundEnabled: boolean;
  lowPowerMode: boolean;
}

const Settings = ({ onBack }: SettingsProps) => {
  const { t } = useTranslation();
  
  // Default settings
  const defaultSettings: GameSettings = {
    soundEnabled: true,
    hapticEnabled: true,
    volume: 0.8,
    difficulty: 'normal',
    showFPS: false,
    particleEffects: true,
    particleIntensity: 80,
    animationSpeed: 100,
    glowEffects: true,
    shadowIntensity: 70,
    comboDisplayEnabled: true,
    powerUpDisplayEnabled: true,
    comboSoundEnabled: true,
    powerUpSoundEnabled: true,
    lowPowerMode: false
  };

  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentTab] = useState<'general'>('general');

  // LocalStorage'dan ayarları yükle
  useEffect(() => {
    const savedSettings = localStorage.getItem('speedytap_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Settings could not be loaded:', error);
      }
    }
  }, []);

  // Ayarları kaydet
  const saveSettings = async () => {
    try {
      localStorage.setItem('speedytap_settings', JSON.stringify(settings));
      audioService.setVolume(settings.volume);
      setHasChanges(false);
      
      await audioService.playClick();
      alert(t('common.save') + ' ' + t('common.ok') + '!');
    } catch (error) {
      console.error('Settings could not be saved:', error);
      alert(t('settings.save_error'));
    }
  };

  // Ayarları sıfırla
  const resetSettings = async () => {
    if (confirm(t('common.confirm') + '?')) {
      setSettings(defaultSettings);
      setHasChanges(true);
      await audioService.playClick();
    }
  };

  // Settings değişikliklerini takip et
  const updateSetting = (key: keyof GameSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleBack = async () => {
    if (hasChanges) {
      if (confirm(t('settings.unsaved_changes'))) {
        await audioService.playClick();
        onBack();
      }
    } else {
      await audioService.playClick();
      onBack();
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button className="back-btn" onClick={handleBack}>
          ← {t('settings.back')}
        </button>
        <h2>🔧 {t('settings.title')}</h2>
      </div>

      <div className="settings-content">
        <div className="settings-tabs">
          <button 
            className={`tab-btn ${currentTab === 'general' ? 'active' : ''}`}
          >
            🎮 {t('menu.settings')}
          </button>
        </div>

        <div className="settings-sections">
          {currentTab === 'general' && (
            <>
              {/* Dil Seçici */}
              <div className="settings-section">
                <h3>🌍 {t('settings.language')}</h3>
                <LanguageSelector />
              </div>

              <div className="settings-section">
                <h3>🔊 {t('settings.sound')}</h3>
                
                <div className="setting-item">
                  <label>{t('settings.sound')}</label>
                  <button 
                    className={`toggle-btn ${settings.soundEnabled ? 'active' : ''}`}
                    onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                  >
                    {settings.soundEnabled ? t('common.on') : t('common.off')}
                  </button>
                </div>

                <div className="setting-item">
                  <label>{t('settings.volume_level')}</label>
                  <div className="volume-control">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.volume}
                      onChange={(e) => updateSetting('volume', parseFloat(e.target.value))}
                      disabled={!settings.soundEnabled}
                    />
                    <span>{Math.round(settings.volume * 100)}%</span>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>🎮 {t('game.title')}</h3>
                
                <div className="setting-item">
                  <label>{t('settings.difficulty')}</label>
                  <div className="difficulty-selector">
                    <button 
                      className={`difficulty-btn ${settings.difficulty === 'easy' ? 'active' : ''}`}
                      onClick={() => updateSetting('difficulty', 'easy')}
                    >
                      🟢 {t('settings.difficulty_easy')}
                    </button>
                    <button 
                      className={`difficulty-btn ${settings.difficulty === 'normal' ? 'active' : ''}`}
                      onClick={() => updateSetting('difficulty', 'normal')}
                    >
                      🟡 {t('settings.difficulty_normal')}
                    </button>
                    <button 
                      className={`difficulty-btn ${settings.difficulty === 'hard' ? 'active' : ''}`}
                      onClick={() => updateSetting('difficulty', 'hard')}
                    >
                      🔴 {t('settings.difficulty_hard')}
                    </button>
                  </div>
                </div>

                <div className="setting-item">
                  <label>{t('settings.vibration')}</label>
                  <button 
                    className={`toggle-btn ${settings.hapticEnabled ? 'active' : ''}`}
                    onClick={() => updateSetting('hapticEnabled', !settings.hapticEnabled)}
                  >
                    {settings.hapticEnabled ? t('common.on') : t('common.off')}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="settings-section">
            <div className="settings-actions">
              <button 
                className={`save-btn ${hasChanges ? 'enabled' : 'disabled'}`}
                onClick={saveSettings}
                disabled={!hasChanges}
              >
                💾 {t('common.save')}
              </button>
              <button className="reset-btn" onClick={resetSettings}>
                🔄 {t('settings.reset')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 