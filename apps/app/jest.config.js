/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // Tests live next to the code they cover. Never under src/app: expo-router
  // would treat a test file there as a route.
  testMatch: ['<rootDir>/src/**/*.test.ts?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/app/'],
  // pnpm keeps packages under node_modules/.pnpm, so the optional `.pnpm/`
  // segment lets Babel still transform React Native and Expo packages.
  moduleNameMapper: {
    '\\.css$': '<rootDir>/jest/style-mock.js',
  },
  // Routes under src/app stay thin (enforced by ESLint) and are left out, so
  // coverage reflects the components, hooks and lib code that hold the logic.
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/app/**',
    '!src/constants/mock-data.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
  ],
  // lcov feeds diff-cover in CI, with paths from the repo root to match git diff.
  // json-summary feeds the metrics report.
  coverageReporters: ['text-summary', ['lcov', { projectRoot: '../..' }], 'json-summary'],
  // Global floor, see docs/REVIEW.md. Changed code is gated separately in CI.
  coverageThreshold: {
    global: { lines: 5, branches: 5, functions: 5, statements: 5 },
  },
  transformIgnorePatterns: [
    'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|react-native-svg))',
  ],
};
