/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable("photos", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    t.uuid("park_id").nullable().references("id").inTable("parks").onDelete("SET NULL");
    t.uuid("coaster_id").nullable().references("id").inTable("coasters").onDelete("SET NULL");
    t.string("image_url").notNullable(); // URL in object storage (S3/R2)
    t.string("status").notNullable().defaultTo("pending"); // 'pending' | 'approved' | 'rejected'
    t.integer("like_count").notNullable().defaultTo(0); // denormalized for ordering
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.raw(`
    ALTER TABLE photos
      ADD CONSTRAINT chk_photos_status CHECK (status IN ('pending', 'approved', 'rejected'));
  `);

  // Index for ordered gallery queries
  await knex.schema.raw(`
    CREATE INDEX idx_photos_park_id     ON photos (park_id)     WHERE park_id IS NOT NULL;
    CREATE INDEX idx_photos_coaster_id  ON photos (coaster_id)  WHERE coaster_id IS NOT NULL;
    CREATE INDEX idx_photos_like_count  ON photos (like_count DESC, created_at DESC);
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("photos");
};
