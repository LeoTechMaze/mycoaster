import { Response } from 'express';

interface SuccessOptions {
  status?: number;
  meta?: object;
}

export function success(res: Response, data: unknown, { status = 200, meta }: SuccessOptions = {}) {
  const body: { data: unknown; meta?: object } = { data };
  if (meta !== undefined) body.meta = meta;
  return res.status(status).json(body);
}
