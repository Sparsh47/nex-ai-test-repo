import { z } from 'zod';

export const updateUserSchema = z.object({
  body: z.object({
    display_name: z.string().optional(),
    bio: z.string().optional()
  })
});