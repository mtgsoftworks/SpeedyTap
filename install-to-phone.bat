@echo off
echo.
echo ========================================
echo SpeedyTap - Telefona Yükleme
echo ========================================
echo.

echo ADB cihaz kontrolü yapılıyor...
adb devices
echo.

if not exist speedytap-debug.apk (
    echo HATA: speedytap-debug.apk bulunamadı!
    echo Önce quick-build.bat çalıştırın.
    pause
    exit /b 1
)

echo SpeedyTap yükleniyor...
adb install -r speedytap-debug.apk

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo ✅ YÜKLEME BAŞARILI!
    echo ========================================
    echo.
    echo 🎮 SpeedyTap telefonunuzda hazır!
    echo 📱 Uygulama adı: SpeedyTap
    echo 🎯 Paket adı: com.mtgsoftworks.speedytap.debug
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
    echo.
)

pause 