const request = require('supertest');
const app = require('../../src/app');
const { db } = require('../helpers/db');

const USER_ID         = '30000000-0000-0000-0000-000000000001';
const CW_ID           = '10000000-0000-0000-0000-000000004539';
const HH_ID           = '10000000-0000-0000-0000-000000004947';
const CW_LEVIATHAN_ID = '20000000-0000-0000-0000-000000000001';

afterAll(async () => {
  await db.destroy();
});

describe('GET /api/v1/coasters — geo mode', () => {
  it('returns coasters within radius of parent park with distance_km', async () => {
    const res = await request(app)
      .get('/api/v1/coasters?lat=43.843&lng=-79.537&radius=10');

    expect(res.status).toBe(200);
    const levi = res.body.data.find(c => c.id === CW_LEVIATHAN_ID);
    expect(levi).toBeDefined();
    expect(typeof levi.distance_km).toBe('number');
  });

  it('excludes coasters from parks outside the radius', async () => {
    const res = await request(app)
      .get('/api/v1/coasters?lat=43.843&lng=-79.537&radius=10');

    expect(res.body.data.map(c => c.park_id)).not.toContain(HH_ID);
  });
});

describe('GET /api/v1/coasters — text mode', () => {
  it('filters coasters by parent park country (case-insensitive)', async () => {
    const res = await request(app).get('/api/v1/coasters?country=brazil');

    expect(res.status).toBe(200);
    expect(res.body.data.every(c => c.park_id === HH_ID)).toBe(true);
  });
});

describe('GET /api/v1/coasters — validation', () => {
  it('returns 422 when no query params provided', async () => {
    const res = await request(app).get('/api/v1/coasters');
    expect(res.status).toBe(422);
  });

  it('falls back to text search when geo params are incomplete but country is present', async () => {
    const res = await request(app).get('/api/v1/coasters?lat=43.843&country=Brazil');

    expect(res.status).toBe(200);
    expect(res.body.data.every(c => c.park_id === HH_ID)).toBe(true);
  });
});

describe('GET /api/v1/coasters/:id', () => {
  it('returns coaster with avg_rating and nested park object', async () => {
    const res = await request(app).get(`/api/v1/coasters/${CW_LEVIATHAN_ID}`);

    expect(res.status).toBe(200);
    const c = res.body.data;
    expect(c.id).toBe(CW_LEVIATHAN_ID);
    expect(c.name).toBe('Leviathan');
    expect(c.park_id).toBe(CW_ID);
    expect(c.avg_rating).toBeNull();
    expect(c.park).toBeDefined();
    expect(c.park.id).toBe(CW_ID);
    expect(c.park.name).toBe("Canada's Wonderland");
  });

  it('returns avg_rating as a number when reviews exist', async () => {
    await db('reviews').insert({
      user_id: USER_ID,
      coaster_id: CW_LEVIATHAN_ID,
      target_type: 'coaster',
      rating: 5,
    });

    try {
      const res = await request(app).get(`/api/v1/coasters/${CW_LEVIATHAN_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.data.avg_rating).toBe(5);
    } finally {
      await db('reviews').where({ user_id: USER_ID, coaster_id: CW_LEVIATHAN_ID }).delete();
    }
  });

  it('returns 404 for unknown coaster', async () => {
    const res = await request(app).get('/api/v1/coasters/00000000-0000-0000-0000-000000000000');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Coaster not found');
  });

  it('returns 422 for non-UUID id', async () => {
    const res = await request(app).get('/api/v1/coasters/not-a-uuid');
    expect(res.status).toBe(422);
  });
});
