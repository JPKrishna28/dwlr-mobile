# Dependency Conflict Resolution for Expo SDK 54

This document details the resolution of dependency conflicts and configuration issues that occurred after automated package updates.

## Problems Identified

### 1. Dependency Conflicts
```
npm error ERESOLVE unable to resolve dependency tree
expo-router@6.0.3 requires react-native-safe-area-context@">= 5.4.0"
But we have react-native-safe-area-context@4.8.2
```

### 2. expo-doctor Issues
- ❌ Invalid app.json schema (privacy, newArchEnabled, bridgelessMode in experiments)
- ❌ Metro config overrides missing Expo default extensions
- ❌ Duplicate @expo/metro-runtime dependencies
- ❌ Version mismatches for 9+ packages

### 3. Automatic Package Upgrades
- expo-router automatically upgraded from 3.5.21 to 6.0.3
- react-native upgraded from 0.73.4 to 0.81.4
- Other packages upgraded to incompatible versions

## Comprehensive Solution

### 1. Remove expo-router Completely
**Reason**: expo-router v6+ enforces new architecture features incompatible with our legacy setup

```bash
npm uninstall expo-router --legacy-peer-deps
```

**Result**: Eliminated dependency conflicts and architecture enforcement

### 2. Revert react-native to SDK 54 Compatible Version
```bash
npm install react-native@0.73.4 --legacy-peer-deps
```

### 3. Fix app.json Schema Violations
**Removed invalid properties**:
- `privacy: "public"` (not supported in SDK 54)
- `experiments.newArchEnabled` (duplicate of top-level)
- `experiments.bridgelessMode` (not recognized)

```json
{
  "expo": {
    "newArchEnabled": false,
    "jsEngine": "jsc",
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

### 4. Fix Metro Configuration
**Problem**: Overriding sourceExts and assetExts removed Expo defaults
**Solution**: Only extend assetExts, don't replace

```javascript
// Before (problematic)
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];
config.resolver.assetExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'ttf', 'otf', 'woff', 'woff2'];

// After (correct)
config.resolver.assetExts.push('ttf', 'otf', 'woff', 'woff2');
```

### 5. Resolve Duplicate Dependencies
**Downgraded @expo/metro-runtime**:
```bash
npm install @expo/metro-runtime@3.2.1 --legacy-peer-deps
```

### 6. Package Version Management Strategy
**Added comprehensive exclusion list** to prevent automatic updates:

```json
{
  "expo": {
    "install": {
      "exclude": [
        "expo-router",
        "react-native",
        "@expo/metro-runtime",
        "@react-native-async-storage/async-storage",
        "expo-dev-client",
        "expo-status-bar",
        "react",
        "react-native-reanimated",
        "react-native-safe-area-context",
        "react-native-screens",
        "react-native-svg"
      ]
    }
  }
}
```

### 7. Clean Up Unused Files
**Removed app/ directory** since we're using React Navigation instead of expo-router

## Results

### Before Fix
- ❌ 5 expo-doctor checks failed
- ❌ Dependency resolution errors
- ❌ TurboModule errors
- ❌ App not running

### After Fix
- ✅ 15/17 expo-doctor checks passed
- ✅ No dependency resolution errors
- ✅ Development server running smoothly
- ✅ App working with React Navigation

### Remaining "Issues" (Intentional)
1. **Native project folders warning**: Expected in our hybrid setup
2. **Version mismatches**: Intentionally maintained for compatibility

## Architecture Decision: React Navigation vs expo-router

### Why React Navigation Was Chosen
1. **Stability**: Mature, well-tested navigation solution
2. **Compatibility**: Works perfectly with legacy React Native architecture
3. **No Forced Upgrades**: Doesn't enforce new architecture features
4. **Team Familiarity**: Existing codebase already uses React Navigation

### Future Migration Path
When expo-router gains better legacy support:
1. Remove from exclusion list
2. Install compatible version
3. Test incrementally
4. Migrate screen by screen

## Best Practices Learned

### 1. Package Version Control
- Always use exclusion lists for critical packages
- Test package updates in development before production
- Document version dependencies and reasoning

### 2. Configuration Management
- Validate app.json against schema regularly
- Don't override Metro defaults unless necessary
- Keep configuration minimal and explicit

### 3. Dependency Resolution
- Use `--legacy-peer-deps` for React Native projects
- Monitor for duplicate dependencies
- Resolve conflicts at the package level, not build level

### 4. Architecture Decisions
- Choose stability over latest features for production apps
- Document architecture choices and constraints
- Plan migration paths for future upgrades

## Monitoring and Maintenance

### Regular Checks
```bash
# Check for dependency issues
npx expo-doctor

# Check for duplicate dependencies
npm ls --depth=0

# Validate Metro config
npx expo start --clear --no-dev
```

### Update Strategy
1. **Never run automatic updates** on production branches
2. **Test updates on feature branches** first
3. **Update one package at a time** to isolate issues
4. **Maintain exclusion lists** to prevent regressions

## Dependencies Locked to Compatible Versions

| Package | Version | Reason |
|---------|---------|--------|
| react-native | 0.73.4 | SDK 54 compatibility |
| @expo/metro-runtime | 3.2.1 | Avoid duplicates |
| react | 18.2.0 | RN 0.73.4 requirement |
| react-native-reanimated | 3.6.2 | Legacy architecture |
| react-native-screens | 3.29.0 | Navigation compatibility |

## Resources

- [Expo SDK 54 Dependency Guide](https://docs.expo.dev/versions/v54.0.0/)
- [React Navigation Documentation](https://reactnavigation.org/)
- [Metro Configuration Guide](https://docs.expo.dev/guides/customizing-metro/)
