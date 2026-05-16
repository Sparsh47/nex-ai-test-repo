import { FastifyRequest, FastifyReply } from 'fastify';

export const getMeHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
  };
  return mockUser;
};