import fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import { z } from 'zod';
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [new transports.Console()]
});

const app = fastify();

app.register(fastifyJwt, {
  secret: 'mock-secret-key',
  sign: { expiresIn: '1h' }
});

const userPatchSchema = z.object({
  display_name: z.string().optional(),
  bio: z.string().optional()
});

const mockUser = {
  id: '123',
  display_name: 'Test User',
  bio: 'Default bio',
  email: 'user@example.com'
};

app.get('/api/user/me', { preValidation: (req, res) => req.jwtVerify() }, (request, reply) => {
  logger.info(`GET /api/user/me - User ${request.user.id} requested their profile`);
  reply.send(request.user);
});

app.patch('/api/user/me', { preValidation: (req, res) => req.jwtVerify() }, (request, reply) => {
  logger.info(`PATCH /api/user/me - User ${request.user.id} attempting to update profile`);

  try {
    const updates = userPatchSchema.parse(request.body);
    const updatedUser = {
      ...mockUser,
      ...updates
    };

    logger.info(`PATCH /api/user/me - User ${request.user.id} successfully updated profile`);
    reply.send(updatedUser);
  } catch (error) {
    logger.error(`PATCH /api/user/me - Validation failed: ${error.message}`);
    reply.status(400).send({ error: 'Invalid request data' });
  }
});

app.setErrorHandler((error, request, reply) => {
  if (error.code === 'FST_JWT_MISSING_TOKEN' || error.code === 'FST_JWT_INVALID_TOKEN') {
    logger.warn(`Authentication failed for ${request.url}: ${error.message}`);
    reply.status(401).send({ error: 'Unauthorized' });
  } else {
    logger.error(`Unhandled error: ${error.message}`);
    reply.status(500).send({ error: 'Internal server error' });
  }
});

export default app;
