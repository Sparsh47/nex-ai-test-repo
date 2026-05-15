import { FastifyPluginAsync } from 'fastify';
import { FastifyInstance } from 'fastify';
import { UserUpdateSchema } from '../schemas/user';
import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import pino from 'pino';

const logger = pino();

const userRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get('/api/user/me', {
    preValidation: (request, reply) => {
      if (!request.headers.authorization) {
        reply.code(401).send({ error: 'Unauthorized' });
      }
    },
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    logger.info('GET /api/user/me request received');
    
    const mockUser = {
      id: '123',
      email: 'user@example.com',
      name: 'John Doe'
    };

    return mockUser;
  });

  fastify.patch('/api/user/me', {
    preValidation: (request, reply) => {
      if (!request.headers.authorization) {
        reply.code(401).send({ error: 'Unauthorized' });
      }
    },
    schema: {
      body: UserUpdateSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: z.infer<typeof UserUpdateSchema> }>, reply: FastifyReply) => {
    logger.info('PATCH /api/user/me request received');
    
    const mockUser = {
      id: '123',
      email: 'user@example.com',
      name: 'John Doe'
    };

    const updates = request.body;
    Object.assign(mockUser, updates);

    return mockUser;
  });
};

export default userRoutes;