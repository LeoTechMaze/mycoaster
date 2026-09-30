module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['./tests/env.js'],
  // Runs inside each test sandbox to close redis/firebase handles that would
  // otherwise keep the process alive after the run completes.
  setupFilesAfterEnv: ['./tests/teardown.js'],
  globalSetup: './tests/globalSetup.js',
  testTimeout: 30000,
  // Integration tests share a real DB — parallel workers would race on shared data
  maxWorkers: 1,
};
