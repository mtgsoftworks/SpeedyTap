@echo off
echo.
echo ========================================
echo Android Studio Cache Temizleme
echo ========================================
echo.

echo [1/5] Web build yapılıyor...
call yarn build

echo.
echo [2/5] Capacitor sync yapılıyor...
call npx cap sync android

echo.
echo [3/5] Android cache temizleniyor...
cd android
rmdir /s /q .gradle 2>nul
rmdir /s /q app\build 2>nul
rmdir /s /q app\.cxx 2>nul

echo.
echo [4/5] Clean build yapılıyor...
call gradlew clean assembleDebug

echo.
echo [5/5] Android Studio açılıyor...
call gradlew --stop
cd ..

echo.
echo ========================================
echo ✅ TEMİZLEME TAMAMLANDI!
echo ========================================
echo.
echo 📱 Yeni paket adı: com.mtgsoftworks.speedytap.debug
echo 🚀 Android Studio'yu kapatıp tekrar açın
echo 📋 Run Configuration'ı yeniden seçin
echo.
echo Android Studio'yu açmak için:
npx cap open android

pause 