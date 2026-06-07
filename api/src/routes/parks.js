const { Router } = require('express');
const { z } = require('zod');
const db = require('../config/database');
const { validate } = require('../middlewares/validate');
const { success } = require('../utils/response');

const router = Router();

const PARK_LIST_FIELDS   = ['id', 'name', 'country', 'city', 'latitude', 'longitude', 'status', 'ai_summary'];
const PARK_DETAIL_FIELDS = [...PARK_LIST_FIELDS, 'synced_at'];
const COASTER_LIST_FIELDS = ['id', 'name', 'status', 'rcdb_id', 'park_id', 'ai_summary'];

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
    cos(radians(:lat)) * cos(radians(latitude)) *
    cos(radians(longitude) - radians(:lng)) +
    sin(radians(:lat)) * sin(radians(latitude))
  )
))`;

router.get('/', validate(listQuerySchema, 'query'), async (req, res) => {
  const { lat, lng, radius, country, city } = req.validated;

  if (lat != null) {
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

router.get('/:id/coasters', async (req, res) => {
  const park = await db('parks').where({ id: req.params.id }).first('id');
  if (!park) {
    const err = new Error('Park not found');
    err.status = 404;
    throw err;
  }

  const coasters = await db('coasters')
    .select([
      ...COASTER_LIST_FIELDS,
      db.raw(
        `(SELECT ROUND(AVG(rating)::numeric, 1)
          FROM reviews
          WHERE coaster_id = coasters.id AND target_type = 'coaster') AS avg_rating`
      ),
    ])
    .where({ park_id: req.params.id })
    .orderBy('name');

  return success(res, coasters);
});

router.get('/:id', async (req, res) => {
  const row = await db('parks')
    .select([
      ...PARK_DETAIL_FIELDS,
      db.raw(
        `(SELECT ROUND(AVG(rating)::numeric, 1)
          FROM reviews
          WHERE park_id = parks.id AND target_type = 'park') AS avg_rating`
      ),
    ])
    .where({ id: req.params.id })
    .first();

  if (!row) {
    const err = new Error('Park not found');
    err.status = 404;
    throw err;
  }

  return success(res, row);
});

module.exports = router;
