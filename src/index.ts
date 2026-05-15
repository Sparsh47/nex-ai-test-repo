import Fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import userRoutes from './routes/user';

const fastify = Fastify();

fastify.register(fastifyJwt, {
  secret: 'your-secret-key',
});

fastify.get('/api/health', async () => {
  return { status: 'ok' };
});

fastify.register(userRoutes);

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err;
  console.log(`Server listening at ${address}`);
});