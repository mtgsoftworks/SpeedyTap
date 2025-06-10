@echo off
echo.
echo ========================================
echo SpeedyTap - RELEASE APK Yükleme
echo ========================================
echo.

echo ADB cihaz kontrolü yapılıyor...
adb devices
echo.

if not exist speedytap-release-signed.apk (
    echo HATA: speedytap-release-signed.apk bulunamadı!
    echo Önce release build yapın.
    pause
    exit /b 1
)

echo.
echo ⚠️  DİKKAT: Bu RELEASE versiyonudur!
echo 📦 Boyut: 4.7 MB (minified + shrinkResources)
echo 🔒 İmza: Senin özel keystore'un ile
echo 🎯 Paket: com.mtgsoftworks.speedytap
echo.
pause

echo Release SpeedyTap yükleniyor...
adb install -r speedytap-release-signed.apk

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ RELEASE YÜKLEME BAŞARILI!
    echo ========================================
    echo.
    echo 🎮 SpeedyTap RELEASE telefonunuzda hazır!
    echo 📱 Uygulama adı: SpeedyTap
    echo 🎯 Paket adı: com.mtgsoftworks.speedytap
    echo 🔒 İmzalanmış: Senin özel keystore ile
    echo 📦 Optimized: Minified + shrinkResources
    echo.
    echo Bu PRODUCTION sürümüdür - Google Play'e yüklenebilir.
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ YÜKLEME BAŞARISIZ!
    echo ========================================
    echo.
    echo Kontrol edilecekler:
    echo 1. USB Debugging açık mı?
    echo 2. Telefon bilgisayara bağlı mı?
    echo 3. ADB driver yüklü mü?
    echo 4. Önceki versiyon silinmiş mi?
    echo.
)

pause 