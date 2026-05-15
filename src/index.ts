import fastify from 'fastify';
import { userPatchSchema } from './schemas/user';

const server = fastify({ logger: true });

// Mock user data
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
};

// Register JWT plugin
server.register(import('@fastify/jwt'), {
  secret: 'supersecretkey'
});

// GET /user route
server.get('/user', async (request, reply) => {
  try {
    await request.jwtVerify();
    server.log.info('User data requested');
    return mockUser;
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});

// PATCH /user route
server.patch('/user', async (request, reply) => {
  try {
    await request.jwtVerify();
    server.log.info('User data update requested');
    
    // Validate request body
    const validatedData = userPatchSchema.parse(request.body);
    
    // Update mock user data
    Object.assign(mockUser, validatedData);
    
    return mockUser;
  } catch (err) {
    if (err instanceof Error && err.name === 'ZodError') {
      return reply.status(400).send({ error: 'Validation failed', details: err.errors });
    }
    reply.status(401).send({ error: 'Unauthorized' });
  }
});

const start = async () => {
  try {
    await server.listen({ port: 3000 });
    server.log.info('Server listening on port 3000');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();