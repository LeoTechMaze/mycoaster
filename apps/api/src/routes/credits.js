const { Router } = require('express');
const { z } = require('zod');
const db = require('../config/database');
const redis = require('../config/redis');
const authenticate = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { success } = require('../utils/response');
const { uuid, uuidParams } = require('../utils/schemas');

const router = Router();

const postSchema = z.object({
  coaster_id: uuid,
});

router.post('/', authenticate, validate(postSchema), async (req, res) => {
  const { coaster_id } = req.validated;

  const coaster = await db('coasters').where({ id: coaster_id }).first('id');
  if (!coaster) {
    const err = new Error('Coaster not found');
    err.status = 404;
    throw err;
  }

  const [credit] = await db('user_credits')
    .insert({ user_id: req.user.id, coaster_id, ridden_at: new Date() })
    .returning(['id', 'coaster_id', 'ridden_at']);

  redis.del('leaderboard').catch(() => {});

  return success(res, credit, { status: 201 });
});

router.delete('/:coaster_id', authenticate, validate(uuidParams('coaster_id'), 'params'), async (req, res) => {
  const deleted = await db('user_credits')
    .where({ user_id: req.user.id, coaster_id: req.validated.coaster_id })
    .delete();

  if (!deleted) {
    const err = new Error('Credit not found');
    err.status = 404;
    throw err;
  }

  redis.del('leaderboard').catch(() => {});

  return res.status(204).end();
});

router.get('/me', authenticate, async (req, res) => {
  const credits = await db('user_credits as uc')
    .join('coasters as c', 'uc.coaster_id', 'c.id')
    .join('parks as p', 'c.park_id', 'p.id')
    .where('uc.user_id', req.user.id)
    .select(
      'uc.id',
      'uc.coaster_id',
      'uc.ridden_at',
      'c.name as coaster_name',
      'c.park_id',
      'p.name as park_name'
    )
    .orderBy('uc.ridden_at', 'desc');

  return success(res, credits);
});

module.exports = router;
