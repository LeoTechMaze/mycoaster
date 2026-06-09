module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['./tests/env.js'],
  globalSetup: './tests/globalSetup.js',
  globalTeardown: './tests/globalTeardown.js',
  testTimeout: 30000,
  // Integration tests share a real DB — parallel workers would race on shared data
  maxWorkers: 1,
};
