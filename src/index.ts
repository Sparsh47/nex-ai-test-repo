import fastify from 'fastify';
import { getUserHandler, updateUserHandler, logger } from './handlers/user';

const app = fastify();
const PORT = 3000;

// Request logging middleware
app.addHook('onRequest', (request, reply, done) => {
  logger.info(`\n${new Date().toISOString()} - ${request.method} ${request.url}`);
  done();
});

// Auth middleware
app.addHook('onRequest', (request, reply, done) => {
  if (request.headers.authorization === 'Bearer mock-token') {
    done();
  } else {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});

app.get('/api/user/me', getUserHandler);
app.patch('/api/user/me', updateUserHandler);

app.listen({ port: PORT }, (err, address) => {
  if (err) throw err;
  logger.info(`\nServer running on port ${PORT}`);
});