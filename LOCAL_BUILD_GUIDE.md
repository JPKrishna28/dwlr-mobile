# Local APK Building Setup Guide

## Option 1: Install Required Tools for Local Building

### Prerequisites:
1. **Java Development Kit (JDK 17)**
   ```bash
   # Download and install JDK 17 from:
   # https://adoptium.net/temurin/releases/?version=17
   
   # After installation, set JAVA_HOME environment variable:
   # Windows: Add to System Environment Variables
   # JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.0.x.x-hotspot
   ```

2. **Android Studio and SDK**
   ```bash
   # Download Android Studio from:
   # https://developer.android.com/studio
   
   # After installation, set ANDROID_HOME environment variable:
   # Windows: Add to System Environment Variables
   # ANDROID_HOME = C:\Users\%USERNAME%\AppData\Local\Android\Sdk
   ```

3. **Add to PATH**
   ```bash
   # Add these to your PATH environment variable:
   # %JAVA_HOME%\bin
   # %ANDROID_HOME%\platform-tools
   # %ANDROID_HOME%\tools
   ```

### Build Commands After Setup:
```bash
cd c:\Users\New\projects\dwlr-app
npx expo prebuild --platform android --clear
cd android
.\gradlew assembleRelease
```

## Option 2: Use EAS Build with Local Profile (Recommended)

This uses Expo's servers but with local configuration:

```bash
cd c:\Users\New\projects\dwlr-app
npx eas build --platform android --profile preview --local
```

## Option 3: Create Development Build APK

This creates a development APK that can be installed on devices:

```bash
npx eas build --platform android --profile development
```

## Option 4: Use Expo CLI (Easiest for Testing)

For quick testing and development:

```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Start development server
npx expo start

# Use Expo Go app on your phone to scan QR code
# Or build a development client:
npx expo run:android
```

## APK Location After Build

Once built successfully, the APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Quick Setup Script

Run this PowerShell script to check your environment:

```powershell
# Check Java
java -version

# Check Android SDK
$env:ANDROID_HOME

# Check if gradle wrapper exists
Test-Path "android\gradlew.bat"

# List installed Android SDK platforms
if ($env:ANDROID_HOME) {
    Get-ChildItem "$env:ANDROID_HOME\platforms"
}
```
