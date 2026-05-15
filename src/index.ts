import { FastifyInstance } from 'fastify';
import userRoutes from './routes/user';

async function buildServer(): Promise<FastifyInstance> {
  const fastify = await Fastify({
    logger: {
      transport: {
        target: '@nex-ai/logger',
        options: {
          level: 'info',
          name: 'nex-ai-test-repo'
        }
      }
    }
  });

  // Register JWT authentication
  await fastify.register(import('fastify-jwt'), {
    secret: 'super-secret-key',
    cookie: {
      cookieName: 'jwt',
      signed: false
    }
  });

  // Register user routes
  await fastify.register(userRoutes, { prefix: '/api/user' });

  return fastify;
}

export default buildServer;