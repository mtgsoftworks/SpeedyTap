# SpeedyTap v0.3.0 Remastered - Mobile Game with Enhanced Features

🎮 **Modern TypeScript mimarisi ile gelişmiş mobil tıklama oyunu**

## 🆕 v0.3.0 Yenilikler

### 🌐 Tam İnternasyonalizasyon (i18n)
- **Çoklu Dil Desteği**: Türkçe ve İngilizce tam destek
- **Anlık Dil Değiştirme**: Oyun sırasında bile dil değiştirme
- **Professional Translations**: 200+ çeviri anahtarı
- **Console & Debug Messages**: Geliştirici mesajları da çok dilli

### 🏆 Kapsamlı Başarım Sistemi
- **15+ Başarım**: Oyun, skor, hız, tutarlılık kategorileri
- **Nadirik Sistemleri**: Common, Rare, Epic, Legendary
- **İlerleme Takibi**: Her başarım için detaylı progress bar
- **Bildirim Sistemi**: Güzel animasyonlu achievement notifications
- **Puan Sistemi**: Başarımlardan puan kazanma

### 🔒 Enterprise-Level Güvenlik
- **Frontend Obfuscation**: Webpack string array encryption
- **Android ProGuard**: Kod karıştırma ve sıkıştırma
- **Anti-Debug Protection**: DevTools ve debugging koruması
- **Console Protection**: Runtime güvenlik kontrolleri
- **Secure Build Commands**: `npm run build:secure`

### ⚡ Performans ve UX İyileştirmeleri
- **Optimized Game Loop**: requestAnimationFrame tabanlı
- **Performance Monitor**: FPS ve bellek takibi
- **Smart Caching**: Audio ve asset önbellekleme
- **Mobile Optimizations**: Touch ve haptic iyileştirmeleri
- **Modern Splash Screen**: Yükleme progress göstergesi

## Proje Özellikleri

### ⚡ Oyun Mekanikleri
- Hızlı tepki gerektiren tıklama oyunu
- Gelişmiş seviye sistemi ve progresyon
- Yüksek skor takibi ve istatistikler
- Ses efektleri ve haptik geri bildirim
- Oyun duraklatma/devam etme
- Tutorial sistemi

### 📱 Modern Mobil Geliştirme
- **Capacitor 7**: Cross-platform mobil geliştirme
- **TypeScript**: Tip güvenliği ve modern JavaScript
- **Webpack 5**: Modern bundling ve optimizasyon
- **i18next**: Profesyonel çoklu dil sistemi
- **AdMob Integration**: Banner ve Interstitial reklamlar

### 🎯 AdMob Reklam Stratejisi
- **Banner Reklamları**: Ana menüde sürekli görünür
- **Interstitial Reklamları**: 
  - Oyun bitişinde otomatik
  - Her 3 seviyede bir gösterim
  - Optimal kullanıcı deneyimi için zamanlama
- **Smart Ad Management**: Performans tabanlı gösterim

### 🏗️ Mimari Yapı
Proje modern yazılım mimarisi kurallarına uygun olarak geliştirilmiştir:

#### Sacred Folder Structure
```
src/
├── api/             # API clients
├── assets/          # Images, fonts, animations, audio
├── components/      # Reusable UI components
├── config/          # Environment variables
├── constants/       # App-wide constants
├── hooks/           # Custom React hooks
├── i18n/            # Internationalization files
├── navigation/      # Navigation logic
├── screens/         # Screen components
├── store/           # Redux Toolkit state
├── theme/           # Styling and theme
├── types/           # TypeScript types
└── utils/           # Helper functions, managers
```

## 📦 Paket Bilgileri
- **Package ID**: `com.mtgsoftworks.speedytap`
- **Version**: 0.3.0
- **Target SDK**: Android 34 (Android 14)
- **Min SDK**: Android 24 (Android 7.0)

## 🚀 Geliştirme

### Kurulum
```bash
npm install
npx cap sync android
```

### Development
```bash
npm run dev              # Web development server
npm run android:dev      # Android emulator
```

### Production Build
```bash
npm run build           # Standard production build
npm run build:secure    # Obfuscated secure build
npx cap sync android
cd android && ./gradlew assembleRelease  # Android APK
cd android && ./gradlew bundleRelease    # Android AAB
```

### Available Scripts
- `npm run dev` - Development server
- `npm run build` - Production build  
- `npm run build:secure` - Secure obfuscated build
- `npm run android:build:secure` - Secure Android build

## 🎯 AdMob Konfigürasyonu

### Ad Unit IDs
- **Interstitial**: `ca-app-pub-2923372871861852/4040639207`
- **Banner**: `ca-app-pub-2923372871861852/4666227683`

### Reklam Gösterim Stratejisi
1. **Ana Menü**: Banner reklam (alt kısım)
2. **Oyun Bitişi**: Interstitial reklam
3. **Seviye Geçişi**: Her 3 seviyede interstitial
4. **Oyun Sırasında**: Banner gizlenir (optimum UX)

## 📱 Release Files
- **APK**: `speedytap-mobile-v0.3-release.apk` (4.1 MB)
- **AAB**: `speedytap-mobile-v0.3-release.aab` (5.4 MB)
- **İmzalı**: Evet (android.keystore)
- **Güvenlik**: ProGuard + Webpack obfuscation
- **Ready for**: Google Play Store

## 🔧 Teknik Detaylar

### Ana Bağımlılıklar
- **@capacitor/core**: 7.4.0
- **@capacitor-community/admob**: 7.0.3
- **TypeScript**: 5.6.3
- **Webpack**: 5.99.9
- **i18next**: 23.16.4
- **webpack-obfuscator**: 3.17.1

### Desteklenen Platformlar
- ✅ Android (API 24+)
- ✅ Web/PWA
- 🔄 iOS (hazırlanıyor)

### Güvenlik Özellikleri
- **Frontend**: String array encryption, control flow flattening
- **Android**: ProGuard obfuscation, resource shrinking
- **Runtime**: Anti-debugging, console protection
- **DevTools**: Detection and blocking

## 🌟 Öne Çıkan Özellikler

### 🎯 Achievements System
- **15+ Unlockable Achievements**: "İlk Adım", "Mükemmellik", "Ateş Çizgisi"
- **4 Rarity Levels**: Common, Rare, Epic, Legendary
- **5 Categories**: Oyun, Skor, Hız, Tutarlılık, Özel
- **Point Rewards**: Achievement başına puan kazanma

### 🌐 Internationalization
- **2 Languages**: Turkish (native), English
- **200+ Keys**: Tüm UI, console, debug messages
- **Real-time Switching**: Oyun sırasında dil değiştirme
- **Professional Names**: Oyun terminolojisi çevirileri

### ⚙️ Settings Management
- **Audio Settings**: Master volume, SFX, haptic feedback
- **Visual Settings**: Animations, particles, screen shake
- **Gameplay Settings**: Difficulty, auto-resume, hints
- **Data Management**: Export, import, clear data

## 👨‍💻 Geliştirici
**Mesut Taha Güven** - MTG Softworks

## 📄 License
MIT License

---

*SpeedyTap v0.3.0 Remastered - Enterprise-grade mobile gaming experience with i18n, achievements, and security* 