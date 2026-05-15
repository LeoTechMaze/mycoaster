/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable("user_credits", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.uuid("user_id").notNullable().references("id").inTable("users").onDelete("CASCADE");
    t.uuid("coaster_id").notNullable().references("id").inTable("coasters").onDelete("CASCADE");
    t.timestamp("ridden_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // One credit per coaster per user
    t.unique(["user_id", "coaster_id"]);
  });

  await knex.schema.raw(`
    CREATE INDEX idx_user_credits_user_id ON user_credits (user_id);
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("user_credits");
};
