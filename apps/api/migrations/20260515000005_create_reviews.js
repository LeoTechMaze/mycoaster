/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable("reviews", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    t.uuid("coaster_id").nullable().references("id").inTable("coasters").onDelete("CASCADE");
    t.uuid("park_id").nullable().references("id").inTable("parks").onDelete("CASCADE");
    t.string("target_type").notNullable(); // 'coaster' | 'park'
    t.integer("rating").notNullable(); // 1–5
    t.text("comment").nullable();
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    t.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  // Partial unique: one review per user per coaster
  await knex.raw(`
    CREATE UNIQUE INDEX uq_reviews_user_coaster
      ON reviews (user_id, coaster_id)
      WHERE target_type = 'coaster';
  `);

  // Partial unique: one review per user per park
  await knex.raw(`
    CREATE UNIQUE INDEX uq_reviews_user_park
      ON reviews (user_id, park_id)
      WHERE target_type = 'park';
  `);

  // Check constraint: rating between 1 and 5
  await knex.raw(`
    ALTER TABLE reviews
      ADD CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5);
  `);

  // Check constraint: target_type must be valid
  await knex.raw(`
    ALTER TABLE reviews
      ADD CONSTRAINT chk_reviews_target_type CHECK (target_type IN ('coaster', 'park'));
  `);

  await knex.schema.raw(`
    CREATE INDEX idx_reviews_coaster_id ON reviews (coaster_id) WHERE coaster_id IS NOT NULL;
    CREATE INDEX idx_reviews_park_id    ON reviews (park_id)    WHERE park_id IS NOT NULL;
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("reviews");
};
