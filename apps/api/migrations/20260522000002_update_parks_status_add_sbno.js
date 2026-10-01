/**
 * Updates the `parks_status_check` constraint to include 'sbno'
 * (Standing But Not Operating) as a valid status value.
 *
 * The previous migration (20260522000001) mapped RCDB id=311 (SBNO) to
 * 'defunct', collapsing two distinct concepts. SBNO means a park is
 * temporarily not operating and may return; 'defunct' means permanently closed.
 *
 * Updated RCDB g.htm ID mapping:
 *   id=93  → 'operating'
 *   id=310 → 'under_construction'
 *   id=311 → 'sbno'     (Standing But Not Operating — may return)
 *   id=318 → 'defunct'  (Operated — permanently closed)
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  // Drop the old constraint that was missing 'sbno'
  await knex.raw(`
    ALTER TABLE parks
    DROP CONSTRAINT IF EXISTS parks_status_check;
  `);

  // Recreate with the full set of valid values
  await knex.raw(`
    ALTER TABLE parks
    ADD CONSTRAINT parks_status_check
    CHECK (status IN ('operating', 'sbno', 'under_construction', 'defunct'));
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.raw(`
    ALTER TABLE parks
    DROP CONSTRAINT IF EXISTS parks_status_check;
  `);

  // Restore the original constraint (without 'sbno')
  await knex.raw(`
    ALTER TABLE parks
    ADD CONSTRAINT parks_status_check
    CHECK (status IN ('operating', 'under_construction', 'defunct'));
  `);
};
