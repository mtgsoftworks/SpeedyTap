# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# ================================
# SPEEDYTAP - ADVANCED PROTECTION
# ================================

# Temel optimizasyon ve obfuscation
-dontpreverify
-repackageclasses ''
-allowaccessmodification
-optimizations !code/simplification/arithmetic
-keepattributes *Annotation*

# Kaynak dosya bilgilerini gizle
-renamesourcefileattribute SourceFile
-keepattributes SourceFile,LineNumberTable

# ================================
# ANTI-REVERSE ENGINEERING
# ================================

# Class ve method isimlerini karıştır
-obfuscationdictionary proguard-dictionary.txt
-classobfuscationdictionary proguard-dictionary.txt
-packageobfuscationdictionary proguard-dictionary.txt

# String encryption
-adaptclassstrings

# Control flow obfuscation
-optimizations !class/merging/*,!code/allocation/variable

# ================================
# WEBVIEW VE JAVASCRIPT KORUMA
# ================================

# WebView için gerekli sınıfları koru ama obfuscate et
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Capacitor framework koruma
-keep class com.getcapacitor.** { *; }
-keep class com.mtgsoftworks.speedytap.** { *; }

# ================================
# NATIVE KORUMA
# ================================

# Native method signatures koru
-keepclasseswithmembernames class * {
    native <methods>;
}

# Reflection kullanan sınıflar
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# ================================
# ANDROID COMPONENT KORUMA
# ================================

# Activity, Service, Receiver, Provider
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider

# View constructors
-keepclasseswithmembers class * {
    public <init>(android.content.Context, android.util.AttributeSet);
}

# ================================
# ADMOB VE REKLAM KORUMA
# ================================

# Google Play Services
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# AdMob
-keep class com.google.android.gms.ads.** { *; }
-keep class com.capacitor.community.admob.** { *; }

# ================================
# HILE ÖNLEME
# ================================

# Enum sınıfları koru (oyun durumları için)
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Parcelable koruma
-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}

# Serializable koruma
-keepnames class * implements java.io.Serializable
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ================================
# DEBUG PROTECTION
# ================================

# Debug sınıflarını tamamen kaldır
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}

# Console output'u kaldır
-assumenosideeffects class java.io.PrintStream {
    public void println(%);
    public void print(%);
}

# ================================
# CAPACITOR SPECIFIC
# ================================

# Capacitor bridge koruma
-keep class com.getcapacitor.Bridge { *; }
-keep class com.getcapacitor.BridgeActivity { *; }
-keep class com.getcapacitor.plugin.** { *; }

# Plugin interface koruma
-keep @com.getcapacitor.annotation.CapacitorPlugin class * {
    @com.getcapacitor.annotation.PermissionCallback <methods>;
    @com.getcapacitor.annotation.ActivityCallback <methods>;
    @com.getcapacitor.PluginMethod public <methods>;
}

# ================================
# CRASH PROTECTION
# ================================

# Exception handling korunması
-keep class * extends java.lang.Exception { *; }

# Critical system classes
-dontwarn javax.annotation.**
-dontwarn kotlin.Unit
-dontwarn kotlin.jvm.internal.DefaultConstructorMarker
