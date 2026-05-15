import Fastify from 'fastify';
import userPlugin from './routes/user';

const fastify = Fastify({ logger: true });

fastify.register(userPlugin, { prefix: '/api' });

fastify.get('/health', async () => {
  return { status: 'ok' };
});

try {
  await fastify.listen({ port: 3000 });
  console.log('Server listening on port 3000');
} catch (err) {
  console.error(err);
  process.exit(1);
}