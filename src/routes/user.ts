import { FastifyInstance } from 'fastify';
import { getMe, updateMe } from '../handlers/user';
import { UpdateUserSchema } from '../schemas/user';

async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/user/me', {
    preValidation: (request, reply, done) => {
      request.jwtVerify();
      done();
    },
    handler: getMe
  });

  fastify.patch('/user/me', {
    preValidation: (request, reply, done) => {
      request.jwtVerify();
      done();
    },
    schema: {
      body: UpdateUserSchema
    },
    handler: updateMe
  });
}

export default userRoutes;