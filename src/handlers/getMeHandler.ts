import { FastifyRequest, FastifyReply } from 'fastify';
import { authenticate } from 'fastify-jwt';
import { logger } from '@nex-ai/logger';

export async function getMeHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    logger.info('GET /api/user/me - Authenticated user');
    return {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com'
    };
  } catch (error) {
    logger.warn('GET /api/user/me - Unauthenticated request');
    reply.status(401).send({ error: 'Unauthorized' });
  }
}