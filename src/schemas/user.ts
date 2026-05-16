import { z } from 'zod';

export const userPatchSchema = z.object({
  display_name: z.string().min(3).max(50).optional(),
  bio: z.string().max(160).optional(),
});

export type UserPatch = z.infer<typeof userPatchSchema>;