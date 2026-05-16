import { z } from 'zod';

export const updateUserSchema = z.object({
  display_name: z.string().max(50).optional(),
  bio: z.string().max(160).optional()
});

export type UpdateUser = z.infer<typeof updateUserSchema>;