const { Router } = require('express');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const db = require('../config/database');
const firebase = require('../config/firebase');
const { validate } = require('../middlewares/validate');
const { success } = require('../utils/response');

const router = Router();

const loginSchema = z.object({
  token: z.string().min(1),
});

const PROVIDER_MAP = {
  'google.com': 'google',
  'apple.com': 'apple',
  'password': 'email',
};

const USER_FIELDS = [
  'id', 'name', 'email', 'badge_level', 'credit_count',
  'avatar_url', 'instagram_url', 'tiktok_url', 'youtube_url',
];

router.post('/login', validate(loginSchema), async (req, res) => {
  if (!firebase) {
    const err = new Error('Firebase not configured');
    err.status = 503;
    throw err;
  }

  const { token } = req.validated;

  let decoded;
  try {
    decoded = await firebase.auth().verifyIdToken(token);
  } catch {
    const err = new Error('Invalid or expired Firebase token');
    err.status = 401;
    throw err;
  }

  const { uid, email, name, picture } = decoded;

  if (!uid || !email) {
    const err = new Error('Firebase token is missing required claims (uid, email)');
    err.status = 422;
    throw err;
  }

  const provider = PROVIDER_MAP[decoded.firebase?.sign_in_provider] || 'email';

  let user = await db('users').where({ firebase_uid: uid }).select(USER_FIELDS).first();

  if (!user) {
    // Attempt to link an existing account with the same email (provider switch).
    // Doing the update directly avoids a separate SELECT and is atomic.
    [user] = await db('users')
      .where({ email })
      .update({
        firebase_uid: uid,
        auth_provider: provider,
        ...(name != null && { name }),
        ...(picture != null && { avatar_url: picture }),
      })
      .returning(USER_FIELDS);
  }

  if (!user) {
    [user] = await db('users')
      .insert({
        name: name ?? email.split('@')[0],
        email,
        firebase_uid: uid,
        auth_provider: provider,
        avatar_url: picture || null,
      })
      .returning(USER_FIELDS);
  }

  const jwtToken = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return success(res, { token: jwtToken, user });
});

module.exports = router;
