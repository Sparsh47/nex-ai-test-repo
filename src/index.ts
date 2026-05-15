import fastify from 'fastify';
import { userRoutes } from './routes/user';

const server = fastify();

server.register(userRoutes);

server.get('/', async () => {
  return { hello: 'world' };
});

export { server };
