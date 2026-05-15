import Fastify from 'fastify';
import { UserPatchSchema } from './schemas/user';

const server = Fastify({ logger: true });

// Mock user data store
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  status: 'active'
};

// Register JWT authentication
server.register(require('fastify-jwt'), {
  secret: 'supersecretkey'
});

// Health route
server.get('/health', async (request, reply) => {
  server.log.info('Health check requested');
  return { status: 'OK' };
});

// User routes
server.get('/user', { preValidation: (request, reply, done) => {
  request.jwtVerify((err) => {
    if (err) return reply.send(err);
    done();
  });
}}, async (request, reply) => {
  server.log.info('User data requested');
  return mockUser;
});

server.patch('/user', { preValidation: (request, reply, done) => {
  request.jwtVerify((err) => {
    if (err) return reply.send(err);
    done();
  });
}, schema: {
  body: UserPatchSchema.shape
}}, async (request, reply) => {
  server.log.info('User data updated');
  
  // Apply validated updates
  const updates = UserPatchSchema.parse(request.body);
  Object.assign(mockUser, updates);
  
  return mockUser;
});

export { server };

// Start server
if (require.main === module) {
  server.listen(3000, '0.0.0.0', (err, address) => {
    if (err) throw err;
    server.log.info(`Server listening at ${address}`);
  });
}