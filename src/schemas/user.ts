import { z } from 'zod';

export const UserUpdateSchema = z.object({
  display_name: z.string().optional(),
  bio: z.string().optional()
});