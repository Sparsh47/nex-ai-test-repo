import { z } from 'zod';

export const patchUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional()
});