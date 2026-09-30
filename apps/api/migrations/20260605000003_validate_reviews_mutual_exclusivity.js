/**
 * Validates chk_reviews_mutual_exclusivity against existing rows.
 * Run this only after confirming (or cleaning) any rows that violate the constraint.
 * Uses SHARE UPDATE EXCLUSIVE lock — does not block concurrent reads or writes.
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.raw(`
    ALTER TABLE reviews VALIDATE CONSTRAINT chk_reviews_mutual_exclusivity;
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  // No-op: reverting validation is not meaningful; drop the constraint via
  // 20260605000001 rollback if needed.
};
