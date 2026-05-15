import { FastifyInstance } from 'fastify';
import { userUpdateSchema } from '../schemas/user';
import { logger } from '@nex-ai/logger';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/api/user/me', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    logger.info('GET /api/user/me requested', { userId: 'mock-123' });
    return {
      id: 'mock-123',
      email: 'user@example.com',
      name: 'Mock User'
    };
  });

  fastify.patch('/api/user/me', {
    preValidation: [fastify.authenticate],
    schema: {
      body: userUpdateSchema.shape
    }
  }, async (request, reply) => {
    const updates = userUpdateSchema.parse(request.body);
    logger.info('User update requested', { updates });
    return {
      id: 'mock-123',
      email: 'user@example.com',
      name: 'Mock User',
      ...updates
    };
  });
}