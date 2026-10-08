module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFiles: ['./tests/env.ts'],
  // Runs inside each test sandbox to close redis/firebase handles that would
  // otherwise keep the process alive after the run completes.
  setupFilesAfterEnv: ['./tests/teardown.ts'],
  globalSetup: './tests/globalSetup.ts',
  testTimeout: 30000,
  // Integration tests share a real DB — parallel workers would race on shared data
  maxWorkers: 1,
};
