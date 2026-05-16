import { z } from 'zod';

export const userPatchSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  age: z.number().positive().optional()
});

export type UserPatchBody = z.infer<typeof userPatchSchema>;