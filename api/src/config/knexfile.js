const path = require("path");
const fs = require("fs");

// Resolve .env from the project root regardless of working directory changes
// (knex changes cwd to the knexfile location, so __dirname is unreliable)
function findEnvFile() {
  const candidates = [
    path.resolve(process.cwd(), "../.env"),       // run from api/
    path.resolve(process.cwd(), "../../.env"),    // run from api/src/ or api/src/config/
    path.resolve(process.cwd(), "../../../.env"), // run from api/src/config/ (deeper)
    path.resolve(process.cwd(), ".env"),          // run from project root
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

const envPath = findEnvFile();
if (envPath) {
  require("dotenv").config({ path: envPath });
} else {
  require("dotenv").config(); // fallback: let dotenv find it
}

/**
 * Knex configuration.
 * Supports DATABASE_URL (production) or individual fields (development).
 */
const connection = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.POSTGRES_HOST || "localhost",
      port: Number(process.env.POSTGRES_PORT) || 5432,
      user: process.env.POSTGRES_USER || "coaster",
      password: process.env.POSTGRES_PASSWORD || "coaster_secret",
      database: process.env.POSTGRES_DB || "coaster_tracker",
    };

/** @type {import('knex').Knex.Config} */
module.exports = {
  client: "pg",
  connection,
  migrations: {
    directory: path.resolve(__dirname, "../../migrations"),
    tableName: "knex_migrations",
    extension: "js",
  },
  seeds: {
    directory: path.resolve(__dirname, "../../seeds"),
  },
  pool: {
    min: 2,
    max: 10,
  },
};
