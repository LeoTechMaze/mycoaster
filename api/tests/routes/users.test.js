const request = require('supertest');
const app = require('../../src/app');
const { db } = require('../helpers/db');
const { generateToken } = require('../helpers/auth');

const USER_ID    = '30000000-0000-0000-0000-000000000001';
const USER_EMAIL = 'test@mycoaster.app';

// Fields this suite asserts on — reset to seed values before each test so
// the suite never depends on what other suites left on the shared seed user
const USER_SEED_STATE = {
  name: 'Test User',
  avatar_url: null,
  instagram_url: null,
  tiktok_url: null,
  youtube_url: null,
  credit_count: 0,
  badge_level: 'rookie',
};

let authToken;

beforeEach(async () => {
  await db('users').where({ id: USER_ID }).update(USER_SEED_STATE);
  authToken = generateToken({ id: USER_ID, email: USER_EMAIL });
});

afterAll(async () => {
  await db.destroy();
});

describe('GET /api/v1/users/:id', () => {
  it('returns the public profile for an existing user', async () => {
    const res = await request(app).get(`/api/v1/users/${USER_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(USER_ID);
    expect(res.body.data.name).toBe('Test User');
    expect(res.body.data.badge_level).toBe('rookie');
    expect(res.body.data.credit_count).toBe(0);
    // email must not appear in the public profile
    expect(res.body.data.email).toBeUndefined();
  });

  it('returns 404 for a non-existent user', async () => {
    const res = await request(app).get('/api/v1/users/00000000-0000-0000-0000-000000000000');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });

  it('returns 400 for a non-UUID id', async () => {
    const res = await request(app).get('/api/v1/users/not-a-uuid');

    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/v1/users/me', () => {
  it('updates name and social link', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Updated Name', instagram_url: 'https://instagram.com/myprofile' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Name');
    expect(res.body.data.instagram_url).toBe('https://instagram.com/myprofile');
  });

  it('persists the update in the DB', async () => {
    await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Persisted Name' });

    const dbUser = await db('users').where({ id: USER_ID }).first();
    expect(dbUser.name).toBe('Persisted Name');
  });

  it('returns 401 without an auth token', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me')
      .send({ name: 'No Auth' });

    expect(res.status).toBe(401);
  });

  it('returns 422 when no fields are provided', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(res.status).toBe(422);
  });

  it('returns 422 for an invalid URL', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ instagram_url: 'not-a-url' });

    expect(res.status).toBe(422);
  });

  it('returns 422 for an empty name string', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: '' });

    expect(res.status).toBe(422);
  });
});
