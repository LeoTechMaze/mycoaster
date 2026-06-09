const { Router } = require('express');
const { z } = require('zod');
const db = require('../config/database');
const { validate } = require('../middlewares/validate');
const { success } = require('../utils/response');

const router = Router();

const COASTER_DETAIL_FIELDS = ['id', 'name', 'status', 'rcdb_id', 'park_id', 'ai_summary', 'synced_at'];
const PARK_EMBED_FIELDS     = ['id', 'name', 'country', 'city', 'latitude', 'longitude', 'status'];

const listQuerySchema = z.object({
  lat:     z.coerce.number().min(-90).max(90).optional(),
  lng:     z.coerce.number().min(-180).max(180).optional(),
  radius:  z.coerce.number().positive().max(500).optional(),
  country: z.string().min(1).optional(),
  city:    z.string().min(1).optional(),
}).refine(
  d => (d.lat != null && d.lng != null && d.radius != null) || d.country != null || d.city != null,
  { message: 'Provide lat+lng+radius for geo search, or country/city for text search' }
);

const HAVERSINE = `(6371 * acos(
  LEAST(1.0,
    cos(radians(:lat)) * cos(radians(parks.latitude)) *
    cos(radians(parks.longitude) - radians(:lng)) +
    sin(radians(:lat)) * sin(radians(parks.latitude))
  )
))`;

const LIST_COLS = [
  'coasters.id', 'coasters.name', 'coasters.status',
  'coasters.rcdb_id', 'coasters.park_id', 'coasters.ai_summary',
  'parks.name AS park_name', 'parks.country', 'parks.city',
];

// GET / must be declared before GET /:id
router.get('/', validate(listQuerySchema, 'query'), async (req, res) => {
  const { lat, lng, radius, country, city } = req.validated;

  if (lat != null) {
    const { rows } = await db.raw(
      `SELECT ${LIST_COLS.join(', ')}, ${HAVERSINE} AS distance_km
       FROM coasters
       JOIN parks ON coasters.park_id = parks.id
       WHERE ${HAVERSINE} <= :radius
       ORDER BY distance_km ASC`,
      { lat, lng, radius }
    );
    return success(res, rows);
  }

  let query = db('coasters').select(LIST_COLS).join('parks', 'coasters.park_id', 'parks.id');
  if (country) query = query.whereRaw('lower(parks.country) = lower(?)', [country]);
  if (city)    query = query.whereRaw('lower(parks.city) = lower(?)', [city]);
  return success(res, await query.orderBy('coasters.name'));
});

router.get('/:id', async (req, res) => {
  const row = await db('coasters')
    .select([
      ...COASTER_DETAIL_FIELDS.map(f => `coasters.${f}`),
      db.raw(
        `(SELECT ROUND(AVG(rating)::numeric, 1)
          FROM reviews
          WHERE coaster_id = coasters.id AND target_type = 'coaster') AS avg_rating`
      ),
      ...PARK_EMBED_FIELDS.map(f => `parks.${f} AS park_${f}`),
    ])
    .join('parks', 'coasters.park_id', 'parks.id')
    .where('coasters.id', req.params.id)
    .first();

  if (!row) {
    const err = new Error('Coaster not found');
    err.status = 404;
    throw err;
  }

  const park = {};
  for (const f of PARK_EMBED_FIELDS) {
    park[f] = row[`park_${f}`];
    delete row[`park_${f}`];
  }

  return success(res, { ...row, park });
});

module.exports = router;
