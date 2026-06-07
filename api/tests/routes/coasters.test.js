const request = require('supertest');
const app = require('../../src/app');
const { db, truncate } = require('../helpers/db');

const CW_ID         = '10000000-0000-0000-0000-000000004539';
const HH_ID         = '10000000-0000-0000-0000-000000004947';
const CW_COASTER_ID = '20000000-0000-0000-0000-000000000001';

beforeEach(async () => {
  await db('parks').insert([
    {
      id: CW_ID,
      name: "Canada's Wonderland",
      country: 'Canada',
      city: 'Vaughan',
      latitude: 43.843,
      longitude: -79.537,
      rcdb_id: 'test-cw',
      status: 'operating',
      synced_at: new Date(),
    },
    {
      id: HH_ID,
      name: 'Hopi Hari',
      country: 'Brazil',
      city: 'Vinhedo',
      latitude: -23.097,
      longitude: -46.946,
      rcdb_id: 'test-hh',
      status: 'operating',
      synced_at: new Date(),
    },
  ]);
  await db('coasters').insert({
    id: CW_COASTER_ID,
    park_id: CW_ID,
    name: 'Leviathan',
    rcdb_id: 'test-leviathan',
    status: 'operating',
    synced_at: new Date(),
  });
});

afterEach(async () => {
  await truncate('coasters', 'parks');
});

afterAll(async () => {
  await db.destroy();
});

describe('GET /api/v1/coasters — geo mode', () => {
  it('returns coasters within radius of parent park with distance_km', async () => {
    const res = await request(app)
      .get('/api/v1/coasters?lat=43.843&lng=-79.537&radius=10');

    expect(res.status).toBe(200);
    const levi = res.body.data.find(c => c.id === CW_COASTER_ID);
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
});

describe('GET /api/v1/coasters/:id', () => {
  it('returns coaster with avg_rating and nested park object', async () => {
    const res = await request(app).get(`/api/v1/coasters/${CW_COASTER_ID}`);

    expect(res.status).toBe(200);
    const c = res.body.data;
    expect(c.id).toBe(CW_COASTER_ID);
    expect(c.name).toBe('Leviathan');
    expect(c.avg_rating).toBeNull();
    expect(c.park).toBeDefined();
    expect(c.park.id).toBe(CW_ID);
    expect(c.park.name).toBe("Canada's Wonderland");
  });

  it('returns 404 for unknown coaster', async () => {
    const res = await request(app).get('/api/v1/coasters/00000000-0000-0000-0000-000000000000');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Coaster not found');
  });

  it('returns 400 for non-UUID id', async () => {
    const res = await request(app).get('/api/v1/coasters/not-a-uuid');
    expect(res.status).toBe(400);
  });
});
