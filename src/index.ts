import Fastify from 'fastify';
import fastifyJwt from 'fastify-jwt';
import { userHandlers } from './handlers/userHandlers';
import { updateUserSchema } from './schemas/user';

const app = Fastify();

// Register JWT plugin
app.register(fastifyJwt, {
  secret: 'your-secret-key',
});

// Apply JWT authentication to all routes
app.addHook('preValidation', (request, reply, done) => {
  if (request.routerMethod === 'GET' && request.routerPath === '/api/user/me') {
    return done();
  }
  
  if (request.routerMethod === 'PATCH' && request.routerPath === '/api/user/me') {
    return done();
  }
  
  // For all other routes, require authentication
  if (!request.headers.authorization) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
  
  return app.jwt.verify(request, reply, (err) => {
    if (err) return reply.status(401).send({ error: 'Invalid token' });
    done();
  });
});

// GET /api/user/me
app.get('/api/user/me', userHandlers.getProfile);

// PATCH /api/user/me
app.patch('/api/user/me', {
  schema: {
    body: updateUserSchema.shape.body,
  },
}, userHandlers.updateProfile);

export { app };

// Start server (for testing)
if (require.main === module) {
  void app.listen(3000, '0.0.0.0', (err, address) => {
    if (err) throw err;
    console.log(`Server listening at ${address}`);
  });
}