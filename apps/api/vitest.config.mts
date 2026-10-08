import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // describe/it/expect as globals, same as Jest, so test files need no imports
    globals: true,
    // env.ts loads .env and enforces the *_test database before any app module;
    // teardown.ts closes redis/firebase handles after each file
    setupFiles: ['./tests/env.ts', './tests/teardown.ts'],
    globalSetup: './tests/globalSetup.ts',
    testTimeout: 30000,
    hookTimeout: 30000,
    // Files share the same test DB, so they run one at a time
    fileParallelism: false,
  },
});
