import { FastifyRequest, FastifyReply } from 'fastify';

export async function getMeHandler(request: FastifyRequest, reply: FastifyReply) {
  // Basic JWT verification (mock implementation)
  if (!request.headers.authorization) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  console.log('GET /api/user/me request received');

  return {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    createdAt: new Date().toISOString()
  };
}