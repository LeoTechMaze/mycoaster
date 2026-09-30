import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Zod validation middleware factory.
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      // formErrors holds schema-level errors (e.g. cross-field .refine());
      // fieldErrors holds per-field errors. Serialize both so refine messages
      // aren't lost behind a generic 422.
      const { fieldErrors, formErrors } = result.error.flatten();
      const err: any = new Error(formErrors[0] || 'Validation failed');
      err.status = 422;
      err.details = { fieldErrors, formErrors };
      return next(err);
    }
    req.validated = result.data;
    next();
  };
}
