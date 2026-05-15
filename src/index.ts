import fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import { z } from 'zod';

import { updateUserSchema } from '../schemas/user';

const app = fastify();

// Mock user data
const mockUser = {
  id: '123',
  display_name: 'Test User',
  bio: 'Default bio',
};

// Register JWT plugin
app.register(fastifyJwt, {
  secret: 'mock-secret-key',
});

// GET /api/user/me
app.get('/api/user/me', { preValidation: (request, reply, done) => {
  request.jwtVerify((err, user) => {
    if (err) return reply.status(401).send({ error: 'Unauthorized' });
    done();
  });
}}, (request, reply) => {
  app.log.info('GET /api/user/me accessed');
  reply.send(mockUser);
});

// PATCH /api/user/me
app.patch('/api/user/me', { preValidation: (request, reply, done) => {
  request.jwtVerify((err, user) => {
    if (err) return reply.status(401).send({ error: 'Unauthorized' });
    done();
  });
}}, (request, reply) => {
  app.log.info('PATCH /api/user/me accessed');
  
  const { display_name, bio } = updateUserSchema.parse(request.body);
  
  // Update mock user data
  if (display_name) mockUser.display_name = display_name;
  if (bio) mockUser.bio = bio;
  
  reply.send(mockUser);
});

// Error handler
app.setErrorHandler((error, request, reply) => {
  app.log.error('Error occurred:', error);
  reply.status(500).send({ error: 'Internal server error' });
});

export { app };