import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { User } from '../schemas/user';

const updateUserSchema = z.object({
  display_name: z.string().optional(),
  bio: z.string().optional()
});

export const userHandlers = {
  getUser: async (request: FastifyRequest, reply: FastifyReply) => {
    request.log.info('GET /api/user/me accessed');
    return {
      email: 'user@example.com',
      username: 'johndoe'
    };
  },

  updateUser: async (request: FastifyRequest<{ Body: z.infer<typeof updateUserSchema> }>, reply: FastifyReply) => {
    try {
      const validatedData = updateUserSchema.parse(request.body);
      request.log.info('Received user update request', { data: validatedData });

      return {
        success: true,
        updated_fields: Object.keys(validatedData).filter(k => validatedData[k] !== undefined)
      };
    } catch (error) {
      request.log.error('Validation failed for user update', { error });
      reply.status(400).send({ error: 'Invalid request data' });
    }
  }
};