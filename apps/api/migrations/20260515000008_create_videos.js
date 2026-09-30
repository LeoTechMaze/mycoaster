/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable("videos", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    t.uuid("park_id").nullable().references("id").inTable("parks").onDelete("SET NULL");
    t.uuid("coaster_id").nullable().references("id").inTable("coasters").onDelete("SET NULL");
    t.string("youtube_url").notNullable();
    t.string("thumbnail_url").notNullable(); // extracted via YouTube oEmbed
    t.string("title").nullable();
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.raw(`
    CREATE INDEX idx_videos_park_id    ON videos (park_id)    WHERE park_id IS NOT NULL;
    CREATE INDEX idx_videos_coaster_id ON videos (coaster_id) WHERE coaster_id IS NOT NULL;
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("videos");
};
