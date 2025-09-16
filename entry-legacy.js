// Custom entry point to force legacy React Native architecture
// This must be loaded before any other modules

// Override global flags BEFORE any React Native modules load
global.__REACT_NATIVE_BRIDGELESS__ = false;
global.__TURBO_MODULES_ENABLED__ = false;
global.__FABRIC_ENABLED__ = false;

// Set environment variables
process.env.RN_BRIDGELESS = 'false';
process.env.RN_NEW_ARCH_ENABLED = 'false';
process.env.RN_TURBO_MODULES_ENABLED = 'false';
process.env.RN_FABRIC_ENABLED = 'false';

// Force Metro to use legacy mode
global.__DEV__ = true;

console.log('🔧 Legacy React Native architecture enforced');
console.log('   - Bridgeless mode: DISABLED');
console.log('   - TurboModules: DISABLED');
console.log('   - Fabric: DISABLED');

// Load polyfills for missing native modules
try {
  require('./polyfills/PlatformConstants');
} catch (error) {
  console.warn('Could not load PlatformConstants polyfill:', error);
}

// Import React Native and set up legacy mode
import { AppRegistry } from 'react-native';

// Import the Expo Router App component
import { ExpoRoot } from 'expo-router';

// Register the root component
AppRegistry.registerComponent('main', () => ExpoRoot);
