const { Router } = require('express');
const { z } = require('zod');
const db = require('../config/database');
const authenticate = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { success } = require('../utils/response');
const { uuid, uuidParams, UUID_RE } = require('../utils/schemas');

const router = Router();

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Pagination for the review listing endpoints. Cursor encodes the
// (created_at, id) of the last row so the next page is stable under inserts.
const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
  cursor: z.string().min(1).optional(),
});

function encodeCursor(row) {
  return Buffer.from(`${row.created_at.toISOString()}|${row.id}`).toString('base64url');
}

function decodeCursor(cursor) {
  const [createdAt, id] = Buffer.from(cursor, 'base64url').toString('utf8').split('|');
  if (!createdAt || !id || Number.isNaN(Date.parse(createdAt)) || !UUID_RE.test(id)) {
    const err = new Error('Invalid cursor');
    err.status = 422;
    throw err;
  }
  return { createdAt, id };
}

const RETURN_FIELDS = [
  'id', 'user_id', 'target_type', 'coaster_id', 'park_id',
  'rating', 'comment', 'created_at', 'updated_at',
];

const rating = z.coerce.number().int().min(1).max(5);
const comment = z.string().trim().max(2000);

// One review targets a coaster OR a park, never both — mirrors the DB
// constraint chk_reviews_mutual_exclusivity. The refine surfaces as 422.
const createSchema = z
  .object({
    target_type: z.enum(['coaster', 'park']),
    coaster_id: uuid.optional(),
    park_id: uuid.optional(),
    rating,
    // comment is a nullable column; accept null as equivalent to omitting it
    comment: comment.nullable().optional(),
  })
  .refine(
    (d) =>
      d.target_type === 'coaster'
        ? d.coaster_id != null && d.park_id == null
        : d.park_id != null && d.coaster_id == null,
    {
      message:
        "target_type must match its id: 'coaster' requires coaster_id only, 'park' requires park_id only",
    }
  );

// Target is immutable on update — only the rating and/or comment can change.
const updateSchema = z
  .object({
    rating: rating.optional(),
    comment: comment.nullable().optional(),
  })
  .refine((d) => d.rating !== undefined || d.comment !== undefined, {
    message: 'Provide rating and/or comment to update',
  });

function notFound(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

router.post('/', authenticate, validate(createSchema), async (req, res) => {
  const { target_type, coaster_id, park_id, rating: value, comment: text } = req.validated;

  const target =
    target_type === 'coaster'
      ? await db('coasters').where({ id: coaster_id }).first('id')
      : await db('parks').where({ id: park_id }).first('id');

  if (!target) {
    throw notFound(target_type === 'coaster' ? 'Coaster not found' : 'Park not found');
  }

  // Duplicate (same user + target) surfaces as 23505 → 409 via errorHandler
  const [review] = await db('reviews')
    .insert({
      user_id: req.user.id,
      target_type,
      coaster_id: target_type === 'coaster' ? coaster_id : null,
      park_id: target_type === 'park' ? park_id : null,
      rating: value,
      comment: text ?? null,
    })
    .returning(RETURN_FIELDS);

  return success(res, review, { status: 201 });
});

// params-validate is a gate: a bad UUID returns 422 (not a Postgres 22P02 cast
// error). The body validate overwrites req.validated, so the id is read from
// req.params.id, which the gate already proved valid.
router.put(
  '/:id',
  authenticate,
  validate(uuidParams('id'), 'params'),
  validate(updateSchema),
  async (req, res) => {
    const { id } = req.params;

    const review = await db('reviews').where({ id }).first('id', 'user_id');
    if (!review) throw notFound('Review not found');
    if (review.user_id !== req.user.id) {
      const err = new Error('You can only edit your own reviews');
      err.status = 403;
      throw err;
    }

    // Scope the UPDATE to the owner so a concurrent delete (or ownership
    // change) yields 0 rows rather than touching a row we no longer own.
    // updated_at is maintained by trg_reviews_updated_at.
    const [updated] = await db('reviews')
      .where({ id, user_id: req.user.id })
      .update(req.validated)
      .returning(RETURN_FIELDS);

    // Row vanished between the ownership check and the UPDATE — don't return
    // a 200 with an empty body.
    if (!updated) throw notFound('Review not found');

    return success(res, updated);
  }
);

function listReviews(targetType, fkColumn) {
  return async (req, res) => {
    // id is validated by the params gate; req.validated holds the query (the
    // body/query validate overwrites what the params validate set).
    const { id } = req.params;
    const { limit, cursor } = req.validated;

    const table = targetType === 'coaster' ? 'coasters' : 'parks';
    const target = await db(table).where({ id }).first('id');
    if (!target) {
      throw notFound(targetType === 'coaster' ? 'Coaster not found' : 'Park not found');
    }

    const query = db('reviews as r')
      .join('users as u', 'r.user_id', 'u.id')
      .where('r.target_type', targetType)
      .andWhere(`r.${fkColumn}`, id)
      .select(
        'r.id',
        'r.user_id',
        'r.rating',
        'r.comment',
        'r.created_at',
        'r.updated_at',
        'u.name as user_name',
        'u.avatar_url as user_avatar_url',
        'u.badge_level as user_badge_level'
      )
      // Tiebreak on id so ordering (and the cursor) is deterministic when two
      // reviews share a created_at timestamp.
      .orderBy('r.created_at', 'desc')
      .orderBy('r.id', 'desc')
      .limit(limit + 1); // fetch one extra to detect whether a next page exists

    if (cursor) {
      const { createdAt, id: cursorId } = decodeCursor(cursor);
      query.whereRaw('(r.created_at, r.id) < (?, ?)', [createdAt, cursorId]);
    }

    const rows = await query;
    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const next_cursor = hasMore ? encodeCursor(page[page.length - 1]) : null;

    return success(res, page, { meta: { limit, next_cursor } });
  };
}

const listMiddleware = [validate(uuidParams('id'), 'params'), validate(listQuerySchema, 'query')];

router.get('/coaster/:id', ...listMiddleware, listReviews('coaster', 'coaster_id'));
router.get('/park/:id', ...listMiddleware, listReviews('park', 'park_id'));

module.exports = router;
