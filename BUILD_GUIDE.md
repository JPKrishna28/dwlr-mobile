# 📱 Building & Installing Groundwater Insights Mobile App

This guide covers multiple ways to build and install your Groundwater Insights app on mobile devices.

## 🚀 Method 1: EAS Build (Recommended)

EAS (Expo Application Services) is the modern way to build Expo apps.

### Prerequisites
- Expo CLI installed globally
- Expo account (free at expo.dev)

### Step 1: Set Up EAS Project
```bash
# Login to Expo (if not already logged in)
npx expo login

# Initialize EAS project
npx eas build:configure
```

### Step 2: Build for Android (APK)
```bash
# Build APK for testing/sideloading
npx eas build --platform android --profile preview

# Build AAB for Google Play Store
npx eas build --platform android --profile production
```

### Step 3: Build for iOS
```bash
# Build for iOS (requires Apple Developer account)
npx eas build --platform ios --profile production
```

### Step 4: Download & Install
1. Go to [expo.dev](https://expo.dev) and login
2. Navigate to your project
3. Download the built APK/IPA file
4. Install on your device

---

## 🔧 Method 2: Local Build (Classic Expo)

### For Android APK

#### Prerequisites
- Android Studio installed
- Java JDK 17 or higher

#### Steps:
```bash
# Install Expo CLI if not already installed
npm install -g @expo/cli

# Build the app locally
npx expo build:android --type apk

# Or for modern approach
npx expo prebuild
npx expo run:android --variant release
```

---

## 📱 Method 3: Direct Installation Methods

### A. Using Expo Go (Development)
1. Install Expo Go from Play Store/App Store
2. Scan the QR code from `npx expo start`
3. App runs in Expo Go environment

### B. Development Build
```bash
# Create development build
npx eas build --profile development --platform android
```

---

## 🛠️ Detailed Build Instructions

### Android APK Build (Step by Step)

1. **Prepare Environment:**
   ```bash
   # Check if you have required tools
   npx expo doctor
   ```

2. **Login to Expo:**
   ```bash
   npx expo login
   # Enter your expo.dev credentials
   ```

3. **Build APK:**
   ```bash
   # For testing (smaller size, faster build)
   npx eas build -p android --profile preview
   
   # For production (optimized, store-ready)
   npx eas build -p android --profile production
   ```

4. **Monitor Build:**
   - Build will queue and run on Expo's servers
   - You'll get email notification when complete
   - Check status at expo.dev

5. **Download & Install:**
   - Download APK from expo.dev
   - Enable "Unknown Sources" in Android settings
   - Install the APK

### iOS IPA Build

1. **Apple Developer Account Required**
   - Need paid Apple Developer account ($99/year)

2. **Build iOS App:**
   ```bash
   npx eas build -p ios --profile production
   ```

3. **Distribution Options:**
   - App Store distribution
   - TestFlight for testing
   - Ad-hoc distribution (limited devices)

---

## 📦 Build Configuration Files

Your project now includes:

### `eas.json` - Build Configuration
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### `app.json` - App Configuration
- App name: "Groundwater Insights"
- Package: com.groundwater.insights
- Proper splash screen and icons configured

---

## 🎯 Quick Start (Recommended Path)

### For Testing:
```bash
# 1. Login to Expo
npx expo login

# 2. Build APK for testing
npx eas build -p android --profile preview

# 3. Wait for build completion (check expo.dev)
# 4. Download and install APK on Android device
```

### For Production:
```bash
# 1. Build production APK
npx eas build -p android --profile production

# 2. Test thoroughly
# 3. Submit to Google Play Store if desired
npx eas submit -p android
```

---

## 📋 Installation Methods

### Android:
1. **APK Sideloading:**
   - Download APK from expo.dev
   - Enable "Install from Unknown Sources"
   - Tap APK to install

2. **Google Play Store:**
   - Build with production profile
   - Submit using `npx eas submit`

### iOS:
1. **TestFlight (Testing):**
   - Build and submit to TestFlight
   - Share with testers via link

2. **App Store:**
   - Build and submit for review
   - Publish to App Store

---

## 🔍 Troubleshooting

### Build Fails:
- Check `npx expo doctor` for issues
- Verify all packages are compatible
- Check build logs in expo.dev

### APK Won't Install:
- Enable "Unknown Sources" in Android settings
- Check if device has enough storage
- Verify APK isn't corrupted

### App Crashes on Start:
- Check if Supabase URL/key are set correctly
- Verify all dependencies are included
- Check device logs via ADB

---

## 🚀 Next Steps After Building

1. **Test Thoroughly:**
   - Test on multiple devices
   - Verify all features work offline/online
   - Test city switching functionality

2. **Optimize:**
   - Add app icons and splash screens
   - Configure app signing
   - Set up crash reporting

3. **Distribute:**
   - Share APK directly
   - Publish to app stores
   - Set up automatic updates

---

## 💡 Tips for Success

- **Start with APK builds** - easier than iOS
- **Use preview profile first** - faster builds for testing
- **Test on physical devices** - emulators may not show all issues
- **Keep build logs** - helpful for debugging
- **Version your releases** - update version in app.json

Your Groundwater Insights app is now ready to be built and installed on mobile devices! 🌊📱
