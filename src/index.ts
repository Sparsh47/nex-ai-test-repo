import Fastify from 'fastify';
import jwt from 'fastify-jwt';
import { z } from 'zod';

const start = async () => {
  const app = Fastify({ logger: true });

  await app.register(jwt, {
    secret: 'your-secret-key', // Replace with env var in production
  });

  // GET /api/user/me - Authenticated user data
  app.get('/api/user/me', { preHandler: app.authenticate }, async (request, reply) => {
    app.log.info('GET /api/user/me - Authenticated user request');
    
    const user = {
      id: '123',
      email: 'user@example.com',
      display_name: 'John Doe',
      bio: 'Software Engineer'
    };
    return user;
  });

  // PATCH /api/user/me - Update user profile
  const patchSchema = z.object({
    display_name: z.string().optional(),
    bio: z.string().optional()
  });

  app.patch('/api/user/me', { preHandler: app.authenticate }, async (request, reply) => {
    app.log.info('PATCH /api/user/me - Authenticated user update request');
    
    const { display_name, bio } = patchSchema.parse(request.body);
    return {
      success: true,
      updatedFields: { display_name, bio }
    };
  });

  // Health check
  app.get('/health', async (request, reply) => {
    return { status: 'ok' };
  });

  try {
    await app.listen({ port: 3000 });
    app.log.info('Server listening on port 3000');
  } catch (err) {
    app.log.error('Failed to start server', err);
    process.exit(1);
  }
};

start();