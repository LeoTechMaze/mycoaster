import { z } from 'zod';
import { uuid } from './uuid';

export const CoasterSchema = z.object({
  id: uuid,
  name: z.string(),
});

export type Coaster = z.infer<typeof CoasterSchema>;
