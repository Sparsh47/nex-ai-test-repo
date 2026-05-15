import Fastify from 'fastify';
import { UserPatchSchema } from './schemas/user';

const fastify = Fastify({ logger: true });

// Mock user data
const user = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user'
};

// Register JWT authentication
fastify.register(require('fastify-jwt'), {
  secret: 'supersecretkey'
});

// GET /user - Get user data with auth
fastify.get('/user', { preValidation: (request, reply, done) => {
  fastify.log.info('GET /user request received');
  request.jwtVerify((err, decoded) => {
    if (err) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }
    done();
  });
}, async (request, reply) => {
  fastify.log.info('Returning user data');
  return user;
});

// PATCH /user - Update user data with validation
fastify.patch('/user', { preValidation: (request, reply, done) => {
  fastify.log.info('PATCH /user request received');
  request.jwtVerify((err, decoded) => {
    if (err) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }
    done();
  });
}, async (request, reply) => {
  const validatedData = UserPatchSchema.parse(request.body);
  
  // Update mock user data
  Object.assign(user, validatedData);
  
  fastify.log.info('User data updated');
  return user;
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok' };
});

export default fastify;