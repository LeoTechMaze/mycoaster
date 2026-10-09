import db from '../../src/config/database';

// Truncates tables in dependency order (children before parents).
async function truncate(...tables: string[]) {
  for (const table of tables) {
    await db.raw('TRUNCATE TABLE ?? CASCADE', [table]);
  }
}

export { db, truncate };
