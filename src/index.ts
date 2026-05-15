import Fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import logger from '@nex-ai/logger';
import userRoutes from './routes/user';

const fastify = Fastify({
  logger: false // We're using @nex-ai/logger instead
});

// Register JWT plugin
fastify.register(fastifyJwt, {
  secret: 'your-secret-key',
  cookie: {
    cookieName: 'token',
    signed: false
  }
});

// Register routes
fastify.register(userRoutes, { prefix: '/api' });

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  logger.error('Server error', { error: error.message });
  reply.status(500).send({ error: 'Internal server error' });
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    logger.info('Server listening on port 3000');
  } catch (err) {
    logger.error('Failed to start server', { error: err });
    process.exit(1);
  }
};

start();