/**
 * C-006: Enforce that a review targets either a coaster OR a park, never both.
 * target_type='coaster' → coaster_id NOT NULL, park_id NULL
 * target_type='park'    → park_id NOT NULL, coaster_id NULL
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.raw(`
    ALTER TABLE reviews
      ADD CONSTRAINT chk_reviews_mutual_exclusivity CHECK (
        (target_type = 'coaster' AND coaster_id IS NOT NULL AND park_id IS NULL) OR
        (target_type = 'park'    AND park_id IS NOT NULL    AND coaster_id IS NULL)
      );
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.raw(`
    ALTER TABLE reviews DROP CONSTRAINT IF EXISTS chk_reviews_mutual_exclusivity;
  `);
};
