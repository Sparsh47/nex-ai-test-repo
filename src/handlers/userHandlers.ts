import { z } from 'zod';
import { logger } from '@nex-ai/logger';

export const schema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export const updateUser = (mockUser) => (request, reply) => {
  logger.info('Received PATCH request to update user');
  const { name, email } = schema.parse(request.body);

  if (name) mockUser.name = name;
  if (email) mockUser.email = email;

  return { user: mockUser };
};