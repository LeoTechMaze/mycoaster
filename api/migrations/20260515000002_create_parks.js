/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable("parks", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("name").notNullable();
    t.string("country").notNullable();
    t.string("city").notNullable();
    t.float("latitude").notNullable();
    t.float("longitude").notNullable();
    t.string("rcdb_id").notNullable().unique();
    t.jsonb("ai_summary").nullable(); // { summary, tags, review_count, generated_at }
    t.timestamp("synced_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // Index for geo proximity queries (lat/lng range filtering)
  await knex.schema.raw(`
    CREATE INDEX idx_parks_lat_lng ON parks (latitude, longitude);
  `);

  // Index for country/city search
  await knex.schema.raw(`
    CREATE INDEX idx_parks_country_city ON parks (lower(country), lower(city));
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("parks");
};
