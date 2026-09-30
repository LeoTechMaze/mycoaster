/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable("users", (t) => {
    t.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    t.string("name").notNullable();
    t.string("email").notNullable().unique();
    t.string("auth_provider").notNullable(); // 'google' | 'apple' | 'email'
    t.string("firebase_uid").notNullable().unique();
    t.integer("credit_count").notNullable().defaultTo(0);
    t.string("badge_level").notNullable().defaultTo("rookie"); // 'rookie' | 'enthusiast' | 'veteran' | 'legend'
    t.string("avatar_url").nullable();
    t.string("instagram_url").nullable();
    t.string("tiktok_url").nullable();
    t.string("youtube_url").nullable();
    t.boolean("is_premium").notNullable().defaultTo(false);
    t.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("users");
};
