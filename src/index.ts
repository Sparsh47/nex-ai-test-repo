import Fastify from 'fastify';
import routes from './routes/user';
import fastifyJwt from 'fastify-jwt';

const server = Fastify({ logger: true });

server.register(fastifyJwt, {
  secret: 'test-secret',
});

server.addHook('onRequest', (request, reply, done) => {
  server.log.info(`Request: ${request.method} ${request.url}`);
  done();
});

server.register(routes, { prefix: '/api' });

export default server;