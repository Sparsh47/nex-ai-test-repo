import Fastify from 'fastify';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const server = Fastify({ logger: true });

// Mock user data
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
};

// JWT secret (in real app, use env var)
const JWT_SECRET = 'supersecret';

// Zod validation schema for PATCH
const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional()
});

// Logging middleware
server.addHook('onRequest', (request, reply, done) => {
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);
  done();
});

// JWT authentication middleware
server.addHook('preHandler', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    request.user = decoded;
  } catch (error) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
});

// GET /api/user/me
server.get('/api/user/me', async (request, reply) => {
  return mockUser;
});

// PATCH /api/user/me
server.patch('/api/user/me', async (request, reply) => {
  const { name, email } = updateUserSchema.parse(request.body);
  
  if (!request.user) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  // Update mock user
  if (name) mockUser.name = name;
  if (email) mockUser.email = email;

  return mockUser;
});

// Start server
try {
  await server.listen({ port: 3000 });
  console.log('Server listening on port 3000');
} catch (err) {
  console.error(err);
  process.exit(1);
}