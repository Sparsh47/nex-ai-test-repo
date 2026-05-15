import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { UserUpdateSchema } from '../schemas/user';
import { userHandlers } from './handlers/user';
import { createLogger } from '@nex-ai/logger';

const app = fastify({ logger: createLogger() });
const PORT = process.env.PORT || 3000;

// Routes
app.get('/api/user/me', async (request: FastifyRequest, reply: FastifyReply) => {
  // Mock authentication check
  if (!request.headers.authorization) {
    reply.status(401).send({ error: 'Unauthorized' });
    return;
  }

  request.log.info('GET /api/user/me accessed');
  return userHandlers.getUser(request, reply);
});

app.patch('/api/user/me', async (request: FastifyRequest, reply: FastifyReply) => {
  // Mock authentication check
  if (!request.headers.authorization) {
    reply.status(401).send({ error: 'Unauthorized' });
    return;
  }

  try {
    const validatedData = UserUpdateSchema.parse(request.body);
    request.log.info('Received user update request', { data: validatedData });
    return userHandlers.updateUser(request, reply);
  } catch (error) {
    request.log.error('Validation failed for user update', { error });
    reply.status(400).send({ error: 'Invalid request data' });
  }
});

// Error handling
app.setErrorHandler((error, request, reply) => {
  request.log.error(`Unhandled error: ${error.message}`);
  reply.status(500).send({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Server running at ${address}`);
});