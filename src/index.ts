import fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import { getMeHandler } from './handlers/getMeHandler';
import { patchMeHandler } from './handlers/patchMeHandler';
import { userPatchSchema } from './schemas/userPatchSchema';
import logger from '@nex-ai/logger';

const app = fastify();

app.register(fastifyJwt, {
  secret: 'your-secret-key',
});

app.get('/api/user/me', {
  preValidation: (request, reply, done) => {
    try {
      app.jwt.verify(request, reply, (err) => {
        if (err) {
          reply.status(401).send({ error: 'Unauthorized' });
          return;
        }
        logger.info('GET /api/user/me - Authenticated user');
        done();
      });
    } catch (error) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  },
}, getMeHandler);

app.patch('/api/user/me', {
  schema: {
    body: userPatchSchema,
  },
  preValidation: (request, reply, done) => {
    try {
      app.jwt.verify(request, reply, (err) => {
        if (err) {
          reply.status(401).send({ error: 'Unauthorized' });
          return;
        }
        logger.info('PATCH /api/user/me - Authenticated user');
        done();
      });
    } catch (error) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  },
}, patchMeHandler);

export { app };
