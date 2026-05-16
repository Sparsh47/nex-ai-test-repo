import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '@nex-ai/logger';

export async function getMeHandler(request: FastifyRequest, reply: FastifyReply) {
  logger.info('GET /api/user/me called');
  return {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user'
  };
}