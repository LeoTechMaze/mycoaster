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
  transformIgnorePatterns: [
    'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|react-native-svg))',
  ],
};
