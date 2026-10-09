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
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // lcov feeds diff-cover in CI, with paths from the repo root to match git diff.
      // json-summary feeds the metrics report.
      reporter: ['text-summary', ['lcov', { projectRoot: '../..' }], 'json-summary'],
      // Global floor, see docs/REVIEW.md. Changed code is gated separately in CI.
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
  },
});
