/**
 * C-007: Auto-update reviews.updated_at on every UPDATE.
 * Follows the same PL/pgSQL pattern as trg_user_credits_sync.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.raw(`
    CREATE OR REPLACE FUNCTION set_reviews_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.raw(`
    CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION set_reviews_updated_at();
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.raw(`DROP TRIGGER IF EXISTS trg_reviews_updated_at ON reviews;`);
  await knex.raw(`DROP FUNCTION IF EXISTS set_reviews_updated_at();`);
};
