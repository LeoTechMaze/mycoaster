import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // No tests yet: an empty run must pass so the CI job does not fail
    passWithNoTests: true,
  },
});
