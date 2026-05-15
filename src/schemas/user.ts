import { z } from 'zod';

export const UserPatchSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  status: z.enum(['active', 'inactive']).optional()
});