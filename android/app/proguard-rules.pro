# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# SpeedyTap Oyunu İçin Proguard Kuralları

# WebView ve JavaScript interface koruması
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Capacitor koruması
-keep class com.getcapacitor.** { *; }
-keep class org.apache.cordova.** { *; }

# AdMob koruması
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.ads.** { *; }

# React Native ve JS koruması
-keepclassmembers class * {
    public <init>(android.content.Context);
}

# JSON sınıfları koruması (eğer model sınıfları varsa)
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Debugging için satır numarası bilgilerini koru
-keepattributes SourceFile,LineNumberTable

# Stack trace'lerde orijinal dosya adını gizle
-renamesourcefileattribute SourceFile

# Uyarıları bastır
-dontwarn org.apache.cordova.**
-dontwarn com.google.android.gms.**
