import { z } from 'zod';

export const CoasterSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export type Coaster = z.infer<typeof CoasterSchema>;
