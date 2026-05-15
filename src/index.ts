import fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import { Logger } from '@nex-ai/logger';
import { getUserHandler, updateUserHandler, validateUpdateUser } from '../handlers/user';

const server = fastify({ logger: Logger });

// JWT authentication plugin
server.register(fastifyJwt, {
  secret: 'mock-secret-key',
});

// GET /api/user/me
server.get('/api/user/me', { preValidation: (req, res) => server.jwt.authenticate(req, res) }, getUserHandler(server));

// PATCH /api/user/me
server.patch('/api/user/me', {
  preValidation: (req, res) => server.jwt.authenticate(req, res),
  schema: validateUpdateUser(server),
}, updateUserHandler(server));

// 401 handler for unauthenticated requests
server.setErrorHandler((error, request, reply) => {
  if (error.code === 'FST_JWT_MISSING_TOKEN' || error.code === 'FST_JWT_INVALID_TOKEN') {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  return reply.send(error);
});

export default server;

// Start server
if (!import.meta.url.includes('test')) {
  server.listen({ port: 3000 }, (err, address) => {
    if (err) throw err;
    console.log(`Server listening at ${address}`);
  });
}