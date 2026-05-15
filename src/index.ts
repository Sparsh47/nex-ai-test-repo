import fastify from 'fastify';
import userRoutes from './routes/user';

const fastify = fastify({
  logger: true,
});

// Register JWT authentication
await fastify.register(require('fastify-jwt'), {
  secret: 'your-secret-key',
});

// Register user routes
userRoutes(fastify);

fastify.get('/health', async (request, reply) => {
  return { status: 'ok', uptime: process.uptime() };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log(`Dummy API listening on port 3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();