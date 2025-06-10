@echo off
echo ========================================
echo SpeedyTap Android Test Build
echo ========================================

echo 1. Building web assets...
call yarn build

echo 2. Syncing with Android...
call npx cap sync android

echo 3. Building debug APK...
cd android
call gradlew assembleDebug

echo 4. APK location:
echo android\app\build\outputs\apk\debug\app-debug.apk

echo ========================================
echo Build completed! 
echo You can install the APK on your device.
echo ========================================
pause 