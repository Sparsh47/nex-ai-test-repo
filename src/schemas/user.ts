import { z } from 'zod';

export const UserUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional()
});