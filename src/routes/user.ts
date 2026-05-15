import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { logger } from '@nex-ai/logger';

const userSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional()
});

const userRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/user/me
  fastify.get('/me', {
    preValidation: (request, reply, done) => {
      // Use Fastify's built-in JWT validation
      if (!request.user) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      done();
    }
  }, async (request, reply) => {
    logger.info('GET /api/user/me requested');

    // Mock user object - in production this would come from DB
    const mockUser = {
      id: '123',
      email: 'user@example.com',
      name: 'John Doe'
    };

    return mockUser;
  });

  // PATCH /api/user/me
  fastify.patch('/me', {
    schema: {
      body: userSchema
    },
    preValidation: (request, reply, done) => {
      if (!request.user) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
      done();
    }
  }, async (request, reply) => {
    logger.info('PATCH /api/user/me requested with body:', request.body);

    // In production, you would update the user in the database
    // Here we just mock the update
    const mockUser = {
      id: '123',
      email: 'user@example.com',
      name: 'John Doe'
    };

    // Merge updates
    const updatedUser = {
      ...mockUser,
      ...request.body
    };

    return updatedUser;
  });
};

export default userRoutes;