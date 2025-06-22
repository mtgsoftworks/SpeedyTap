import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  tr: {
    translation: {
      // Navigation & Main Menu
      "Speedy Tap": "Speedy Tap",
      "Quick Reflexes Game": "Hızlı Refleks Oyunu",
      "Start Game": "Oyunu Başlat",
      "Settings": "Ayarlar",
      "Achievements": "Başarımlar",
      "About": "Hakkında",
      "High Score": "En Yüksek Skor",
      "Tutorial": "Eğitim",
      "Back to Menu": "Ana Menüye Dön",
      
      // Game Interface
      "Score": "Skor",
      "Level": "Seviye",
      "Time": "Süre",
      "Taps": "Dokunuş",
      "Pause": "Duraklat",
      "Resume": "Devam Et",
      "Try Again": "Tekrar Dene",
      "Continue": "Devam",
      
      // Tutorial
      "How to Play": "Nasıl Oynanır",
      "Touch the blue circles": "Mavi dairelere dokun",
      "Avoid the red circles": "Kırmızı dairelerden kaçın",
      "Race against time": "Zamana karşı yarış",
      "Blue circles give points": "Mavi daireler puan verir",
      "Red circles end the game": "Kırmızı daireler oyunu bitirir",
      "Complete all taps before time runs out": "Süre dolmadan tüm hedefleri tamamla",
      "Get Started": "Başla",
      
      // Game Results
      "Level Passed!": "Seviye Geçildi!",
      "You Lost!": "Kaybettin!",
      "Game Over": "Oyun Bitti",
      "Final Score": "Son Skor",
      "Best Score": "En İyi Skor",
      "Bonus": "Bonus",
      "Level {{level}}": "Seviye {{level}}",
      
      // Settings Page
      "Audio Settings": "Ses Ayarları",
      "Visual Settings": "Görsel Ayarları",
      "Gameplay Settings": "Oyun Ayarları",
      "Data Settings": "Veri Ayarları",
      "Language": "Dil",
      "Sound Effects": "Ses Efektleri",
      "Music": "Müzik",
      "Vibration": "Titreşim",
      "Theme": "Tema",
      "Difficulty": "Zorluk",
      "Auto Save": "Otomatik Kaydetme",
      "Clear Data": "Verileri Temizle",
      "Export Data": "Verileri Dışa Aktar",
      "Import Data": "Verileri İçe Aktar",
      "Storage Usage": "Depolama Kullanımı",
      "Reset Settings": "Ayarları Sıfırla",
      
      // Achievements
      "First Steps": "İlk Adımlar",
      "Speed Master": "Hız Ustası",
      "Accuracy Pro": "Hassasiyet Profesyoneli",
      "Level 10 Reached": "Seviye 10'a Ulaştı",
      "Perfect Round": "Mükemmel Tur",
      "Time Master": "Zaman Ustası",
      "Consistency King": "Tutarlılık Kralı",
      "Legendary Player": "Efsanevi Oyuncu",
      "Unlocked": "Açıldı",
      "Locked": "Kilitli",
      "Progress": "İlerleme",
      "All": "Tümü",
      "Gameplay": "Oyun",
      "Speed": "Hız",
      "Consistency": "Tutarlılık",
      "Special": "Özel",
      
      // About Page
      "Game Description": "Oyun Açıklaması",
      "A modern reflex game built with cutting-edge web technologies": "Modern web teknolojileri ile geliştirilmiş çağdaş bir refleks oyunu",
      "Game Features": "Oyun Özellikleri",
      "Quick reflex training": "Hızlı refleks antrenmanı",
      "Accuracy improvement": "Doğruluk geliştirme",
      "Real-time statistics": "Anlık istatistikler",
      "Achievement system": "Başarım sistemi",
      "Customizable settings": "Özelleştirilebilir ayarlar",
      "Immersive sound effects": "Sürükleyici ses efektleri",
      "Developer": "Geliştirici",
      "Technology Stack": "Teknoloji Yığını",
      "Platform Support": "Platform Desteği",
      "System Requirements": "Sistem Gereksinimleri",
      "Version": "Sürüm",
      "© 2025 MTG Softworks · Speedy Tap™ · All Rights Reserved": "© 2025 MTG Softworks · Speedy Tap™ · Tüm Hakları Saklıdır",
      
      // Game Messages
      "Ready?": "Hazır mısın?",
      "Go!": "Başla!",
      "Time's up!": "Süre doldu!",
      "Well done!": "Aferin!",
      "Almost there!": "Neredeyse bitti!",
      "Good job!": "İyi iş!",
      "Excellent!": "Mükemmel!",
      "Outstanding!": "Olağanüstü!",
      "Loading...": "Yükleniyor...",
      "Welcome to": "Hoş Geldin",
      "Every tap matters": "Her dokunuş önemli",
      "and achieve the highest score": "ve en yüksek skoru yakala"
    }
  },
  en: {
    translation: {
      // Navigation & Main Menu
      "Speedy Tap": "Speedy Tap",
      "Quick Reflexes Game": "Quick Reflexes Game",
      "Start Game": "Start Game",
      "Settings": "Settings",
      "Achievements": "Achievements",
      "About": "About",
      "High Score": "High Score",
      "Tutorial": "Tutorial",
      "Back to Menu": "Back to Menu",
      
      // Game Interface
      "Score": "Score",
      "Level": "Level",
      "Time": "Time",
      "Taps": "Taps",
      "Pause": "Pause",
      "Resume": "Resume",
      "Try Again": "Try Again",
      "Continue": "Continue",
      
      // Tutorial
      "How to Play": "How to Play",
      "Touch the blue circles": "Touch the blue circles",
      "Avoid the red circles": "Avoid the red circles",
      "Race against time": "Race against time",
      "Blue circles give points": "Blue circles give points",
      "Red circles end the game": "Red circles end the game",
      "Complete all taps before time runs out": "Complete all taps before time runs out",
      "Get Started": "Get Started",
      
      // Game Results
      "Level Passed!": "Level Passed!",
      "You Lost!": "You Lost!",
      "Game Over": "Game Over",
      "Final Score": "Final Score",
      "Best Score": "Best Score",
      "Bonus": "Bonus",
      "Level {{level}}": "Level {{level}}",
      
      // Settings Page
      "Audio Settings": "Audio Settings",
      "Visual Settings": "Visual Settings",
      "Gameplay Settings": "Gameplay Settings",
      "Data Settings": "Data Settings",
      "Language": "Language",
      "Sound Effects": "Sound Effects",
      "Music": "Music",
      "Vibration": "Vibration",
      "Theme": "Theme",
      "Difficulty": "Difficulty",
      "Auto Save": "Auto Save",
      "Clear Data": "Clear Data",
      "Export Data": "Export Data",
      "Import Data": "Import Data",
      "Storage Usage": "Storage Usage",
      "Reset Settings": "Reset Settings",
      
      // Achievements
      "First Steps": "First Steps",
      "Speed Master": "Speed Master",
      "Accuracy Pro": "Accuracy Pro",
      "Level 10 Reached": "Level 10 Reached",
      "Perfect Round": "Perfect Round",
      "Time Master": "Time Master",
      "Consistency King": "Consistency King",
      "Legendary Player": "Legendary Player",
      "Unlocked": "Unlocked",
      "Locked": "Locked",
      "Progress": "Progress",
      "All": "All",
      "Gameplay": "Gameplay",
      "Speed": "Speed",
      "Consistency": "Consistency",
      "Special": "Special",
      
      // About Page
      "Game Description": "Game Description",
      "A modern reflex game built with cutting-edge web technologies": "A modern reflex game built with cutting-edge web technologies",
      "Game Features": "Game Features",
      "Quick reflex training": "Quick reflex training",
      "Accuracy improvement": "Accuracy improvement",
      "Real-time statistics": "Real-time statistics",
      "Achievement system": "Achievement system",
      "Customizable settings": "Customizable settings",
      "Immersive sound effects": "Immersive sound effects",
      "Developer": "Developer",
      "Technology Stack": "Technology Stack",
      "Platform Support": "Platform Support",
      "System Requirements": "System Requirements",
      "Version": "Version",
      "© 2025 MTG Softworks · Speedy Tap™ · All Rights Reserved": "© 2025 MTG Softworks · Speedy Tap™ · All Rights Reserved",
      
      // Game Messages
      "Ready?": "Ready?",
      "Go!": "Go!",
      "Time's up!": "Time's up!",
      "Well done!": "Well done!",
      "Almost there!": "Almost there!",
      "Good job!": "Good job!",
      "Excellent!": "Excellent!",
      "Outstanding!": "Outstanding!",
      "Loading...": "Loading...",
      "Welcome to": "Welcome to",
      "Every tap matters": "Every tap matters",
      "and achieve the highest score": "and achieve the highest score"
    }
  }
};

i18n
  .use(LanguageDetector) // Tarayıcı dilini otomatik algıla
  .use(initReactI18next) // React-i18next'e geç
  .init({
    resources,
    fallbackLng: 'tr', // Varsayılan dil Türkçe
    debug: false, // Production'da false
    
    // Dil algılama ayarları
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'selectedLanguage'
    },

    interpolation: {
      escapeValue: false // React zaten XSS koruması sağlıyor
    }
  });

export default i18n; 