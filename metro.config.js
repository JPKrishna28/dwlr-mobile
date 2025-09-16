// Learn more: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support custom fonts and web font assets
config.resolver.assetExts.push('ttf', 'otf', 'woff', 'woff2');

// Optional: if you need to alias node_modules (e.g., vector-icons)
config.resolver.extraNodeModules = {
  'react-native-vector-icons': require('path').resolve(
    __dirname,
    'node_modules/react-native-vector-icons'
  ),
};

// Add runtime configuration for legacy architecture
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    ...config.transformer.minifierConfig,
    mangle: false,
  },
};

// Ensure proper platform resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
