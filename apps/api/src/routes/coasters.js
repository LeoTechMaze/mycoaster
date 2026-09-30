const { Router } = require('express');
const db = require('../config/database');
const { validate } = require('../middlewares/validate');
const { success } = require('../utils/response');
const { listQuerySchema, isGeoSearch, haversine, avgRatingSql } = require('../utils/search');
const { uuidParams } = require('../utils/schemas');

const router = Router();

const COASTER_DETAIL_FIELDS = ['id', 'name', 'status', 'rcdb_id', 'park_id', 'ai_summary', 'synced_at'];
// Aliased with a _park_ prefix so they never collide with coaster columns
// (a plain park_ prefix turns parks.id into park_id, clobbering coasters.park_id)
const PARK_EMBED_FIELDS     = ['id', 'name', 'country', 'city', 'latitude', 'longitude', 'status'];

const HAVERSINE = haversine('parks.latitude', 'parks.longitude');

const LIST_COLS = [
  'coasters.id', 'coasters.name', 'coasters.status',
  'coasters.rcdb_id', 'coasters.park_id', 'coasters.ai_summary',
  'parks.name AS park_name', 'parks.country', 'parks.city',
];

// GET / must be declared before GET /:id
router.get('/', validate(listQuerySchema, 'query'), async (req, res) => {
  const { lat, lng, radius, country, city } = req.validated;

  if (isGeoSearch(req.validated)) {
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

router.get('/:id', validate(uuidParams('id'), 'params'), async (req, res) => {
  const row = await db('coasters')
    .select([
      ...COASTER_DETAIL_FIELDS.map(f => `coasters.${f}`),
      db.raw(avgRatingSql('coaster', 'coaster_id = coasters.id')),
      ...PARK_EMBED_FIELDS.map(f => `parks.${f} AS _park_${f}`),
    ])
    .join('parks', 'coasters.park_id', 'parks.id')
    .where('coasters.id', req.validated.id)
    .first();

  if (!row) {
    const err = new Error('Coaster not found');
    err.status = 404;
    throw err;
  }

  const park = {};
  for (const f of PARK_EMBED_FIELDS) {
    park[f] = row[`_park_${f}`];
    delete row[`_park_${f}`];
  }

  return success(res, { ...row, park });
});

module.exports = router;
