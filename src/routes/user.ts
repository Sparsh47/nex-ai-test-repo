import fastify from 'fastify';
import { UpdateUserSchema } from '../schemas/user';

const userRoutes = (fastify: fastify.FastifyInstance) => {
  fastify.get('/api/user/me', {
    preValidation: (request, reply) => fastify.authenticate(request, reply),
    handler: (request, reply) => {
      // Mock user data
      return {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        isActive: true
      };
    }
  });

  fastify.patch('/api/user/me', {
    preValidation: (request, reply) => fastify.authenticate(request, reply),
    schema: {
      body: UpdateUserSchema
    },
    handler: (request, reply) => {
      const updates = request.body;
      // Merge updates with mock data
      return {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        isActive: true,
        ...updates
      };
    }
  });
};

export default userRoutes;