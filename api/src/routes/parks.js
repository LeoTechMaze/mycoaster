const { Router } = require('express');
const db = require('../config/database');
const { validate } = require('../middlewares/validate');
const { success } = require('../utils/response');
const { listQuerySchema, isGeoSearch, haversine, avgRatingSql } = require('../utils/search');
const { uuidParams } = require('../utils/schemas');

const router = Router();

const PARK_LIST_FIELDS   = ['id', 'name', 'country', 'city', 'latitude', 'longitude', 'status', 'ai_summary'];
const PARK_DETAIL_FIELDS = [...PARK_LIST_FIELDS, 'synced_at'];
const COASTER_LIST_FIELDS = ['id', 'name', 'status', 'rcdb_id', 'park_id', 'ai_summary'];

const HAVERSINE = haversine('latitude', 'longitude');

router.get('/', validate(listQuerySchema, 'query'), async (req, res) => {
  const { lat, lng, radius, country, city } = req.validated;

  if (isGeoSearch(req.validated)) {
    const { rows } = await db.raw(
      `SELECT ${PARK_LIST_FIELDS.join(', ')}, ${HAVERSINE} AS distance_km
       FROM parks
       WHERE ${HAVERSINE} <= :radius
       ORDER BY distance_km ASC`,
      { lat, lng, radius }
    );
    return success(res, rows);
  }

  let query = db('parks').select(PARK_LIST_FIELDS);
  if (country) query = query.whereRaw('lower(country) = lower(?)', [country]);
  if (city)    query = query.whereRaw('lower(city) = lower(?)', [city]);
  return success(res, await query.orderBy('name'));
});

router.get('/:id/coasters', validate(uuidParams('id'), 'params'), async (req, res) => {
  const { id } = req.validated;

  const park = await db('parks').where({ id }).first('id');
  if (!park) {
    const err = new Error('Park not found');
    err.status = 404;
    throw err;
  }

  // Ratings joined once as a grouped subquery instead of a correlated
  // subquery per coaster row
  const coasters = await db('coasters')
    .select([
      ...COASTER_LIST_FIELDS.map(f => `coasters.${f}`),
      'r.avg_rating',
    ])
    .leftJoin(
      db('reviews')
        .select('coaster_id', db.raw('ROUND(AVG(rating)::numeric, 1)::float AS avg_rating'))
        .where('target_type', 'coaster')
        .groupBy('coaster_id')
        .as('r'),
      'r.coaster_id', 'coasters.id'
    )
    .where('coasters.park_id', id)
    .orderBy('coasters.name');

  return success(res, coasters);
});

router.get('/:id', validate(uuidParams('id'), 'params'), async (req, res) => {
  const row = await db('parks')
    .select([
      ...PARK_DETAIL_FIELDS,
      db.raw(avgRatingSql('park', 'park_id = parks.id')),
    ])
    .where({ id: req.validated.id })
    .first();

  if (!row) {
    const err = new Error('Park not found');
    err.status = 404;
    throw err;
  }

  return success(res, row);
});

module.exports = router;
