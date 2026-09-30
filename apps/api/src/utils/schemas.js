const { z } = require('zod');

// Permissive regex instead of z.string().uuid() — seed fixtures use
// structured UUIDs that fail Zod's strict RFC 4122 check
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const uuid = z.string().regex(UUID_RE, 'Invalid UUID format');

// Schema for :id-style path params, so invalid UUIDs fail validation (422)
// instead of surfacing as a Postgres cast error
const uuidParams = (...names) =>
  z.object(Object.fromEntries(names.map((n) => [n, uuid])));

module.exports = { UUID_RE, uuid, uuidParams };
