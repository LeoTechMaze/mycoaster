const request = require('supertest');
const app = require('../../src/app');
const { db } = require('../helpers/db');
const { generateToken } = require('../helpers/auth');

const USER_ID         = '30000000-0000-0000-0000-000000000001';
const USER_EMAIL      = 'test@mycoaster.app';
const CW_LEVIATHAN_ID = '20000000-0000-0000-0000-000000000001';

let authToken;

beforeEach(async () => {
  await db('user_credits').where({ user_id: USER_ID }).delete();
  await db('users').where({ id: USER_ID }).update({ credit_count: 0, badge_level: 'rookie' });
  authToken = generateToken({ id: USER_ID, email: USER_EMAIL });
});

afterAll(async () => {
  await db.destroy();
});

describe('POST /api/v1/credits', () => {
  it('returns 201 with the created credit', async () => {
    const res = await request(app)
      .post('/api/v1/credits')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ coaster_id: CW_LEVIATHAN_ID });

    expect(res.status).toBe(201);
    expect(res.body.data.coaster_id).toBe(CW_LEVIATHAN_ID);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.ridden_at).toBeDefined();
  });

  it('increments credit_count on the user', async () => {
    await request(app)
      .post('/api/v1/credits')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ coaster_id: CW_LEVIATHAN_ID });

    const user = await db('users').where({ id: USER_ID }).first('credit_count');
    expect(user.credit_count).toBe(1);
  });

  it('returns 409 on duplicate', async () => {
    await request(app)
      .post('/api/v1/credits')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ coaster_id: CW_LEVIATHAN_ID });

    const res = await request(app)
      .post('/api/v1/credits')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ coaster_id: CW_LEVIATHAN_ID });

    expect(res.status).toBe(409);
  });

  it('returns 404 when coaster does not exist', async () => {
    const res = await request(app)
      .post('/api/v1/credits')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ coaster_id: '00000000-0000-0000-0000-000000000000' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Coaster not found');
  });

  it('returns 422 for non-UUID coaster_id', async () => {
    const res = await request(app)
      .post('/api/v1/credits')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ coaster_id: 'not-a-uuid' });

    expect(res.status).toBe(422);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/v1/credits')
      .send({ coaster_id: CW_LEVIATHAN_ID });

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/v1/credits/:coaster_id', () => {
  beforeEach(async () => {
    await db('user_credits').insert({
      user_id: USER_ID,
      coaster_id: CW_LEVIATHAN_ID,
      ridden_at: new Date(),
    });
  });

  it('returns 204 and removes the credit', async () => {
    const res = await request(app)
      .delete(`/api/v1/credits/${CW_LEVIATHAN_ID}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(204);
    const row = await db('user_credits')
      .where({ user_id: USER_ID, coaster_id: CW_LEVIATHAN_ID })
      .first();
    expect(row).toBeUndefined();
  });

  it('decrements credit_count on the user', async () => {
    await request(app)
      .delete(`/api/v1/credits/${CW_LEVIATHAN_ID}`)
      .set('Authorization', `Bearer ${authToken}`);

    const user = await db('users').where({ id: USER_ID }).first('credit_count');
    expect(user.credit_count).toBe(0);
  });

  it('returns 404 when the credit does not exist', async () => {
    await db('user_credits').where({ user_id: USER_ID, coaster_id: CW_LEVIATHAN_ID }).delete();

    const res = await request(app)
      .delete(`/api/v1/credits/${CW_LEVIATHAN_ID}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Credit not found');
  });

  it('returns 400 for a non-UUID coaster_id', async () => {
    const res = await request(app)
      .delete('/api/v1/credits/not-a-uuid')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(400);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .delete(`/api/v1/credits/${CW_LEVIATHAN_ID}`);

    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/credits/me', () => {
  it('returns empty array when no credits exist', async () => {
    const res = await request(app)
      .get('/api/v1/credits/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns credits with coaster_name and park_name', async () => {
    await db('user_credits').insert({
      user_id: USER_ID,
      coaster_id: CW_LEVIATHAN_ID,
      ridden_at: new Date(),
    });

    const res = await request(app)
      .get('/api/v1/credits/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    const credit = res.body.data[0];
    expect(credit.coaster_id).toBe(CW_LEVIATHAN_ID);
    expect(credit.coaster_name).toBe('Leviathan');
    expect(credit.park_id).toBeDefined();
    expect(credit.park_name).toBe("Canada's Wonderland");
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app).get('/api/v1/credits/me');

    expect(res.status).toBe(401);
  });
});
