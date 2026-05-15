import { FastifyInstance } from 'fastify';
import { updateUserSchema } from '../schemas/user';

export default function userRoutes(fastify: FastifyInstance) {
  // Mock user data
  const mockUser = {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    createdAt: new Date().toISOString()
  };

  // GET /api/user/me
  fastify.get('/api/user/me', { preValidation: (request, reply, done) => {
    // JWT auth is automatically handled by fastify-jwt
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    done();
  }}, async (request, reply) => {
    fastify.log.info(`User ${request.user.sub} requested their profile`);
    return mockUser;
  });

  // PATCH /api/user/me
  fastify.patch('/api/user/me', {
    preValidation: (request, reply, done) => {
      if (!request.user) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      done();
    },
    schema: {
      body: updateUserSchema,
      response: {
        200: {
          type: 'object',
          properties: { ...mockUser }
        }
      }
    }
  }, async (request, reply) => {
    fastify.log.info(`User ${request.user.sub} updated their profile`, { updates: request.body });
    
    // Apply updates to mock user
    Object.assign(mockUser, request.body);
    
    return mockUser;
  });
}