/**
 * Zod validation middleware factory.
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} [source='body']
 */
function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const err = new Error('Validation failed');
      err.status = 422;
      err.details = result.error.flatten().fieldErrors;
      return next(err);
    }
    req.validated = result.data;
    next();
  };
}

module.exports = { validate };
