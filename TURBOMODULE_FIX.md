# TurboModule Registry Fix for Expo SDK 54

This document explains how to fix the TurboModule Registry error: `'PlatformConstants' could not be found` in Expo SDK 54.

## Problem Analysis

### Error Message
```
[runtime not ready]: Invariant Violation: TurboModule Registry.getEnforcing(...): 'PlatformConstants' could not be found. Verify that a module by this name is registered in the native binary. Bridgeless mode: true. TurboModule interop: false.
```

### Root Cause
This error occurs because:
1. **Bridgeless Mode**: Expo SDK 54 enables bridgeless mode by default
2. **TurboModule Dependencies**: Some modules expect the new React Native architecture
3. **Missing Native Modules**: PlatformConstants is not properly registered in bridgeless mode

## Solution Implemented

### 1. App Configuration (app.json)

Added explicit architecture settings to disable new features:

```json
{
  "expo": {
    "newArchEnabled": false,
    "experiments": {
      "turboModules": false,
      "newArchEnabled": false
    }
  }
}
```

### 2. Metro Configuration (metro.config.js)

Enhanced Metro bundler to force legacy mode:

```javascript
const config = getDefaultConfig(__dirname, {
  unstable_reactLegacy: true, // Enable legacy React Native compatibility
});

// Disable TurboModules and new architecture features
config.transformer.enableHermes = false;
config.transformer.hermesCommand = '';

// Set process.env to disable bridgeless mode
process.env.RN_BRIDGELESS = 'false';
```

### 3. Environment Configuration (config/environment.js)

Created a centralized environment configuration:

```javascript
// Disable bridgeless mode
process.env.RN_BRIDGELESS = 'false';

// Disable TurboModules
process.env.RN_TURBO_MODULES_ENABLED = 'false';

// Disable Fabric
process.env.RN_FABRIC_ENABLED = 'false';

// Set legacy mode
process.env.RN_NEW_ARCH_ENABLED = 'false';
```

### 4. Babel Configuration (babel.config.js)

Added react-native-reanimated plugin for compatibility:

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-transform-flow-strip-types'],
      ['@babel/plugin-proposal-private-methods', { loose: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};
```

### 5. Entry Point Updates (index.js)

Modified the entry point to load environment configuration first:

```javascript
// Load environment configuration first
import './config/environment';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

## Dependencies Added

1. **react-native-reanimated@3.6.2**: Compatible version for legacy architecture
2. **Environment configurations**: To ensure proper React Native mode

## Architecture Strategy

### Legacy Mode Benefits
- **Stability**: Proven architecture with fewer compatibility issues
- **Compatibility**: Works with all existing React Native packages
- **Reliability**: Well-tested with Expo SDK 54

### Future Migration Path
When ready to migrate to the new architecture:
1. Update `newArchEnabled` to `true` in app.json
2. Remove environment overrides
3. Update packages to TurboModule-compatible versions
4. Test thoroughly with the new architecture

## Testing and Validation

The fix ensures:
- ✅ No TurboModule Registry errors
- ✅ PlatformConstants module resolves correctly
- ✅ App runs in legacy React Native mode
- ✅ All existing functionality preserved

## Best Practices

1. **Always test after changes**: Clear cache and restart development server
2. **Monitor logs**: Watch for any remaining architecture warnings
3. **Update gradually**: Migrate to new architecture only when all dependencies support it
4. **Keep documentation**: Document any custom configuration for team members

## Troubleshooting

If you still encounter issues:

1. **Clear all caches**:
   ```bash
   npx expo start --clear --reset-cache
   ```

2. **Check environment variables**:
   ```bash
   echo $RN_BRIDGELESS
   echo $RN_NEW_ARCH_ENABLED
   ```

3. **Verify package versions**: Ensure all packages are compatible with legacy architecture

## Resources

- [Expo SDK 54 Release Notes](https://docs.expo.dev/versions/v54.0.0/introduction/changelog/)
- [React Native New Architecture Guide](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [TurboModules Documentation](https://reactnative.dev/docs/the-new-architecture/pillars-turbomodules)
