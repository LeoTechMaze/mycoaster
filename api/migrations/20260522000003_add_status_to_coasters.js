/**
 * Adds `status` column to the `coasters` table.
 *
 * Status is derived by the RCDB scraper (n8n workflow) from the section
 * heading each coaster appears under on its parent park page:
 *
 *   "Operating Roller Coasters"          → 'operating'
 *   "SBNO Roller Coasters"               → 'sbno'
 *   "Defunct Roller Coasters"            → 'defunct'
 *   "Roller Coasters Under Construction" → 'under_construction'
 *
 * 'sbno' (Standing But Not Operating) means the coaster is temporarily
 * closed but still standing — distinct from 'defunct' (permanently removed).
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.schema.alterTable('coasters', (t) => {
    t.string('status', 20).notNullable().defaultTo('operating');
  });

  // Check constraint — enforce valid values at DB level
  await knex.raw(`
    ALTER TABLE coasters
    ADD CONSTRAINT coasters_status_check
    CHECK (status IN ('operating', 'sbno', 'under_construction', 'defunct'));
  `);

  // Index to filter coasters by status (e.g. only show operating coasters in listings)
  await knex.raw(`
    CREATE INDEX idx_coasters_status ON coasters (status);
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.raw(`DROP INDEX IF EXISTS idx_coasters_status;`);
  await knex.raw(`ALTER TABLE coasters DROP CONSTRAINT IF EXISTS coasters_status_check;`);

  await knex.schema.alterTable('coasters', (t) => {
    t.dropColumn('status');
  });
};
