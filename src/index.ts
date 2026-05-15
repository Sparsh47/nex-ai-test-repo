import fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import { z } from 'zod';
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console()
  ]
});

const server = fastify({ logger });

// JWT authentication plugin
server.register(fastifyJwt, {
  secret: 'mock-secret-key',
});

// Zod validation schema for PATCH /api/user/me
const updateUserSchema = z.object({
  display_name: z.string().optional(),
  bio: z.string().optional(),
});

// GET /api/user/me
server.get('/api/user/me', { preValidation: (req, res) => server.jwt.authenticate(req, res) }, (request, reply) => {
  server.log.info(`GET /api/user/me - Authenticated user: ${request.user}`);
  return {
    email: 'user@example.com',
    username: 'mock_user',
  };
});

// PATCH /api/user/me
server.patch('/api/user/me', {
  preValidation: (req, res) => server.jwt.authenticate(req, res),
  schema: {
    body: updateUserSchema,
  },
}, (request, reply) => {
  server.log.info(`PATCH /api/user/me - Updating user: ${JSON.stringify(request.body)}`);
  return {
    success: true,
    updated_fields: request.body,
  };
});

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