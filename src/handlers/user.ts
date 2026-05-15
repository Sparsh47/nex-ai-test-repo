import { FastifyRequest, FastifyReply } from 'fastify';
import { UserUpdateSchema } from '../schemas/user';

export const userHandlers = {
  getUser: async (request: FastifyRequest, reply: FastifyReply) => {
    request.log.info('User data requested');
    return {
      email: 'user@example.com',
      username: 'johndoe',
      bio: 'Software engineer',
      createdAt: new Date().toISOString()
    };
  },

  updateUser: async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedData = UserUpdateSchema.parse(request.body);
      request.log.info('User data updated', validatedData);
      return {
        success: true,
        data: validatedData
      };
    } catch (error) {
      request.log.error('Validation failed:', error);
      reply.status(400).send({ error: 'Invalid request data' });
    }
  }
};