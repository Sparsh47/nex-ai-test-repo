import { FastifyPluginAsync } from 'fastify';
import { UserUpdateSchema } from '../schemas/user';
import { logger } from '@nex-ai/logger';

const userPlugin: FastifyPluginAsync = async (fastify) => {
  const mockUser = { id: 1, email: 'user@example.com', name: 'John Doe' };

  fastify.get('/api/user/me', { preValidation: fastify.auth }, async (request, reply) => {
    logger.info('GET /api/user/me requested');
    return mockUser;
  });

  fastify.patch('/api/user/me', async (request, reply) => {
    const updateData = UserUpdateSchema.parse(request.body);
    logger.info('User update requested with data:', { updateData });
    Object.assign(mockUser, updateData);
    return mockUser;
  });
};

export default userPlugin;