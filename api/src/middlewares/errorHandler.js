// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const isDev = process.env.NODE_ENV === 'development';

  console.error('[Error]', err);

  // Operational errors (set err.status in route handlers / validate middleware)
  if (err.status || err.statusCode) {
    return res.status(err.status || err.statusCode).json({
      error: err.message,
      ...(err.details && { details: err.details }),
      ...(isDev && { stack: err.stack }),
    });
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Conflict: resource already exists' });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Invalid reference: related resource not found' });
  }

  // PostgreSQL invalid input syntax (e.g. non-UUID passed as UUID column)
  if (err.code === '22P02') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  // Default: 500
  return res.status(500).json({
    error: 'Internal server error',
    ...(isDev && { message: err.message, stack: err.stack }),
  });
}

module.exports = errorHandler;
