# 📁 Assets Klasör Organizasyonu

SpeedyTap projesi için düzenlenmiş asset yönetimi.

## 📂 Klasör Yapısı

```
src/assets/
├── 🎵 audio/                  # Ses dosyaları
│   ├── *.mp3                  # Oyun ses efektleri
│   └── *.wav                  # Kullanıcı arayüzü sesleri
├── 🎨 icons/                  # İkonlar ve görsel öğeler
│   ├── *.svg                  # Vektör ikonlar
│   ├── *.png                  # Raster ikonlar
│   └── *.ico                  # Favicon dosyaları
├── 🖼️ images/                 # Görüntüler (şu anda boş)
│   └── (ileride eklenecek)
├── 📄 index.ts               # Asset yöneticisi
├── 🎨 style.css              # Ana stil dosyası
└── 📖 README.md              # Bu dosya
```

## 🎵 Audio Klasörü

**Oyun Ses Efektleri:**
- `circleAppear.mp3` - Daire belirme sesi
- `touchBlue.mp3` - Mavi daireye dokunma
- `touchRed.mp3` - Kırmızı daireye dokunma
- `levelPassed.mp3` - Seviye geçme sesi
- `levelLost.mp3` - Oyun kaybetme sesi
- `timeAlmostUp.mp3` - Süre dolma uyarısı
- `buttonTap.mp3` - Buton tıklama sesi
- `delayCount.mp3` - Geri sayım sesi

**UI Ses Efektleri (WAV):**
- `Click_-_Tap_Done_Checkbox1.wav`
- `DoubleClick_-_Done_Checkbox2_1.wav`
- `Tiny_-_Done_PopUp2.wav`
- `Fireworks_-_Notification2.wav`
- `Drib_-_Notification1.wav`
- `Toy_Done11.wav`
- `Toy_Error9.wav`
- `Toy_Up_Down1.wav`
- `Untitled.wav`

## 🎨 Icons Klasörü

**SVG İkonlar:**
- `backgroundPattern.svg` - Arkaplan deseni
- `pauseIconSmall.svg` / `pauseIconLarge.svg` - Duraklatma ikonları
- `timeIcon.svg` - Zaman ikonu
- `tapsIcon.svg` - Dokunma ikonu
- `watchIcon.svg` - Saat ikonu
- `flagIcon.svg` - Bayrak ikonu
- `gemIcon.svg` - Mücevher ikonu
- `bugIcon.svg` - Hata ikonu
- `refreshIcon.svg` / `refreshIconBlue.svg` - Yenileme ikonları

**PWA İkonları:**
- `favicon.ico` - Ana favicon
- `favicon-16x16.png` / `favicon-32x32.png` - Farklı boyut favicon'lar
- `apple-touch-icon.png` - iOS ikon
- `android-chrome-192x192.png` / `android-chrome-512x512.png` - Android ikonları
- `mstile-150x150.png` - Windows tile ikonu
- `safari-pinned-tab.svg` - Safari pinned tab ikonu

## 🔧 Kullanım

### Ses Dosyaları
```typescript
import { audioManager } from '@/assets';

// Ses çalma
audioManager.play('buttonTap');
audioManager.play('touchBlue');
```

### CSS'de İkon Kullanımı
```css
.element {
  background: url('icons/pauseIconSmall.svg') center no-repeat;
}
```

### Import Yolları
- **Audio:** `./audio/filename.mp3`
- **Icons:** `./icons/filename.svg`
- **CSS'de:** `icons/filename.svg` (relative)

## 📋 Notlar

- Tüm ses dosyaları AudioManager ile yönetilir
- SVG dosyaları webpack tarafından optimize edilir
- CSS'de relative path kullanılır
- PWA ikonları otomatik olarak index.html'de referans edilir

---
*SpeedyTap v2.0 - Modern TypeScript Mimarisi* 