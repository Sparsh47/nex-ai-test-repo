import { z } from 'zod';

export const UserUpdateSchema = z.object({
  display_name: z.string().min(3).max(30),
  bio: z.string().max(160).optional()
});

export type UserUpdateData = z.infer<typeof UserUpdateSchema>;