module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Add these plugins to ensure compatibility with the legacy architecture
      ['@babel/plugin-transform-flow-strip-types'],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      // React Native Reanimated plugin - must be last
      'react-native-reanimated/plugin',
    ],
  };
};
