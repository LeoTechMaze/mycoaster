/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable("coasters", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("park_id").notNullable().references("id").inTable("parks").onDelete("CASCADE");
    t.string("name").notNullable();
    t.string("rcdb_id").notNullable().unique();
    t.jsonb("ai_summary").nullable(); // { summary, tags, review_count, generated_at }
    t.timestamp("synced_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.raw(`
    CREATE INDEX idx_coasters_park_id ON coasters (park_id);
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("coasters");
};
