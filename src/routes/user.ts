import { FastifyRequest, FastifyReply } from 'fastify';
import { UserUpdateSchema } from '../schemas/user';
import { logger } from '@nex-ai/logger';

export default function userRoutes(fastify: FastifyInstance) {
  const mockUser = { id: 1, email: 'user@example.com', name: 'John Doe' };

  fastify.get('/api/user/me', { preValidation: (request, reply, done) => {
    // Simulate JWT auth validation
    if (!request.headers['authorization']) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    done();
  }}, (request: FastifyRequest, reply: FastifyReply) => {
    logger.info('GET /api/user/me');
    return { user: mockUser };
  });

  fastify.patch('/api/user/me', { preValidation: (request, reply, done) => {
    if (!request.headers['authorization']) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    done();
  }, schema: {
    body: UserUpdateSchema
  }}, (request: FastifyRequest, reply: FastifyReply) => {
    logger.info('PATCH /api/user/me', { body: request.body });
    const updates = UserUpdateSchema.parse(request.body);
    Object.assign(mockUser, updates);
    return { user: mockUser };
  });
}