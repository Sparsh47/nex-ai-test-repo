import { z } from 'zod';

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional()
});