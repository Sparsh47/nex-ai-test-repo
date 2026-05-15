import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserUpdateSchema } from '../schemas/user';
import logger from '@nex-ai/logger';

export default async function userRoutes(fastify: FastifyInstance) {
  // GET /api/user/me
  fastify.get('/api/user/me', { preValidation: [fastify.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    logger.info('User info requested', { userId: (request.user as any)?.id });

    // Mock user data - in production this would come from a database
    const user = {
      id: 1,
      email: 'user@example.com',
      name: 'John Doe'
    };

    return user;
  });

  // PATCH /api/user/me
  fastify.patch('/api/user/me', { 
    preValidation: [fastify.authenticate],
    schema: {
      body: UserUpdateSchema
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    logger.info('User update requested', { 
      userId: (request.user as any)?.id,
      updates: request.body
    });

    // In production, this would update the user in the database
    const updates = UserUpdateSchema.parse(request.body);
    
    // Mock user data - in production this would come from a database
    const user = {
      id: 1,
      email: 'user@example.com',
      name: 'John Doe',
      ...updates
    };

    return user;
  });
}