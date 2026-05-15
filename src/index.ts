import fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import { getMe, updateMe } from './handlers/user';
import { UpdateUserSchema } from './schemas/user';
import { logger } from '@nex-ai/logger';

const app = fastify();

// Register JWT plugin
app.register(fastifyJwt, {
  secret: 'your-secret-key',
});

// Register routes
app.get('/api/user/me', { preValidation: (request, reply, done) => {
  request.log.info('GET /api/user/me - Auth check');
  request.jwtVerify((err, user) => {
    if (err) return reply.status(401).send({ error: 'Unauthorized' });
    request.user = user;
    done();
  });
}}, getMe);

app.patch('/api/user/me', {
  schema: {
    body: UpdateUserSchema,
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' }
        }
      }
    }
  },
  preValidation: (request, reply, done) => {
    request.log.info('PATCH /api/user/me - Auth check');
    request.jwtVerify((err, user) => {
      if (err) return reply.status(401).send({ error: 'Unauthorized' });
      request.user = user;
      done();
    });
  }
}, updateMe);

export default app;

// Add request logging middleware
app.addHook('onRequest', (request, reply, done) => {
  logger.info(`Incoming request: ${request.method} ${request.url}`);
  done();
});

app.addHook('onError', (request, reply, error, done) => {
  logger.error(`Error in ${request.method} ${request.url}: ${error.message}`);
  done();
});