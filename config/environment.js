/**
 * Environment configuration to disable new architecture features
 */

// Disable bridgeless mode
process.env.RN_BRIDGELESS = 'false';

// Disable TurboModules
process.env.RN_TURBO_MODULES_ENABLED = 'false';

// Disable Fabric
process.env.RN_FABRIC_ENABLED = 'false';

// Set legacy mode
process.env.RN_NEW_ARCH_ENABLED = 'false';

console.log('Environment configured for legacy React Native architecture');

module.exports = {
  RN_BRIDGELESS: false,
  RN_TURBO_MODULES_ENABLED: false,
  RN_FABRIC_ENABLED: false,
  RN_NEW_ARCH_ENABLED: false,
};
