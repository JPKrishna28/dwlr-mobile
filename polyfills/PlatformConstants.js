/**
 * PlatformConstants polyfill for legacy React Native architecture
 * This provides a fallback implementation when the native module is not available
 */

import { Platform, Dimensions } from 'react-native';

// Mock PlatformConstants module
const PlatformConstants = {
  forceTouchAvailable: false,
  interfaceIdiom: Platform.OS === 'ios' ? 'phone' : undefined,
  isTesting: false,
  osVersion: Platform.Version,
  reactNativeVersion: {
    major: 0,
    minor: 73,
    patch: 4,
    prerelease: null,
  },
  systemName: Platform.OS === 'ios' ? 'iOS' : 'Android',
  Brand: Platform.OS === 'android' ? 'google' : undefined,
  Manufacturer: Platform.OS === 'android' ? 'Google' : undefined,
  Model: Platform.OS === 'android' ? 'Android SDK built for x86' : undefined,
  getConstants: function() {
    return this;
  }
};

// Export the polyfill
export default PlatformConstants;

// Register as a native module fallback
if (global.__turboModuleProxy) {
  try {
    global.__turboModuleProxy.get('PlatformConstants', () => PlatformConstants);
  } catch (error) {
    console.warn('Could not register PlatformConstants polyfill:', error);
  }
}

console.log('📱 PlatformConstants polyfill loaded');
