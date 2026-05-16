import fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import { patchUserSchema } from './schemas/userSchema';
import { logger } from './utils/logger';

const server = fastify({ logger });

server.register(fastifyJwt, {
  secret: 'your-secret-key',
});

server.get('/api/user/me', { preValidation: (request, reply, done) => {
  if (!request.headers.authorization) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  done();
}}, async (request, reply) => {
  return {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
  };
});

server.patch('/api/user/me', { preValidation: (request, reply, done) => {
  if (!request.headers.authorization) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  try {
    const validatedData = patchUserSchema.parse(request.body);
    // Update mock user logic here
    reply.send({ ...request.body });
  } catch (error) {
    reply.status(400).send({ error: 'Invalid request body' });
  }
  done();
}}, async (request, reply) => {});

export { server };