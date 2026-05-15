import { FastifyRequest, FastifyReply } from 'fastify';
import { updateUserSchema } from '../schemas/user';
import { logger } from '@nex-ai/logger';

export default async function userRoutes(fastify: FastifyRequest['instance']) {
  // GET /api/user/me
  fastify.get('/api/user/me', { preValidation: [fastify.authenticate] }, (request, reply) => {
    logger.info('GET /api/user/me accessed', { userId: 'mock-123' });
    return {
      id: 'mock-123',
      email: 'user@example.com',
      name: 'Mock User'
    };
  });

  // PATCH /api/user/me
  fastify.patch('/api/user/me', {
    preValidation: [fastify.authenticate],
    schema: {
      body: updateUserSchema.shape
    }
  }, (request, reply) => {
    logger.info('PATCH /api/user/me update attempted', {
      userId: 'mock-123',
      updates: request.body
    });

    const mockUser = {
      id: 'mock-123',
      email: 'user@example.com',
      name: 'Mock User'
    };

    // Apply updates
    Object.assign(mockUser, request.body);

    return mockUser;
  });
}