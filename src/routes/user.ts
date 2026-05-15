import { FastifyInstance, FastifyRequest } from 'fastify';
import { UpdateUserSchema } from '../schemas/user';
import { logger } from '@nex-ai/logger';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/api/user/me', { preValidation: [fastify.authenticate] }, async (request: FastifyRequest) => {
    logger.info('GET /api/user/me - User requested their profile');
    return {
      id: '123',
      email: 'user@example.com',
      name: 'John Doe'
    };
  });

  fastify.patch('/api/user/me', {
    schema: {
      body: UpdateUserSchema.shape
    },
    preValidation: [fastify.authenticate]
  }, async (request: FastifyRequest<{ Body: z.infer<typeof UpdateUserSchema> }>) => {
    const updates = request.body;
    logger.info('PATCH /api/user/me - User updated their profile', { updates });
    return {
      id: '123',
      email: 'user@example.com',
      name: 'John Doe',
      ...updates
    };
  });
}
