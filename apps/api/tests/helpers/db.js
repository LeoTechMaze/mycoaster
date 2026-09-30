const db = require('../../src/config/database');

// Truncates tables in dependency order (children before parents).
async function truncate(...tables) {
  for (const table of tables) {
    await db.raw('TRUNCATE TABLE ?? CASCADE', [table]);
  }
}

module.exports = { db, truncate };
