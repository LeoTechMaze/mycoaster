import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // No tests yet: an empty run must pass so the CI job does not fail
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
      reporter: ['text-summary', ['lcov', { projectRoot: '../..' }], 'json-summary'],
      // No global floor yet (no tests). Changed code is gated in CI.
    },
  },
});
