import fastify from 'fastify';
import { authenticate } from 'fastify-jwt';
import { logger } from '@nex-ai/logger';
import { getMeHandler } from './handlers/getMeHandler';
import { patchMeHandler } from './handlers/patchMeHandler';

const server = fastify();

// Register JWT plugin
server.register(import('fastify-jwt'), {
  secret: 'your-secret-key-here'
});

// Register routes
server.get('/api/user/me', { preHandler: [authenticate] }, getMeHandler);
server.patch('/api/user/me', { preHandler: [authenticate] }, patchMeHandler);

// Global error handler
server.setErrorHandler((error, request, reply) => {
  logger.error('Unhandled error:', error);
  reply.status(500).send({ error: 'Internal server error' });
});

export default server;

// Start server for development
if (!process.env.TEST_ENV) {
  server.listen({ port: 3000 }, (err, address) => {
    if (err) throw err;
    console.log(`Server listening at ${address}`);
  });
}