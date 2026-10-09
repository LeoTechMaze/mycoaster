import expoConfig from 'eslint-config-expo/flat.js';
import { ignores, metrics } from '../../eslint.base.mjs';

export default [
  ...expoConfig,
  ignores,
  // Design reference from the handoff, not app code
  { ignores: ['design_handoff_mycoaster/**'] },
  metrics({ complexity: 20 }),
];
