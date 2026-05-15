import Fastify from 'fastify';
import { UserUpdateSchema } from '../schemas/user';
import { logger } from '@nex-ai/logger';

const userRoutes = (fastify: Fastify.FastifyInstance): void => {
  fastify.get('/api/user/me', { preValidation: fastify.auth([fastify.verifyJWT]) }, async (request, reply) => {
    logger.info('GET /api/user/me requested');
    return {
      id: '123',
      email: 'user@example.com',
      name: 'Test User',
    };
  });

  fastify.patch('/api/user/me', {
    preValidation: fastify.auth([fastify.verifyJWT]),
    schema: {
      body: UserUpdateSchema,
    },
  }, async (request, reply) => {
    const updates = request.body as UserUpdateSchema;
    logger.info('User update requested', { updates });
    return {
      id: '123',
      ...request.user,
      ...updates,
    };
  });
};

export { userRoutes };