import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '@nex-ai/logger';
import { userPatchSchema } from '../schemas/userPatchSchema';

export async function patchMeHandler(request: FastifyRequest, reply: FastifyReply) {
  const updateUser = userPatchSchema.parse(request.body);
  logger.info(`Updating user with: ${JSON.stringify(updateUser)}`);
  return {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    ...updateUser
  };
}