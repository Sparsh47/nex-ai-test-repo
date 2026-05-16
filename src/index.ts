import fastify from 'fastify';
import { getMeHandler } from './handlers/getMeHandler';
import { patchMeHandler } from './handlers/patchMeHandler';
import { verifyJWT } from './middleware/jwt';

const server = fastify();

// Basic logging middleware
server.addHook('onRequest', (request, reply, done) => {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
  done();
});

// Register routes with authentication middleware
server.get('/api/user/me', { preHandler: verifyJWT }, getMeHandler);
server.patch('/api/user/me', { preHandler: verifyJWT }, patchMeHandler);

export { server };