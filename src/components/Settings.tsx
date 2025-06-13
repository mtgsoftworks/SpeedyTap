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
      alert(t('settings.saved_successfully'));
    } catch (error) {
      console.error('Settings could not be saved:', error);
      alert(t('settings.save_error'));
    }
  };

  // Ayarları sıfırla
  const resetSettings = async () => {
    if (confirm(t('settings.reset_confirm'))) {
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
    <div className="settings-fullscreen">
      {/* Header */}
      <div className="settings-form-header">
        <button className="settings-back-btn" onClick={handleBack}>
          ← {t('common.back')}
        </button>
        <h1 className="settings-title">
          ⚙️ {t('settings.title')}
        </h1>
        <div className="header-actions">
          {hasChanges && (
            <button className="save-changes-btn" onClick={saveSettings}>
              💾 {t('common.save')}
            </button>
          )}
        </div>
      </div>

      {/* Form Content */}
      <div className="settings-form-content">
        <form className="settings-form">
          
          {/* Language Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>🌍 {t('settings.language')}</h2>
              <p className="section-desc">{t('settings.language_desc')}</p>
            </div>
            <div className="form-field">
              <LanguageSelector />
            </div>
          </div>

          {/* Audio Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>🔊 {t('settings.audio')}</h2>
              <p className="section-desc">{t('settings.audio_desc')}</p>
            </div>
            
            <div className="form-field">
              <label className="field-label">{t('settings.sound_enabled')}</label>
              <button 
                type="button"
                className={`toggle-switch ${settings.soundEnabled ? 'active' : ''}`}
                onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
              >
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  {settings.soundEnabled ? t('common.on') : t('common.off')}
                </span>
              </button>
            </div>

            <div className="form-field">
              <label className="field-label">
                {t('settings.volume_level')} ({Math.round(settings.volume * 100)}%)
              </label>
              <div className="range-input">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volume}
                  onChange={(e) => updateSetting('volume', parseFloat(e.target.value))}
                  disabled={!settings.soundEnabled}
                  className="volume-slider"
                />
                <div className="range-labels">
                  <span>🔇</span>
                  <span>🔊</span>
                </div>
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">{t('settings.combo_sound')}</label>
              <button 
                type="button"
                className={`toggle-switch ${settings.comboSoundEnabled ? 'active' : ''}`}
                onClick={() => updateSetting('comboSoundEnabled', !settings.comboSoundEnabled)}
                disabled={!settings.soundEnabled}
              >
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  {settings.comboSoundEnabled ? t('common.on') : t('common.off')}
                </span>
              </button>
            </div>

            <div className="form-field">
              <label className="field-label">{t('settings.powerup_sound')}</label>
              <button 
                type="button"
                className={`toggle-switch ${settings.powerUpSoundEnabled ? 'active' : ''}`}
                onClick={() => updateSetting('powerUpSoundEnabled', !settings.powerUpSoundEnabled)}
                disabled={!settings.soundEnabled}
              >
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  {settings.powerUpSoundEnabled ? t('common.on') : t('common.off')}
                </span>
              </button>
            </div>
          </div>

          {/* Gameplay Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>🎮 {t('settings.gameplay')}</h2>
              <p className="section-desc">{t('settings.gameplay_desc')}</p>
            </div>

            <div className="form-field">
              <label className="field-label">{t('settings.difficulty')}</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="difficulty"
                    value="easy"
                    checked={settings.difficulty === 'easy'}
                    onChange={() => updateSetting('difficulty', 'easy')}
                  />
                  <span className="radio-custom"></span>
                  <span className="radio-label">🟢 {t('settings.difficulty_easy')}</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="difficulty"
                    value="normal"
                    checked={settings.difficulty === 'normal'}
                    onChange={() => updateSetting('difficulty', 'normal')}
                  />
                  <span className="radio-custom"></span>
                  <span className="radio-label">🟡 {t('settings.difficulty_normal')}</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="difficulty"
                    value="hard"
                    checked={settings.difficulty === 'hard'}
                    onChange={() => updateSetting('difficulty', 'hard')}
                  />
                  <span className="radio-custom"></span>
                  <span className="radio-label">🔴 {t('settings.difficulty_hard')}</span>
                </label>
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">{t('settings.haptic_feedback')}</label>
              <button 
                type="button"
                className={`toggle-switch ${settings.hapticEnabled ? 'active' : ''}`}
                onClick={() => updateSetting('hapticEnabled', !settings.hapticEnabled)}
              >
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  {settings.hapticEnabled ? t('common.on') : t('common.off')}
                </span>
              </button>
            </div>
          </div>

          {/* Display Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>🎨 {t('settings.display')}</h2>
              <p className="section-desc">{t('settings.display_desc')}</p>
            </div>

            <div className="form-field">
              <label className="field-label">{t('settings.particle_effects')}</label>
              <button 
                type="button"
                className={`toggle-switch ${settings.particleEffects ? 'active' : ''}`}
                onClick={() => updateSetting('particleEffects', !settings.particleEffects)}
              >
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  {settings.particleEffects ? t('common.on') : t('common.off')}
                </span>
              </button>
            </div>

            <div className="form-field">
              <label className="field-label">
                {t('settings.particle_intensity')} ({settings.particleIntensity}%)
              </label>
              <div className="range-input">
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="10"
                  value={settings.particleIntensity}
                  onChange={(e) => updateSetting('particleIntensity', parseInt(e.target.value))}
                  disabled={!settings.particleEffects}
                  className="intensity-slider"
                />
                <div className="range-labels">
                  <span>{t('common.low')}</span>
                  <span>{t('common.high')}</span>
                </div>
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">{t('settings.glow_effects')}</label>
              <button 
                type="button"
                className={`toggle-switch ${settings.glowEffects ? 'active' : ''}`}
                onClick={() => updateSetting('glowEffects', !settings.glowEffects)}
              >
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  {settings.glowEffects ? t('common.on') : t('common.off')}
                </span>
              </button>
            </div>

            <div className="form-field">
              <label className="field-label">
                {t('settings.animation_speed')} ({settings.animationSpeed}%)
              </label>
              <div className="range-input">
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="10"
                  value={settings.animationSpeed}
                  onChange={(e) => updateSetting('animationSpeed', parseInt(e.target.value))}
                  className="speed-slider"
                />
                <div className="range-labels">
                  <span>{t('common.slow')}</span>
                  <span>{t('common.fast')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>⚡ {t('settings.performance')}</h2>
              <p className="section-desc">{t('settings.performance_desc')}</p>
            </div>

            <div className="form-field">
              <label className="field-label">{t('settings.low_power_mode')}</label>
              <button 
                type="button"
                className={`toggle-switch ${settings.lowPowerMode ? 'active' : ''}`}
                onClick={() => updateSetting('lowPowerMode', !settings.lowPowerMode)}
              >
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  {settings.lowPowerMode ? t('common.on') : t('common.off')}
                </span>
              </button>
            </div>

            <div className="form-field">
              <label className="field-label">{t('settings.show_fps')}</label>
              <button 
                type="button"
                className={`toggle-switch ${settings.showFPS ? 'active' : ''}`}
                onClick={() => updateSetting('showFPS', !settings.showFPS)}
              >
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  {settings.showFPS ? t('common.on') : t('common.off')}
                </span>
              </button>
            </div>
          </div>

          {/* UI Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>📱 {t('settings.ui')}</h2>
              <p className="section-desc">{t('settings.ui_desc')}</p>
            </div>

            <div className="form-field">
              <label className="field-label">{t('settings.combo_display')}</label>
              <button 
                type="button"
                className={`toggle-switch ${settings.comboDisplayEnabled ? 'active' : ''}`}
                onClick={() => updateSetting('comboDisplayEnabled', !settings.comboDisplayEnabled)}
              >
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  {settings.comboDisplayEnabled ? t('common.on') : t('common.off')}
                </span>
              </button>
            </div>

            <div className="form-field">
              <label className="field-label">{t('settings.powerup_display')}</label>
              <button 
                type="button"
                className={`toggle-switch ${settings.powerUpDisplayEnabled ? 'active' : ''}`}
                onClick={() => updateSetting('powerUpDisplayEnabled', !settings.powerUpDisplayEnabled)}
              >
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  {settings.powerUpDisplayEnabled ? t('common.on') : t('common.off')}
                </span>
              </button>
            </div>
          </div>

        </form>
      </div>

      {/* Footer Actions */}
      <div className="settings-form-footer">
        <button 
          type="button"
          className="reset-all-btn" 
          onClick={resetSettings}
        >
          🔄 {t('settings.reset_all')}
        </button>
        
        <div className="footer-actions">
          <button 
            type="button"
            className="cancel-btn" 
            onClick={handleBack}
          >
            {t('common.cancel')}
          </button>
          <button 
            type="button"
            className={`save-btn ${hasChanges ? 'has-changes' : ''}`}
            onClick={saveSettings}
            disabled={!hasChanges}
          >
            💾 {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 