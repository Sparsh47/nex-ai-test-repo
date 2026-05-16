import fastify from 'fastify';
import { authenticate } from 'fastify-jwt';
import { logger } from '@nex-ai/logger';
import { userRouter } from './handlers/userHandlers';

const server = fastify();

// Register JWT plugin
server.register(import('fastify-jwt'), {
  secret: 'your-secret-key-here'
});

// Register user routes
server.register(userRouter, { prefix: '/api/user' });

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