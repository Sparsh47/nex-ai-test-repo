import fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import { z } from 'zod';
import { createLogger, transports, format } from 'winston';
import fs from 'fs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

const patchSchema = z.object({
  display_name: z.string().optional(),
  bio: z.string().optional()
});

const app = fastify({ logger });

app.register(fastifyJwt, {
  secret: JWT_SECRET
});

app.get('/api/user/me', async (request, reply) => {
  logger.info('GET /api/user/me accessed');
  return {
    id: 1,
    name: 'Mock User'
  };
});

app.patch('/api/user/me', async (request, reply) => {
  logger.info('PATCH /api/user/me accessed');
  try {
    const validated = patchSchema.parse(request.body);
    return {
      updated: validated
    };
  } catch (error) {
    logger.error('Validation failed:', error);
    reply.status(400).send({ error: 'Invalid request body' });
  }
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    logger.info('Server listening on port 3000');
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();