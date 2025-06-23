# 🛡️ SpeedyTap Güvenlik Sistemi

Bu dokümantasyon SpeedyTap mobil oyununun kapsamlı güvenlik sistemini açıklar.

## 🚨 Mevcut Güvenlik Durumu

**✅ ŞİMDİ AKTİF KORUMALAR:**
- ✅ JavaScript/TypeScript kod obfuscation
- ✅ Android ProGuard/R8 obfuscation
- ✅ Source map'lerin production'da kapatılması
- ✅ Runtime anti-debugging koruması
- ✅ DevTools detection sistemi
- ✅ Console protection
- ✅ Context menu engelleme
- ✅ Debug shortcut engelleme
- ✅ Code integrity checking

## 🏗️ Güvenlik Mimarisi

### 1. Frontend Güvenlik (JavaScript/TypeScript)

#### Webpack Obfuscation
```bash
# Production build (güvenli)
npm run build:secure

# Normal production build
npm run build
```

**Obfuscation Özellikleri:**
- String array encryption (Base64)
- Control flow flattening (%80)
- Dead code injection (%40)
- Debug protection (2 saniye interval)
- Self-defending code
- Console output disable
- Variable name mangling (hexadecimal)

#### Runtime Güvenlik Kontrolü
```typescript
import { securityManager } from '@/utils/security';

// Güvenlik kontrolü
const check = securityManager.checkSecurity();
if (!check.isValid) {
  console.error('Security threat:', check.threat);
}
```

### 2. Android Güvenlik (Native)

#### ProGuard/R8 Konfigürasyonu
- **Minification**: ✅ Aktif
- **Obfuscation**: ✅ Güçlü seviye
- **Resource shrinking**: ✅ Aktif
- **Debug protection**: ✅ Log'lar kaldırıldı

#### Güvenlik Özellikleri:
- Class ve method isim karıştırma
- String encryption
- Control flow obfuscation
- Dead code elimination
- Anti-reverse engineering

## 🛠️ Kullanım Kılavuzu

### Development Build
```bash
# Geliştirme modu (güvenlik kapalı)
npm run dev
npm run android:dev
```

### Production Build
```bash
# Normal production build
npm run build
npm run android:build

# Maksimum güvenlik production build
npm run build:secure
npm run android:build:secure
```

### Güvenlik Testleri

#### JavaScript Obfuscation Test
```bash
# Build sonrası dist/ klasöründeki JS dosyalarını kontrol edin
# Kod okunamaz ve karıştırılmış olmalı
```

#### Android Obfuscation Test
```bash
# APK'yı reverse engineering tool'larla test edin
# Class isimleri a, b, c şeklinde karıştırılmış olmalı
```

## 🔒 Güvenlik Seviyesi Ayarları

### Yüksek Güvenlik (Önerilen)
- Production release'ler için
- Tam obfuscation aktif
- Tüm debug bilgileri kaldırıldı
- Runtime koruma maksimum

### Orta Güvenlik
- Beta test'ler için
- Obfuscation aktif ama debug bilgileri korunmuş
- Bazı console output'lar aktif

### Düşük Güvenlik (Development)
- Geliştirme için
- Obfuscation kapalı
- Tüm debug bilgileri aktif
- Source map'ler açık

## ⚠️ Güvenlik Uyarıları

### YAPMAYın:
- Production build'de source map'leri açmayın
- Console log'ları production'da bırakmayın
- Debug modda APK release etmeyin
- ProGuard rules'ı devre dışı bırakmayın

### YAPın:
- Her release öncesi güvenlik testleri
- APK signing ile imzalama
- Obfuscation seviyelerini test etme
- Güvenlik güncellemelerini takip etme

## 🔧 Gelişmiş Konfigürasyon

### Özel Obfuscation Dictionary
```
android/app/proguard-dictionary.txt
```

### Domain Lock (Opsiyonel)
```typescript
// webpack.config.js'te
domainLock: ['speedytap.com', 'yourdomain.com']
```

### Anti-Debugging Interval
```typescript
// webpack.config.js'te
debugProtectionInterval: 2000 // ms
```

## 📊 Güvenlik Metrikleri

### Code Size Impact
- **Obfuscation**: +15-25% boyut artışı
- **Minification**: -30-40% boyut azalması
- **Net**: -10-20% toplam boyut optimizasyonu

### Performance Impact
- **Runtime**: +5-10% CPU kullanımı
- **Memory**: +2-5% RAM kullanımı
- **Load Time**: +100-200ms başlangıç gecikmesi

## 🚨 Güvenlik İhlali Durumunda

### Automatic Response
1. Uygulama otomatik yeniden başlatma
2. Threat logging
3. Güvenlik raporlama (opsiyonel)

### Manuel Investigation
1. Log dosyalarını kontrol edin
2. Build integrity'sini doğrulayın
3. APK signing'i kontrol edin
4. Güvenlik patch'lerini uygulayın

## 🔄 Güvenlik Güncellemeleri

Bu güvenlik sistemi sürekli geliştirilmektedir. Yeni tehditler ve koruma yöntemleri düzenli olarak eklenmektedir.

### Sürüm Geçmişi
- **v2.0.2**: Tam obfuscation sistemi
- **v2.0.1**: Runtime güvenlik kontrolü
- **v2.0.0**: Temel ProGuard koruması

---

## 📞 Destek

Güvenlik ile ilgili sorularınız için:
- GitHub Issues
- Security Contact: security@speedytap.com
- Emergency: Hemen güncellemeleri kontrol edin 