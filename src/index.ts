import Fastify from 'fastify';
import { logger } from '@nex-ai/logger';
import userRoutes from './routes/user';

const fastify = Fastify({ logger });

fastify.register(userRoutes);

fastify.get('/api/health', async () => {
  return { status: 'ok' };
});

try {
  await fastify.listen({ port: 3000 });
  fastify.log.info(`Server listening on http://localhost:3000`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}