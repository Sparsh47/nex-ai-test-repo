import Fastify from 'fastify';
import jwt from 'fastify-jwt';
import { z } from 'zod';
import { logger } from '@nex-ai/logger';

const start = async () => {
  const app = Fastify({ logger: true });

  // Register JWT authentication
  await app.register(jwt, {
    secret: 'your-secret-key', // In production, use environment variable
  });

  // GET /api/user/me - Return authenticated user data
  app.get('/api/user/me', { preHandler: app.authenticate }, async (request, reply) => {
    logger.info('GET /api/user/me - Authenticated user request');
    
    // Mock user data - In production, fetch from database
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
    logger.info('PATCH /api/user/me - Authenticated user update request');
    
    // Validate request body with Zod
    const { display_name, bio } = patchSchema.parse(request.body);
    
    // In production, update database with new values
    // Here we just return the updated fields for demonstration
    return {
      success: true,
      updatedFields: {
        display_name,
        bio
      }
    };
  });

  // 401 for unauthenticated requests
  app.get('/api/user/me', async (request, reply) => {
    reply.status(401).send({ error: 'Authentication required' });
  });

  // Health check
  app.get('/health', async (request, reply) => {
    return { status: 'ok' };
  });

  try {
    await app.listen({ port: 3000 });
    logger.info('Server listening on port 3000');
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
};

start();