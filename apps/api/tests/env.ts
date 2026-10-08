// Loaded via jest.config.js setupFiles — runs before any test module is required.
// Sets test env vars so that src/config/env.js validates against them.
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
  override: true,
});
