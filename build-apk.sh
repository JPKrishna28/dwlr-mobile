#!/bin/bash
# Simple APK Builder Script for Groundwater Insights App

echo "🏗️  Building Groundwater Insights APK locally..."
echo "📱 This will create an APK file you can install on Android devices"
echo ""

# Method 1: EAS Build with Preview Profile (Creates APK)
echo "🔄 Building APK using EAS Build (Preview Profile)..."
npx eas build --platform android --profile preview

echo ""
echo "✅ APK build completed!"
echo "📦 Your APK will be available for download from the EAS build link above"
echo ""
echo "📱 To install on Android device:"
echo "   1. Download the APK from the link provided"
echo "   2. Enable 'Install from Unknown Sources' in Android Settings"
echo "   3. Install the APK file"
echo ""
echo "🔧 Alternative: Build development version"
echo "   Run: npx eas build --platform android --profile development"
