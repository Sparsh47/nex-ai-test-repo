import { FastifyInstance } from 'fastify';
import { updateUserSchema } from './schemas/user';
import { logger } from '@nex-ai/logger';

const mockUser = {
  id: '123',
  email: 'user@example.com',
  name: 'John Doe',
};

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/api/user/me', {
    preValidation: [fastify.authenticate],
    handler: async (request, reply) => {
      logger.info(`User ${request.user.id} accessed /api/user/me`);
      return { user: mockUser };
    }
  });

  fastify.patch('/api/user/me', {
    preValidation: [fastify.authenticate],
    schema: {
      body: updateUserSchema
    },
    handler: async (request, reply) => {
      const { name, email } = updateUserSchema.parse(request.body);
      logger.info(`User ${request.user.id} updated profile`, { name, email });
      mockUser.name = name || mockUser.name;
      mockUser.email = email || mockUser.email;
      return { user: mockUser };
    }
  });
}
