import Fastify from 'fastify';
import userRoutes from './routes/user';

const fastify = Fastify({ logger: true });

// Register JWT plugin
await fastify.register(require('fastify-jwt'), {
  secret: 'your-secret-key' // Replace with environment variable in production
});

// Register routes with /api prefix
await fastify.register(userRoutes, { prefix: '/api' });

export default fastify;
