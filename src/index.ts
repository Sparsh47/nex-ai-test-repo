import fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import { logger } from '@nex-ai/logger';
import userHandler from './handlers/userHandlers';

const app = fastify();

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key',
});

app.get('/api/user/me', { preValidation: (request, reply, done) => {
  if (!request.user) {
    logger.warn('Unauthenticated access attempt to /api/user/me');
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  done();
}}, async (request, reply) => {
  logger.info('GET /api/user/me accessed by authenticated user');
  return { user: mockUser };
});

app.patch('/api/user/me', { preValidation: (request, reply, done) => {
  if (!request.user) {
    logger.warn('Unauthenticated PATCH attempt to /api/user/me');
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  done();
}}, userHandler.updateUser);

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});