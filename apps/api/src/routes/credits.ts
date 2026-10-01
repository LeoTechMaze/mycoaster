import { Router } from 'express';
import { z } from 'zod';
import db from '../config/database';
import redis from '../config/redis';
import authenticate from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { success } from '../utils/response';
import { uuid, uuidParams } from '@mycoaster/shared';

const router = Router();

const postSchema = z.object({
  coaster_id: uuid,
});

router.post('/', authenticate, validate(postSchema), async (req, res) => {
  const { coaster_id } = req.validated;

  const coaster = await db('coasters').where({ id: coaster_id }).first('id');
  if (!coaster) {
    const err: any = new Error('Coaster not found');
    err.status = 404;
    throw err;
  }

  const [credit] = await db('user_credits')
    .insert({ user_id: req.user!.id, coaster_id, ridden_at: new Date() })
    .returning(['id', 'coaster_id', 'ridden_at']);

  redis.del('leaderboard').catch(() => {});

  return success(res, credit, { status: 201 });
});

router.delete('/:coaster_id', authenticate, validate(uuidParams('coaster_id'), 'params'), async (req, res) => {
  const deleted = await db('user_credits')
    .where({ user_id: req.user!.id, coaster_id: req.validated.coaster_id })
    .delete();

  if (!deleted) {
    const err: any = new Error('Credit not found');
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
    .where('uc.user_id', req.user!.id)
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

export = router;
