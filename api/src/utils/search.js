const { z } = require('zod');

// Shared by the /parks and /coasters list endpoints:
// geo mode (lat+lng+radius) or text mode (country/city)
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

// Must require all three geo params — a looser check (lat only) lets a mixed
// request like ?lat=43.8&country=Canada reach db.raw with undefined bindings
const isGeoSearch = ({ lat, lng, radius }) =>
  lat != null && lng != null && radius != null;

// Distance in km from the :lat/:lng bindings to the given columns
const haversine = (latCol = 'latitude', lngCol = 'longitude') => `(6371 * acos(
  LEAST(1.0,
    cos(radians(:lat)) * cos(radians(${latCol})) *
    cos(radians(${lngCol}) - radians(:lng)) +
    sin(radians(:lat)) * sin(radians(${latCol}))
  )
))`;

// ::float because pg returns NUMERIC as a string
const avgRatingSql = (targetType, fkMatch) =>
  `(SELECT ROUND(AVG(rating)::numeric, 1)::float
    FROM reviews
    WHERE ${fkMatch} AND target_type = '${targetType}') AS avg_rating`;

module.exports = { listQuerySchema, isGeoSearch, haversine, avgRatingSql };
