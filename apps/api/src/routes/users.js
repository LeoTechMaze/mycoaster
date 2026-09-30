const { Router } = require('express');
const { z } = require('zod');
const db = require('../config/database');
const authenticate = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { success } = require('../utils/response');

const router = Router();

const PUBLIC_FIELDS = [
  'id', 'name', 'badge_level', 'credit_count',
  'avatar_url', 'instagram_url', 'tiktok_url', 'youtube_url', 'created_at',
];

router.get('/:id', async (req, res) => {
  const user = await db('users').where({ id: req.params.id }).select(PUBLIC_FIELDS).first();
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return success(res, user);
});

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar_url: z.string().url().nullable().optional(),
  instagram_url: z.string().url().nullable().optional(),
  tiktok_url: z.string().url().nullable().optional(),
  youtube_url: z.string().url().regex(
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//,
    'Must be a YouTube URL (youtube.com or youtu.be)'
  ).nullable().optional(),
});

router.patch('/me', authenticate, validate(patchSchema), async (req, res) => {
  if (Object.keys(req.validated).length === 0) {
    const err = new Error('At least one field must be provided');
    err.status = 422;
    throw err;
  }

  const [updated] = await db('users')
    .where({ id: req.user.id })
    .update(req.validated)
    .returning([...PUBLIC_FIELDS, 'email']);

  if (!updated) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  return success(res, updated);
});

module.exports = router;
