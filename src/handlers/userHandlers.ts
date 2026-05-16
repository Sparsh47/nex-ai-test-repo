import { FastifyRequest, FastifyReply } from 'fastify';
import { userPatchSchema } from '../schemas/userSchema';
import { logger } from '../utils/logger';

export const userHandlers = {
  getUser: async (request: FastifyRequest, reply: FastifyReply) => {
    logger.info('GET /api/user/me - User requested their data');
    return { user: request.user };
  },

  updateUser: async (request: FastifyRequest, reply: FastifyReply) => {
    logger.info('PATCH /api/user/me - User requested data update');
    
    const validatedData = userPatchSchema.parse(request.body);
    
    // Update mock user data (in real app this would update DB)
    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        (request.user as any)[key] = value;
      }
    });

    return { user: request.user };
  }
};