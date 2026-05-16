import { FastifyRequest, FastifyReply } from 'fastify';
import { userPatchSchema } from '../schemas/userPatchSchema';

export async function patchMeHandler(request: FastifyRequest, reply: FastifyReply) {
  // Basic JWT verification (mock implementation)
  if (!request.headers.authorization) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  try {
    const updates = userPatchSchema.parse(request.body);
    console.log('PATCH /api/user/me request received', { updates });

    return {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      ...updates,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    return reply.status(400).send({ error: 'Invalid request body' });
  }
}