import fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import { z } from 'zod';

const server = fastify();

// Register JWT plugin
server.register(fastifyJwt, {
  secret: 'supersecretkey',
});

// Mock user data
const mockUser = {
  id: '123',
  display_name: 'Test User',
  bio: 'Default bio',
};

// Zod validation schema
const updateUserSchema = z.object({
  display_name: z.string().optional(),
  bio: z.string().optional(),
});

// GET /api/user/me
server.get('/api/user/me', {
  preValidation: (request, reply, done) => {
    if (!request.headers.authorization) {
      return done(new Error('Unauthorized'));
    }
    done();
  },
}, (request, reply) => {
  server.log.info('GET /api/user/me - Authenticated request');
  reply.send(mockUser);
});

// PATCH /api/user/me
server.patch('/api/user/me', {
  preValidation: (request, reply, done) => {
    if (!request.headers.authorization) {
      return done(new Error('Unauthorized'));
    }
    done();
  },
  schema: {
    body: {
      type: 'object',
      properties: {
        display_name: { type: 'string' },
        bio: { type: 'string' },
      },
      required: [],
    },
  },
}, (request, reply) => {
  server.log.info('PATCH /api/user/me - Authenticated request');
  
  try {
    const { display_name, bio } = updateUserSchema.parse(request.body);
    
    if (display_name) mockUser.display_name = display_name;
    if (bio) mockUser.bio = bio;
    
    reply.send(mockUser);
  } catch (error) {
    server.log.error('Validation error:', error);
    reply.status(400).send({ error: 'Invalid request body' });
  }
});

// Error handler
server.setErrorHandler((error, request, reply) => {
  if (error.message === 'Unauthorized') {
    server.log.error('Authentication failed:', error);
    return reply.status(401).send({ error: 'Authentication required' });
  }
  
  server.log.error('Server error:', error);
  reply.status(500).send({ error: 'Internal server error' });
});

// Start server
if (!import.meta.url.includes('test')) {
  void server.listen({ port: 3000 }, (err, address) => {
    if (err) throw err;
    console.log(`Server listening at ${address}`);
  });
}

export { server };
export default server;