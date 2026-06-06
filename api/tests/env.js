// Loaded via jest.config.js setupFiles — runs before any test module is required.
// Sets test env vars so that src/config/env.js validates against them.
require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env.test'),
  override: true,
});
