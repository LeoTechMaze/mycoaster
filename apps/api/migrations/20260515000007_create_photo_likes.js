/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable("photo_likes", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    t.uuid("photo_id").notNullable().references("id").inTable("photos").onDelete("CASCADE");
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // One like per user per photo
    t.unique(["user_id", "photo_id"]);
  });

  await knex.schema.raw(`
    CREATE INDEX idx_photo_likes_photo_id ON photo_likes (photo_id);
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("photo_likes");
};
