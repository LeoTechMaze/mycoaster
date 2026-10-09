// Mock firebase config before any app modules are required.
// vi.mock is hoisted above the imports by Vitest, so this runs first.
vi.mock('../../src/config/firebase', () => {
  const verifyIdToken = vi.fn();
  // Vitest mocks are ES modules: the default import needs an explicit `default` key
  return { default: { auth: () => ({ verifyIdToken }) } };
});

import type { Mock } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { db } from '../helpers/db';
import firebase from '../../src/config/firebase';

// Typed as a bare mock: the fixtures below are partial DecodedIdToken payloads.
const verifyIdToken = firebase.auth().verifyIdToken as Mock;

const TEST_EMAILS = ['newuser@example.com', 'existing@example.com', 'switcher@example.com'];

afterEach(async () => {
  verifyIdToken.mockReset();
  await db('users').whereIn('email', TEST_EMAILS).delete();
});

afterAll(async () => {
  await db.destroy();
});

describe('POST /api/v1/auth/login', () => {
  it('creates a new user and returns a JWT on first login', async () => {
    verifyIdToken.mockResolvedValue({
      uid: 'firebase-uid-new',
      email: 'newuser@example.com',
      name: 'New User',
      picture: 'https://example.com/avatar.jpg',
      firebase: { sign_in_provider: 'google.com' },
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ token: 'fake-firebase-token' });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.user.email).toBe('newuser@example.com');
    expect(res.body.data.user.name).toBe('New User');
    expect(res.body.data.user.badge_level).toBe('rookie');
    expect(res.body.data.user.credit_count).toBe(0);
    expect(res.body.data.user.avatar_url).toBe('https://example.com/avatar.jpg');

    const dbUser = await db('users').where({ firebase_uid: 'firebase-uid-new' }).first();
    expect(dbUser).toBeDefined();
    expect(dbUser.auth_provider).toBe('google');
  });

  it('returns the existing user (no duplicate) on subsequent logins', async () => {
    const [existing] = await db('users')
      .insert({
        name: 'Existing User',
        email: 'existing@example.com',
        firebase_uid: 'firebase-uid-existing',
        auth_provider: 'google',
      })
      .returning('id');

    verifyIdToken.mockResolvedValue({
      uid: 'firebase-uid-existing',
      email: 'existing@example.com',
      name: 'Existing User',
      firebase: { sign_in_provider: 'google.com' },
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ token: 'fake-firebase-token' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.id).toBe(existing.id);

    const count = await db('users')
      .where({ firebase_uid: 'firebase-uid-existing' })
      .count('id as n')
      .first();
    expect(Number(count.n)).toBe(1);
  });

  it('links an existing account when the same email logs in with a different provider', async () => {
    const [existing] = await db('users')
      .insert({
        name: 'Switcher User',
        email: 'switcher@example.com',
        firebase_uid: 'firebase-uid-google',
        auth_provider: 'google',
      })
      .returning('id');

    verifyIdToken.mockResolvedValue({
      uid: 'firebase-uid-apple',
      email: 'switcher@example.com',
      name: 'Switcher User',
      firebase: { sign_in_provider: 'apple.com' },
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ token: 'fake-firebase-token' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.id).toBe(existing.id);
    expect(res.body.data.user.email).toBe('switcher@example.com');

    const dbUser = await db('users').where({ id: existing.id }).first();
    expect(dbUser.firebase_uid).toBe('firebase-uid-apple');
    expect(dbUser.auth_provider).toBe('apple');

    const count = await db('users').where({ email: 'switcher@example.com' }).count('id as n').first();
    expect(Number(count.n)).toBe(1);
  });

  it('returns 422 when token field is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('Validation failed');
  });

  it('returns 401 when Firebase rejects the token', async () => {
    verifyIdToken.mockRejectedValue(
      Object.assign(new Error('Token expired'), { code: 'auth/id-token-expired' })
    );

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ token: 'expired-token' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid or expired Firebase token');
  });
});
