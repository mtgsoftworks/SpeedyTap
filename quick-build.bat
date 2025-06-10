@echo off
echo.
echo ========================================
echo SpeedyTap - Hızlı Android Build
echo ========================================
echo.

echo [1/4] Web build yapılıyor...
call yarn build
if %errorlevel% neq 0 (
    echo HATA: Web build başarısız!
    pause
    exit /b 1
)

echo.
echo [2/4] Capacitor sync yapılıyor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo HATA: Capacitor sync başarısız!
    pause
    exit /b 1
)

echo.
echo [3/4] Android APK build yapılıyor...
cd android
call gradlew clean assembleDebug
if %errorlevel% neq 0 (
    echo HATA: Android build başarısız!
    pause
    exit /b 1
)

echo.
echo [4/4] APK kopyalanıyor...
copy app\build\outputs\apk\debug\app-debug.apk ..\speedytap-signed.apk
cd ..

echo.
echo ========================================
echo ✅ BUILD BAŞARILI!
echo ========================================
echo.
echo 📱 İmzalanmış APK: speedytap-signed.apk
echo 🚀 Android Studio: npx cap open android
echo 📱 Telefona Yükle: install-signed-apk.bat
echo 🎯 Paket: com.mtgsoftworks.speedytap.debug
echo.
pause 