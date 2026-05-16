import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export type User = z.infer<typeof userSchema>;