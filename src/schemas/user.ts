import { z } from 'zod';

export const updateUserSchema = z.object({
  display_name: z.string().optional(),
  bio: z.string().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;