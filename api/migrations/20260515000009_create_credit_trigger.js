/**
 * Migration: PostgreSQL trigger that keeps users.credit_count and users.badge_level
 * in sync whenever a row is inserted or deleted from user_credits.
 *
 * Badge thresholds (from design spec):
 *   rookie      0–49
 *   enthusiast  50–149
 *   veteran     150–299
 *   legend      300+
 *
 * @param {import('knex').Knex} knex
 */
exports.up = async function (knex) {
  // 1. PL/pgSQL function called by the trigger
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_user_credit_count()
    RETURNS TRIGGER AS $$
    DECLARE
      v_credit_count INTEGER;
      v_badge_level  TEXT;
    BEGIN
      -- Determine the user whose count needs updating
      IF (TG_OP = 'INSERT') THEN
        UPDATE users
          SET credit_count = credit_count + 1
          WHERE id = NEW.user_id
          RETURNING credit_count INTO v_credit_count;
      ELSIF (TG_OP = 'DELETE') THEN
        UPDATE users
          SET credit_count = GREATEST(credit_count - 1, 0)
          WHERE id = OLD.user_id
          RETURNING credit_count INTO v_credit_count;
      END IF;

      -- Derive badge level from the updated count
      v_badge_level := CASE
        WHEN v_credit_count >= 300 THEN 'legend'
        WHEN v_credit_count >= 150 THEN 'veteran'
        WHEN v_credit_count >= 50  THEN 'enthusiast'
        ELSE 'rookie'
      END;

      -- Update badge only if it changed (avoids unnecessary writes)
      IF (TG_OP = 'INSERT') THEN
        UPDATE users
          SET badge_level = v_badge_level
          WHERE id = NEW.user_id AND badge_level <> v_badge_level;
        RETURN NEW;
      ELSE
        UPDATE users
          SET badge_level = v_badge_level
          WHERE id = OLD.user_id AND badge_level <> v_badge_level;
        RETURN OLD;
      END IF;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // 2. Attach the trigger to user_credits
  await knex.raw(`
    CREATE TRIGGER trg_user_credits_sync
    AFTER INSERT OR DELETE ON user_credits
    FOR EACH ROW EXECUTE FUNCTION update_user_credit_count();
  `);
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function (knex) {
  await knex.raw(`DROP TRIGGER IF EXISTS trg_user_credits_sync ON user_credits;`);
  await knex.raw(`DROP FUNCTION IF EXISTS update_user_credit_count();`);
};
