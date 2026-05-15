import { z } from 'zod';

export const UserPatchSchema = z.object({
  display_name: z.string().optional(),
  bio: z.string().optional()
});