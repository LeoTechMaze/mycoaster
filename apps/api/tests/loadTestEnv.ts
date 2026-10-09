import path from 'path';
import dotenv from 'dotenv';

const DEFAULT_TEST_DB = 'coaster_tracker_test';

/**
 * Loads apps/api/.env and points the suite at a dedicated test database.
 *
 * globalSetup truncates users, parks and coasters (CASCADE) before every run,
 * so the tests must never touch a dev or production database. The target is
 * POSTGRES_TEST_DB (default coaster_tracker_test), never POSTGRES_DB, and the
 * run aborts unless the final database name ends with "_test".
 */
export function loadTestEnv(): void {
  dotenv.config({
    path: path.resolve(__dirname, '../.env'),
    override: true,
  });

  if (process.env.DATABASE_URL) {
    throw new Error(
      '[tests] DATABASE_URL is set. Tests only run against POSTGRES_* fields ' +
        'pointing to a *_test database. Unset DATABASE_URL to run the suite.',
    );
  }

  process.env.POSTGRES_DB = process.env.POSTGRES_TEST_DB || DEFAULT_TEST_DB;

  if (!process.env.POSTGRES_DB.endsWith('_test')) {
    throw new Error(
      `[tests] Refusing to run against database "${process.env.POSTGRES_DB}". ` +
        'The test database name must end with "_test" because globalSetup ' +
        'wipes users, parks and coasters before every run.',
    );
  }
}
