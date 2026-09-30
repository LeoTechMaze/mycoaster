/**
 * Adds `status` column to the `parks` table.
 *
 * Values are sourced from the RCDB scraper (n8n workflow) by reading the
 * first g.htm?id= link on each park page — which is always the current
 * official status declared by the RCDB.
 *
 * Mapping from RCDB g.htm IDs:
 *   id=93  → 'operating'
 *   id=310 → 'under_construction'
 *   id=311 → 'defunct'  (SBNO — Standing But Not Operating)
 *   id=318 → 'defunct'  (Operated — park has permanently closed)
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  await knex.schema.alterTable('parks', (t) => {
    t.string('status', 20).notNullable().defaultTo('operating');
  });

  // Check constraint — enforce valid values at DB level (project convention)
  await knex.raw(`
    ALTER TABLE parks
    ADD CONSTRAINT parks_status_check
    CHECK (status IN ('operating', 'under_construction', 'defunct'));
  `);

  // Index to filter parks by status efficiently (e.g. WHERE status = 'operating')
  await knex.raw(`
    CREATE INDEX idx_parks_status ON parks (status);
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.raw(`DROP INDEX IF EXISTS idx_parks_status;`);
  await knex.raw(`ALTER TABLE parks DROP CONSTRAINT IF EXISTS parks_status_check;`);

  await knex.schema.alterTable('parks', (t) => {
    t.dropColumn('status');
  });
};
