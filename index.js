// Load environment configuration first
import './config/environment';

// Override global flags BEFORE any React Native modules load
global.__REACT_NATIVE_BRIDGELESS__ = false;
global.__TURBO_MODULES_ENABLED__ = false;
global.__FABRIC_ENABLED__ = false;

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
