/**
 * Zod validation middleware factory.
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} [source='body']
 */
function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      // formErrors holds schema-level errors (e.g. cross-field .refine());
      // fieldErrors holds per-field errors. Serialize both so refine messages
      // aren't lost behind a generic 422.
      const { fieldErrors, formErrors } = result.error.flatten();
      const err = new Error(formErrors[0] || 'Validation failed');
      err.status = 422;
      err.details = { fieldErrors, formErrors };
      return next(err);
    }
    req.validated = result.data;
    next();
  };
}

module.exports = { validate };
