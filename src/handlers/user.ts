import { FastifyRequest, FastifyReply } from 'fastify';
import { verify } from 'fastify-jwt';
import { z } from 'zod';
import { logger } from '@nex-ai/logger';

const mockUser = {
  id: '123',
  display_name: 'Test User',
  bio: 'Default bio',
};

const updateSchema = z.object({
  display_name: z.string().min(2).max(30).optional(),
  bio: z.string().max(160).optional(),
});

export const getMe = async (request: FastifyRequest, reply: FastifyReply) => {
  logger.info('GET /api/user/me requested', { userId: mockUser.id });
  return mockUser;
};

export const updateMe = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = await verify(request, reply);
    const { display_name, bio } = updateSchema.parse(request.body);

    if (display_name) mockUser.display_name = display_name;
    if (bio) mockUser.bio = bio;

    logger.info('User updated', { userId: mockUser.id, updates: { display_name, bio } });
    return mockUser;
  } catch (error) {
    logger.error('Update failed', { error });
    throw error;
  }
};