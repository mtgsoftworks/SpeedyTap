@echo off
echo.
echo ========================================
echo SpeedyTap - İmzalanmış APK Yükleme
echo ========================================
echo.

echo ADB cihaz kontrolü yapılıyor...
adb devices
echo.

if not exist speedytap-signed.apk (
    echo HATA: speedytap-signed.apk bulunamadı!
    echo Önce build yapın.
    pause
    exit /b 1
)

echo İmzalanmış SpeedyTap yükleniyor...
adb install -r speedytap-signed.apk

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ YÜKLEME BAŞARILI!
    echo ========================================
    echo.
    echo 🎮 SpeedyTap telefonunuzda hazır!
    echo 📱 Uygulama adı: SpeedyTap
    echo 🎯 Paket adı: com.mtgsoftworks.speedytap.debug
    echo 🔒 İmzalanmış APK (debug key ile)
    echo.
    echo Uygulamayı açmak için telefonunuzu kontrol edin.
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