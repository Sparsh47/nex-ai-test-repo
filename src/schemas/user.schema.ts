import { z } from 'zod';

export const userPatchSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  bio: z.string().max(500).optional()
});