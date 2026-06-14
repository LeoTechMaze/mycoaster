// Runs once before all test suites (separate Node.js context from test workers).
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
  override: true,
});

module.exports = async () => {
  const knex = require('knex');

  // Create test DB if it doesn't exist (connect to default 'postgres' DB first)
  const adminDb = knex({
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: 'postgres',
    },
  });

  try {
    await adminDb.raw(`CREATE DATABASE ??`, [process.env.POSTGRES_DB]);
  } catch (err) {
    if (err.code !== '42P04') throw err;
  } finally {
    await adminDb.destroy();
  }

  // Run all migrations, reset all data, then seed the test DB.
  // The reset lives here (not in the seed) so the seed file stays safe to
  // run against a real database — CASCADE wipes every user-owned table.
  const knexConfig = require('../src/config/knexfile');
  const testDb = knex(knexConfig);
  await testDb.migrate.latest();
  await testDb.raw('TRUNCATE TABLE coasters, parks, users CASCADE');
  await testDb.seed.run();
  await testDb.destroy();
};
