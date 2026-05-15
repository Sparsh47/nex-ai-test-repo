import fastify from 'fastify';

export function userRoutes(fastify: fastify.FastifyInstance): void {
  fastify.get('/api/user/me', { preValidation: fastify.auth([verifyJWT]) }, async (request, reply) => {
    console.log('GET /api/user/me - Authenticated user:', request.user);
    return {
      id: '123',
      email: 'user@example.com',
      name: 'Test User'
    };
  });

  fastify.patch('/api/user/me', async (request, reply) => {
    try {
      const updates = UserUpdateSchema.parse(request.body);
      console.log('PATCH /api/user/me - Update request:', updates);
      return {
        id: '123',
        email: 'user@example.com',
        name: 'Test User',
        ...updates
      };
    } catch (error) {
      reply.status(400).send({ error: 'Invalid request body' });
    }
  });
}
