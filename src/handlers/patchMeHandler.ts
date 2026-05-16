import { FastifyRequest, FastifyReply } from 'fastify';
import { authenticate } from 'fastify-jwt';
import { logger } from '@nex-ai/logger';
import { userPatchSchema } from '../schemas/userPatchSchema';

export async function patchMeHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    logger.info('PATCH /api/user/me - Authenticated user');

    const validationResult = userPatchSchema.safeParse(request.body);
    if (!validationResult.success) {
      logger.error('PATCH /api/user/me - Validation failed', validationResult.error);
      return reply.status(400).send({ error: 'Invalid request body' });
    }

    // Mock update logic
    return {
      id: '123',
      name: 'John Updated',
      email: 'john.updated@example.com',
      ...validationResult.data
    };
  } catch (error) {
    logger.warn('PATCH /api/user/me - Unauthenticated request');
    reply.status(401).send({ error: 'Unauthorized' });
  }
}