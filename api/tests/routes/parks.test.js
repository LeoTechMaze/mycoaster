const request = require('supertest');
const app = require('../../src/app');
const { db } = require('../helpers/db');

const CW_ID         = '10000000-0000-0000-0000-000000004539';
const HH_ID         = '10000000-0000-0000-0000-000000004947';
const EMPTY_PARK_ID = '10000000-0000-0000-0000-000000000003';
const CW_LEVIATHAN_ID = '20000000-0000-0000-0000-000000000001';

afterAll(async () => {
  await db.destroy();
});

describe('GET /api/v1/parks — geo mode', () => {
  it('returns parks within radius with distance_km', async () => {
    const res = await request(app)
      .get('/api/v1/parks?lat=43.843&lng=-79.537&radius=10');

    expect(res.status).toBe(200);
    const cw = res.body.data.find(p => p.id === CW_ID);
    expect(cw).toBeDefined();
    expect(typeof cw.distance_km).toBe('number');
    expect(cw.distance_km).toBeLessThan(10);
  });

  it('excludes parks outside the radius', async () => {
    const res = await request(app)
      .get('/api/v1/parks?lat=43.843&lng=-79.537&radius=10');

    expect(res.body.data.map(p => p.id)).not.toContain(HH_ID);
  });
});

describe('GET /api/v1/parks — text mode', () => {
  it('filters by country (case-insensitive)', async () => {
    const res = await request(app).get('/api/v1/parks?country=canada');

    expect(res.status).toBe(200);
    expect(res.body.data.some(p => p.id === CW_ID)).toBe(true);
    expect(res.body.data.some(p => p.id === HH_ID)).toBe(false);
  });

  it('filters by city', async () => {
    const res = await request(app).get('/api/v1/parks?city=Vinhedo');

    expect(res.status).toBe(200);
    expect(res.body.data.some(p => p.id === HH_ID)).toBe(true);
  });

  it('applies both country and city filters', async () => {
    const res = await request(app).get('/api/v1/parks?country=Canada&city=Vaughan');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(CW_ID);
  });
});

describe('GET /api/v1/parks — validation', () => {
  it('returns 422 when no query params provided', async () => {
    const res = await request(app).get('/api/v1/parks');
    expect(res.status).toBe(422);
  });

  it('returns 422 when radius is missing from geo params', async () => {
    const res = await request(app).get('/api/v1/parks?lat=43.843&lng=-79.537');
    expect(res.status).toBe(422);
  });

  it('returns 422 for non-numeric lat', async () => {
    const res = await request(app).get('/api/v1/parks?lat=abc&lng=-79.537&radius=50');
    expect(res.status).toBe(422);
  });

  it('returns 422 for radius over 500 km', async () => {
    const res = await request(app).get('/api/v1/parks?lat=43.843&lng=-79.537&radius=600');
    expect(res.status).toBe(422);
  });
});

describe('GET /api/v1/parks/:id', () => {
  it('returns park detail with avg_rating null when no reviews exist', async () => {
    const res = await request(app).get(`/api/v1/parks/${CW_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(CW_ID);
    expect(res.body.data.name).toBe("Canada's Wonderland");
    expect(res.body.data.avg_rating).toBeNull();
  });

  it('returns 404 for unknown UUID', async () => {
    const res = await request(app).get('/api/v1/parks/00000000-0000-0000-0000-000000000000');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Park not found');
  });

  it('returns 400 for a non-UUID id', async () => {
    const res = await request(app).get('/api/v1/parks/not-a-uuid');
    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/parks/:id/coasters', () => {
  it('returns coasters for the park with avg_rating', async () => {
    const res = await request(app).get(`/api/v1/parks/${CW_ID}/coasters`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    const levi = res.body.data.find(c => c.id === CW_LEVIATHAN_ID);
    expect(levi).toBeDefined();
    expect(levi.name).toBe('Leviathan');
    expect(levi.avg_rating).toBeNull();
  });

  it('returns 404 when the park does not exist', async () => {
    const res = await request(app).get('/api/v1/parks/00000000-0000-0000-0000-000000000000/coasters');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Park not found');
  });

  it('returns empty array for a park with no coasters', async () => {
    const res = await request(app).get(`/api/v1/parks/${EMPTY_PARK_ID}/coasters`);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});
