import { FastifyRequest, FastifyReply } from 'fastify';
import { UserUpdateSchema } from '../schemas/user';

export const userHandlers = {
  getUser: async (request: FastifyRequest, reply: FastifyReply) => {
    request.log.info('GET /api/user/me accessed');
    return {
      email: 'user@example.com',
      username: 'johndoe'
    };
  },

  updateUser: async (request: FastifyRequest<{ Body: z.infer<typeof UserUpdateSchema> }>, reply: FastifyReply) => {
    try {
      const validatedData = UserUpdateSchema.parse(request.body);
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