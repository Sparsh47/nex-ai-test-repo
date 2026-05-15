import fastify from 'fastify';
import { userRoutes } from './routes/user';

const fastify = fastify();

await fastify.register(require('@fastify/jwt'), {
  secret: 'your-secret-key'
});

fastify.register(userRoutes);

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err;
  console.log(`Server listening at ${address}`);
});