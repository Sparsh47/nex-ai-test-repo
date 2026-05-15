import { FastifyInstance } from 'fastify';
import userHandler from '../handlers/user';

async function routes(fastify: FastifyInstance) {
  fastify.get('/api/user/me', userHandler.getMe);
  fastify.patch('/api/user/me', userHandler.updateMe);
}

export default routes;