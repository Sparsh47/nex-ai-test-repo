import Fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import { userHandlers } from './handlers/userHandlers';
import { userPatchSchema } from './schemas/userSchema';
import { logger } from './utils/logger';

const app = Fastify({ logger });

// Register JWT plugin
app.register(fastifyJwt, {
  secret: 'supersecretkey',
  cookie: {
    cookieName: 'token',
    signed: false
  }
});

// Mock user data
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
};

// GET /api/user/me
app.get('/api/user/me', {
  preValidation: (request, reply, done) => {
    // Use fastify-jwt's built-in authenticate decorator
    if (!request.headers.authorization) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    
    // In production, token would be validated here
    // For demo, we'll just assign mock user
    request.user = mockUser;
    done();
  }
}, userHandlers.getUser);

// PATCH /api/user/me
app.patch('/api/user/me', {
  schema: {
    body: userPatchSchema,
    response: {
      200: {
        type: 'object',
        properties: {
          user: { type: 'object' }
        }
      }
    }
  },
  preValidation: (request, reply, done) => {
    if (!request.headers.authorization) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    
    // Assign mock user for demo
    request.user = mockUser;
    done();
  }
}, userHandlers.updateUser);

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    logger.info('Server listening on port 3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();