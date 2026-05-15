import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '@nex-ai/logger';
import { z } from 'zod';
import { updateUserSchema } from '../schemas/user';

export default function userRoutes(fastify: FastifyInstance) {
  // GET /api/user/me
  fastify.get('/user/me', { preValidation: (request, reply, done) => {
      if (request.user) {
        done();
      } else {
        reply.status(401).send({ error: 'Unauthorized' });
        done(new Error('Unauthorized'));
      }
    }},
    async (request: FastifyRequest, reply: FastifyReply) => {
      logger.info('GET /user/me request received');
      const mockUser = { id: 1, email: 'user@example.com', name: 'John Doe' };
      return mockUser;
    }
  );

  // PATCH /api/user/me
  fastify.patch('/user/me', {
    schema: {
      body: updateUserSchema
    },
    preValidation: (request, reply, done) => {
      if (request.user) {
        done();
      } else {
        reply.status(401).send({ error: 'Unauthorized' });
        done(new Error('Unauthorized'));
      }
    }
  },
    async (request: FastifyRequest<{ Body: z.infer<typeof updateUserSchema> }>, reply: FastifyReply) => {
      logger.info('PATCH /user/me request received with body:', request.body);
      const mockUser = { id: 1, email: 'user@example.com', name: 'John Doe' };
      const updates = request.body;
      Object.assign(mockUser, updates);
      return mockUser;
    }
  );
}