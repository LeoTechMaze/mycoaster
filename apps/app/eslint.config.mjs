import expoConfig from 'eslint-config-expo/flat.js';
import { ignores, metrics } from '../../eslint.base.mjs';

// Routes under src/app only compose screens: they read data through hooks and
// render components. Logic lives in components, hooks and lib, where coverage
// is measured (routes are excluded from coverage, see jest.config.js).
// Ratchet: warnings for now, counted in the metrics report; they become errors
// once the existing routes are refactored (see docs/REVIEW.md).
const thinRoutes = {
  files: ['src/app/**/*.{ts,tsx}'],
  rules: {
    complexity: ['warn', { max: 8 }],
    'max-lines': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
    'no-restricted-imports': [
      'warn',
      {
        patterns: [
          {
            group: ['@/lib/api', '@/lib/api/*', '**/lib/api', '**/lib/api/*'],
            message: 'Routes read data through hooks, not the API client directly.',
          },
          {
            group: ['@/constants/mock-data', '**/constants/mock-data'],
            message: 'Routes read data through hooks, not mock data directly.',
          },
        ],
      },
    ],
  },
};

export default [
  ...expoConfig,
  ignores,
  // Design reference from the handoff, not app code
  { ignores: ['design_handoff_mycoaster/**'] },
  metrics({ complexity: 20 }),
  thinRoutes,
];
