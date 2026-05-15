import { FastifyInstance } from 'fastify';
import { UpdateUserSchema } from '../schemas/user';
import { FastifyRequest } from 'fastify';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.register(async (userRouter) => {
    userRouter.get('/api/user/me', { preValidation: (request, reply) => {
      // In production, verify JWT token here
      // For demo, always allow authenticated
      if (!request.headers.authorization) {
        throw new Error('Unauthorized');
      }
    }}, (request, reply) => {
      return {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        isActive: true
      };
    });

    userRouter.patch('/api/user/me', {
      preValidation: (request, reply) => {
        if (!request.headers.authorization) {
          throw new Error('Unauthorized');
        }
      },
      schema: {
        body: UpdateUserSchema.shape
      }
    }, (request, reply) => {
      const updates = request.body as UpdateUserSchema;
      return {
        id: '123',
        ...{
          name: updates.name || 'John Doe',
          email: updates.email || 'john@example.com',
          isActive: updates.isActive ?? true
        }
      };
    });
  });
}
