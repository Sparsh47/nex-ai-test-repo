import fastify from 'fastify';
import { getUserHandler, updateUserHandler } from './handlers/user';

const app = fastify();
const PORT = 3000;

// Request logging middleware
app.addHook('onRequest', (request, reply, done) => {
  console.log(`\n${new Date().toISOString()} - ${request.method} ${request.url}`);
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
  console.log(`\nServer running on port ${PORT}`);
});