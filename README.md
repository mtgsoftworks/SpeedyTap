# SpeedyTap - Mobil Dokunma Oyunu

SpeedyTap, React + TypeScript + Capacitor ile geliştirilmiş hızlı dokunma tabanlı mobil oyundur.

## 🎮 Oyun Özellikleri

- **Hızlı Dokunma Mekaniği**: Dairelere hızlıca dokunarak puan kazan
- **Seviye Sistemi**: Artan zorluk seviyesi
- **Combo Sistemi**: Ardışık dokunuşlarla bonus puan
- **Power-Up'lar**: Özel güç artırıcıları
- **AdMob Entegrasyonu**: Reklam geliri sistemi
- **Haptic Feedback**: Dokunsal geri bildirim
- **Ses Efektleri**: Kapsamlı ses sistemi
- **Performans Optimizasyonu**: Batarya ve ekran optimizasyonu

## 🛠️ Teknoloji Yığını

- **Frontend**: React 19, TypeScript, Styled Components
- **Mobile**: Capacitor 7
- **Build Tool**: Vite 6
- **Platform**: Android (iOS hazır)
- **Animasyon**: Framer Motion
- **Ses**: Audio Service
- **Reklamlar**: AdMob

## 📱 Desteklenen Platformlar

- ✅ Android
- ✅ PWA (Progressive Web App)
- ⏳ iOS (hazır, test edilmedi)

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+
- Yarn
- Android Studio (Android build için)

### Kurulum

```bash
# Bağımlılıkları yükle
yarn install

# Geliştirme sunucusunu başlat
yarn dev

# Android için build
yarn build
npx cap sync android
npx cap open android
```

### Scripts

```bash
yarn dev      # Geliştirme sunucusu
yarn build    # Production build
yarn lint     # ESLint kontrolü
yarn preview  # Build önizlemesi
```

## 📁 Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── GameArea.tsx    # Ana oyun alanı
│   ├── Settings.tsx    # Ayarlar menüsü
│   ├── GameMenu.tsx    # Ana menü
│   └── ...
├── services/           # İş mantığı servisleri
│   ├── AdMobService.ts # Reklam yönetimi
│   ├── AudioService.ts # Ses yönetimi
│   ├── ThemeService.ts # Tema sistemi
│   └── ...
└── assets/            # Statik dosyalar
```

## 🎯 Oyun Servisleri

- **AdMobService**: Reklam gösterimi ve gelir optimizasyonu
- **AudioService**: Ses efektleri ve müzik
- **ThemeService**: Dinamik tema sistemi
- **PowerUpService**: Güç artırıcı yönetimi
- **ComboService**: Combo sistemi
- **StatisticsService**: İstatistik takibi
- **ParticleService**: Görsel efektler
- **BatteryOptimizer**: Batarya optimizasyonu
- **ScreenAdapter**: Ekran uyumlama

## 📋 Yapılacaklar

- [ ] iOS test ve optimizasyonu
- [ ] Google Play Store yayını
- [ ] App Store yayını
- [ ] Çoklu dil desteği
- [ ] Sosyal paylaşım özellikleri
- [ ] Bulut kayıt sistemi

## 🐛 Bilinen Sorunlar

- Google Services konfigürasyonu eksik (Push Notifications için gerekli)
- iOS platform henüz test edilmedi

## 📄 Lisans

Bu proje özel bir proje olup, tüm hakları saklıdır.

## 🤝 Katkıda Bulunma

Bu proje açık kaynak değildir, ancak geri bildirimleriniz değerlidir.

---

**Geliştirici**: MTG  
**Versiyon**: 2.0.0  
**Son Güncelleme**: 2024
