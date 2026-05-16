import { FastifyRequest, FastifyReply } from 'fastify';
import { patchUserSchema } from '../schemas/userSchema';

const mockUser = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
};

export const getUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  return mockUser;
};

export const updateUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const validatedData = patchUserSchema.parse(request.body);
  Object.assign(mockUser, validatedData);
  return mockUser;
};