import Fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import { z } from 'zod';
import { logger } from '@nex-ai/logger';

const app = Fastify();

// Register JWT plugin
app.register(fastifyJwt, {
  secret: 'your-secret-key',
});

// Mock user data
const mockUser = {
  id: 1,
  display_name: 'John Doe',
  bio: 'Software Engineer',
};

// Zod validation schema for PATCH request
const updateUserSchema = z.object({
  display_name: z.string().optional(),
  bio: z.string().optional(),
});

// GET /api/user/me
app.get('/api/user/me', { preValidation: (request, reply, done) => {
  if (!request.headers.authorization) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  done();
}}, async (request, reply) => {
  logger.info('GET /api/user/me accessed');
  return mockUser;
});

// PATCH /api/user/me
app.patch('/api/user/me', {
  preValidation: (request, reply, done) => {
    if (!request.headers.authorization) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    done();
  },
  schema: {
    body: {
      type: 'object',
      properties: {
        display_name: { type: 'string' },
        bio: { type: 'string' },
      },
      required: []
    }
  }
}, async (request, reply) => {
  logger.info('PATCH /api/user/me accessed');
  const { display_name, bio } = updateUserSchema.parse(request.body);

  if (display_name) mockUser.display_name = display_name;
  if (bio) mockUser.bio = bio;

  return mockUser;
});

// Health check
app.get('/health', async () => {
  return { status: 'OK' };
});

export default app;
