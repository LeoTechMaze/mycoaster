const request = require('supertest');
const app = require('../../src/app');
const { db } = require('../helpers/db');
const { generateToken } = require('../helpers/auth');

const USER_ID         = '30000000-0000-0000-0000-000000000001';
const USER_EMAIL      = 'test@mycoaster.app';
const OTHER_USER_ID   = '30000000-0000-0000-0000-000000000002';
const CW_ID           = '10000000-0000-0000-0000-000000004539';
const CW_LEVIATHAN_ID = '20000000-0000-0000-0000-000000000001';
const MISSING_ID      = '00000000-0000-0000-0000-000000000000';

const OTHER_USER = {
  id: OTHER_USER_ID,
  name: 'Other User',
  email: 'other@mycoaster.app',
  firebase_uid: 'firebase-seed-user-002',
  auth_provider: 'google',
};

// Extra reviewers so a single target can hold several reviews (one review per
// user per target), used by the pagination suite.
const PAGE_USERS = [1, 2, 3, 4, 5].map((n) => ({
  id: `30000000-0000-0000-0000-0000000000a${n}`,
  name: `Page User ${n}`,
  email: `page${n}@mycoaster.app`,
  firebase_uid: `firebase-page-user-${n}`,
  auth_provider: 'google',
}));

let authToken;

beforeAll(async () => {
  await db('users').insert([OTHER_USER, ...PAGE_USERS]).onConflict('id').ignore();
});

beforeEach(async () => {
  await db('reviews').del();
  authToken = generateToken({ id: USER_ID, email: USER_EMAIL });
});

afterAll(async () => {
  await db('reviews').del();
  await db('users')
    .whereIn('id', [OTHER_USER_ID, ...PAGE_USERS.map((u) => u.id)])
    .del();
  await db.destroy();
});

describe('POST /api/v1/reviews', () => {
  it('creates a coaster review and returns 201', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ target_type: 'coaster', coaster_id: CW_LEVIATHAN_ID, rating: 5, comment: 'Insane' });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.target_type).toBe('coaster');
    expect(res.body.data.coaster_id).toBe(CW_LEVIATHAN_ID);
    expect(res.body.data.park_id).toBeNull();
    expect(res.body.data.rating).toBe(5);
    expect(res.body.data.comment).toBe('Insane');
  });

  it('creates a park review with coaster_id null', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ target_type: 'park', park_id: CW_ID, rating: 4 });

    expect(res.status).toBe(201);
    expect(res.body.data.target_type).toBe('park');
    expect(res.body.data.park_id).toBe(CW_ID);
    expect(res.body.data.coaster_id).toBeNull();
    expect(res.body.data.comment).toBeNull();
  });

  it('returns 422 when target_type does not match the provided id', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ target_type: 'coaster', park_id: CW_ID, rating: 3 });

    expect(res.status).toBe(422);
  });

  it('returns 422 when both ids are provided', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ target_type: 'coaster', coaster_id: CW_LEVIATHAN_ID, park_id: CW_ID, rating: 3 });

    expect(res.status).toBe(422);
  });

  it('returns 422 for rating out of range', async () => {
    const low = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ target_type: 'coaster', coaster_id: CW_LEVIATHAN_ID, rating: 0 });
    expect(low.status).toBe(422);

    const high = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ target_type: 'coaster', coaster_id: CW_LEVIATHAN_ID, rating: 6 });
    expect(high.status).toBe(422);
  });

  it('returns 422 for a non-UUID coaster_id', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ target_type: 'coaster', coaster_id: 'not-a-uuid', rating: 3 });

    expect(res.status).toBe(422);
  });

  it('returns 404 when the coaster does not exist', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ target_type: 'coaster', coaster_id: MISSING_ID, rating: 3 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Coaster not found');
  });

  it('returns 409 on a duplicate review for the same target', async () => {
    const payload = { target_type: 'coaster', coaster_id: CW_LEVIATHAN_ID, rating: 5 };
    await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

    expect(res.status).toBe(409);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .send({ target_type: 'coaster', coaster_id: CW_LEVIATHAN_ID, rating: 5 });

    expect(res.status).toBe(401);
  });
});

describe('PUT /api/v1/reviews/:id', () => {
  let reviewId;

  beforeEach(async () => {
    const [row] = await db('reviews')
      .insert({
        user_id: USER_ID,
        target_type: 'coaster',
        coaster_id: CW_LEVIATHAN_ID,
        rating: 3,
        comment: 'Was ok',
      })
      .returning(['id', 'updated_at']);
    reviewId = row.id;
  });

  it('updates rating and comment and advances updated_at', async () => {
    const before = await db('reviews').where({ id: reviewId }).first('updated_at');

    const res = await request(app)
      .put(`/api/v1/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ rating: 5, comment: 'Re-rode it, incredible' });

    expect(res.status).toBe(200);
    expect(res.body.data.rating).toBe(5);
    expect(res.body.data.comment).toBe('Re-rode it, incredible');
    expect(new Date(res.body.data.updated_at).getTime())
      .toBeGreaterThanOrEqual(new Date(before.updated_at).getTime());
  });

  it('returns 422 for a non-UUID id (params gate)', async () => {
    const res = await request(app)
      .put('/api/v1/reviews/not-a-uuid')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ rating: 4 });

    expect(res.status).toBe(422);
  });

  it('returns 422 for an empty body', async () => {
    const res = await request(app)
      .put(`/api/v1/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(res.status).toBe(422);
  });

  it('returns 404 for a missing review', async () => {
    const res = await request(app)
      .put(`/api/v1/reviews/${MISSING_ID}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ rating: 4 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Review not found');
  });

  it("returns 403 when editing another user's review", async () => {
    const otherToken = generateToken({ id: OTHER_USER_ID, email: OTHER_USER.email });
    const res = await request(app)
      .put(`/api/v1/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ rating: 1 });

    expect(res.status).toBe(403);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .put(`/api/v1/reviews/${reviewId}`)
      .send({ rating: 4 });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/reviews/coaster/:id', () => {
  it('returns reviews newest-first with reviewer info', async () => {
    await db('reviews').insert({
      user_id: USER_ID,
      target_type: 'coaster',
      coaster_id: CW_LEVIATHAN_ID,
      rating: 5,
      comment: 'Top tier',
    });

    const res = await request(app).get(`/api/v1/reviews/coaster/${CW_LEVIATHAN_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    const review = res.body.data[0];
    expect(review.rating).toBe(5);
    expect(review.user_name).toBe('Test User');
    expect(review.user_id).toBe(USER_ID);
  });

  it('returns an empty array when the coaster has no reviews', async () => {
    const res = await request(app).get(`/api/v1/reviews/coaster/${CW_LEVIATHAN_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns 404 when the coaster does not exist', async () => {
    const res = await request(app).get(`/api/v1/reviews/coaster/${MISSING_ID}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Coaster not found');
  });

  it('returns 422 for a non-UUID id', async () => {
    const res = await request(app).get('/api/v1/reviews/coaster/not-a-uuid');

    expect(res.status).toBe(422);
  });
});

describe('GET /api/v1/reviews/park/:id', () => {
  it('returns reviews for a park', async () => {
    await db('reviews').insert({
      user_id: USER_ID,
      target_type: 'park',
      park_id: CW_ID,
      rating: 4,
      comment: 'Great day',
    });

    const res = await request(app).get(`/api/v1/reviews/park/${CW_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].rating).toBe(4);
    expect(res.body.data[0].user_name).toBe('Test User');
  });

  it('returns 404 when the park does not exist', async () => {
    const res = await request(app).get(`/api/v1/reviews/park/${MISSING_ID}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Park not found');
  });
});

describe('GET /api/v1/reviews/coaster/:id — pagination', () => {
  const BASE_TIME = new Date('2026-01-01T00:00:00Z').getTime();

  // 5 reviews on one coaster, created_at staggered so ordering is deterministic:
  // ratings 1..5, newest (rating 5) first under created_at desc.
  beforeEach(async () => {
    await db('reviews').insert(
      PAGE_USERS.map((u, i) => ({
        user_id: u.id,
        target_type: 'coaster',
        coaster_id: CW_LEVIATHAN_ID,
        rating: i + 1,
        comment: `r${i + 1}`,
        created_at: new Date(BASE_TIME + i * 60000),
      }))
    );
  });

  const get = (qs = '') =>
    request(app).get(`/api/v1/reviews/coaster/${CW_LEVIATHAN_ID}${qs}`);

  it('returns all reviews newest-first with a null next_cursor by default', async () => {
    const res = await get();

    expect(res.status).toBe(200);
    expect(res.body.data.map((r) => r.rating)).toEqual([5, 4, 3, 2, 1]);
    expect(res.body.meta.next_cursor).toBeNull();
  });

  it('caps results at limit and returns a next_cursor', async () => {
    const res = await get('?limit=2');

    expect(res.status).toBe(200);
    expect(res.body.data.map((r) => r.rating)).toEqual([5, 4]);
    expect(res.body.meta.next_cursor).toBeTruthy();
  });

  it('walks the full set via the cursor with no overlap', async () => {
    const p1 = await get('?limit=2');
    const p2 = await get(`?limit=2&cursor=${encodeURIComponent(p1.body.meta.next_cursor)}`);
    expect(p2.body.data.map((r) => r.rating)).toEqual([3, 2]);
    expect(p2.body.meta.next_cursor).toBeTruthy();

    const p3 = await get(`?limit=2&cursor=${encodeURIComponent(p2.body.meta.next_cursor)}`);
    expect(p3.body.data.map((r) => r.rating)).toEqual([1]);
    expect(p3.body.meta.next_cursor).toBeNull();
  });

  it('returns 422 for an invalid cursor', async () => {
    const res = await get('?cursor=not-a-valid-cursor');
    expect(res.status).toBe(422);
  });

  it('returns 422 for a limit out of range or non-numeric', async () => {
    for (const limit of ['0', '101', 'abc']) {
      const res = await get(`?limit=${limit}`);
      expect(res.status).toBe(422);
    }
  });
});
