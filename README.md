# SpeedyTap v0.1.0 - Mobile Game with AdMob Integration

🎮 **Modern TypeScript mimarisi ile hızlı mobil tıklama oyunu**

## Proje Özellikleri

### ⚡ Oyun Mekanikleri
- Hızlı tepki gerektiren tıklama oyunu
- Seviye sistemi ve progresyon
- Yüksek skor takibi
- Ses efektleri ve haptik geri bildirim
- Oyun duraklatma/devam etme

### 📱 Modern Mobil Geliştirme
- **Capacitor 7**: Cross-platform mobil geliştirme
- **TypeScript**: Tip güvenliği ve modern JavaScript
- **Webpack 5**: Modern bundling ve optimizasyon
- **AdMob Integration**: Banner ve Interstitial reklamlar

### 🎯 AdMob Reklam Stratejisi
- **Banner Reklamları**: Ana menüde sürekli görünür
- **Interstitial Reklamları**: 
  - Oyun bitişinde otomatik
  - Her 3 seviyede bir gösterim
  - Optimal kullanıcı deneyimi için zamanlama

### 🏗️ Mimari Yapı
Proje modern yazılım mimarisi kurallarına uygun olarak geliştirilmiştir:

#### Rule 1: Sacred Folder Structure
```
src/
├── api/             # API clients
├── assets/          # Images, fonts, animations  
├── components/      # Reusable UI components
├── config/          # Environment variables
├── constants/       # App-wide constants
├── hooks/           # Custom React hooks
├── navigation/      # Navigation logic
├── screens/         # Screen components
├── store/           # Redux Toolkit state
├── theme/           # Styling and theme
├── types/           # TypeScript types
└── utils/           # Helper functions
```

## 📦 Paket Bilgileri
- **Package ID**: `com.mtgsoftworks.speedytap`
- **Version**: 0.1.0
- **Target SDK**: Android 34
- **Min SDK**: Android 22

## 🚀 Geliştirme

### Kurulum
```bash
npm install
npx cap sync
```

### Development
```bash
npm run dev              # Web development server
npm run android:dev      # Android emulator
```

### Production Build
```bash
npm run build           # Web build
./android/gradlew assembleRelease  # Android APK
```

## 🎯 AdMob Konfigürasyonu

### Ad Unit IDs
- **Interstitial**: `ca-app-pub-2923372871861852/4040639207`
- **Banner**: `ca-app-pub-2923372871861852/4666227683`

### Reklam Gösterim Stratejisi
1. **Ana Menü**: Banner reklam (alt kısım)
2. **Oyun Bitişi**: Interstitial reklam
3. **Seviye Geçişi**: Her 3 seviyede interstitial
4. **Oyun Sırasında**: Banner gizlenir (optimum UX)

## 📱 APK Bilgileri
- **Dosya**: `SpeedyTap-v0.1.0-MTGSoftworks-AdMob.apk`
- **İmzalı**: Evet (android.keystore)
- **AdMob**: Entegre edildi
- **Boyut**: ~4 MB

## 🔧 Teknik Detaylar

### Bağımlılıklar
- **@capacitor/core**: 7.4.0
- **@capacitor-community/admob**: 7.0.3
- **TypeScript**: 5.6.3
- **Webpack**: 5.99.9

### Desteklenen Platformlar
- ✅ Android (API 22+)
- ✅ Web/PWA
- 🔄 iOS (hazırlanıyor)

## 👨‍💻 Geliştirici
**Mesut Taha Güven** - MTG Softworks

---

*SpeedyTap v0.1.0 - AdMob entegrasyonlu hızlı mobil oyun deneyimi* 