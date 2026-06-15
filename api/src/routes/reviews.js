const { Router } = require('express');
const { z } = require('zod');
const db = require('../config/database');
const authenticate = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { success } = require('../utils/response');
const { uuid, uuidParams } = require('../utils/schemas');

const router = Router();

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
    comment: comment.optional(),
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

    // updated_at is maintained by trg_reviews_updated_at
    const [updated] = await db('reviews')
      .where({ id })
      .update(req.validated)
      .returning(RETURN_FIELDS);

    return success(res, updated);
  }
);

function listReviews(targetType, fkColumn) {
  return async (req, res) => {
    const { id } = req.validated;

    const table = targetType === 'coaster' ? 'coasters' : 'parks';
    const target = await db(table).where({ id }).first('id');
    if (!target) {
      throw notFound(targetType === 'coaster' ? 'Coaster not found' : 'Park not found');
    }

    const reviews = await db('reviews as r')
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
      .orderBy('r.created_at', 'desc');

    return success(res, reviews);
  };
}

router.get('/coaster/:id', validate(uuidParams('id'), 'params'), listReviews('coaster', 'coaster_id'));
router.get('/park/:id', validate(uuidParams('id'), 'params'), listReviews('park', 'park_id'));

module.exports = router;
