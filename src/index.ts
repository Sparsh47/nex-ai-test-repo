import Fastify from 'fastify';
import userRoutes from './routes/user';

const fastify = Fastify({
  logger: true
});

// Register health route
fastify.get('/health', async () => {
  return { status: 'ok' };
});

// Register user routes
fastify.register(userRoutes, { prefix: '/api' });

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Server listening on port 3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();