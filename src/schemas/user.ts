import { z } from 'zod';

export const UpdateUserSchema = z.object({
  display_name: z.string().min(2).max(30).optional(),
  bio: z.string().max(160).optional(),
});