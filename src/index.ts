import Fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import { userHandler } from './handlers/user';
import { logger } from './utils/logger';

const app = Fastify({ logger: false });

// Register JWT plugin
app.register(fastifyJwt, {
  secret: 'your-secret-key',
});

// Mock user data
const mockUser = {
  id: '123',
  display_name: 'Test User',
  bio: 'Default bio',
};

// GET /api/user/me
app.get('/api/user/me', { preValidation: (request, reply, done) => {
  app.jwt.verify(request, reply, (err) => {
    if (err) return reply.status(401).send({ error: 'Unauthorized' });
    done();
  });
}}, (request, reply) => {
  logger.info('GET /api/user/me accessed');
  reply.send(mockUser);
});

// PATCH /api/user/me
app.patch('/api/user/me', { preValidation: (request, reply, done) => {
  app.jwt.verify(request, reply, (err) => {
    if (err) return reply.status(401).send({ error: 'Unauthorized' });
    done();
  });
}}, userHandler);

// Start server
app.listen({ port: 3000 }, (err, address) => {
  if (err) throw err;
  console.log(`Server listening at ${address}`);
});