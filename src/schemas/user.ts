import { z } from 'zod';

export const UserUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  // Add other updatable fields as needed
});
type UserUpdate = z.infer<typeof UserUpdateSchema>;

export type { UserUpdate };