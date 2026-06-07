// Runs once after all test suites (separate Node.js context from test workers).
// Closes shared infrastructure so Jest exits cleanly without forceExit.
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env.test'),
  override: true,
});

module.exports = async () => {
  const knex = require('knex');
  const knexConfig = require('../src/config/knexfile');
  const db = knex(knexConfig);
  await db.destroy();

  const redis = require('../src/config/redis');
  await redis.quit();
};
