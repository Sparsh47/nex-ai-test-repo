import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string()
});

export type User = z.infer<typeof UserSchema>;

export const UserUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional()
});

export type UserUpdate = z.infer<typeof UserUpdateSchema>;
