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

  // Run all migrations on the test DB
  const knexConfig = require('../src/config/knexfile');
  const testDb = knex(knexConfig);
  await testDb.migrate.latest();
  await testDb.destroy();
};
