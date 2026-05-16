import { FastifyRequest, FastifyReply } from 'fastify';
import { userPatchSchema } from '../schemas/userSchema';
import logger from '../utils/logger';

// Mock user data
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user'
};

// GET /api/user/me handler
export const getUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  logger.info('Fetching user data');
  return mockUser;
};

// PATCH /api/user/me handler
export const updateUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Validate and parse request body
    const updateData = userPatchSchema.parse(request.body);

    // Apply updates to mock user
    Object.assign(mockUser, {
      ...mockUser,
      ...updateData
    });

    logger.info('User data updated', { updates: updateData });
    return mockUser;
  } catch (error) {
    logger.error('Validation failed', error);
    reply.status(400).send({ error: 'Invalid request data' });
  }
};