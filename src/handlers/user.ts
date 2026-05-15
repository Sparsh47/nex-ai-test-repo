import { FastifyRequest, FastifyReply } from 'fastify';
import { UpdateUserSchema } from '../schemas/user';

export const getMe = async (request: FastifyRequest, reply: FastifyReply) => {
  // Mock user data
  return {
    id: '123',
    email: 'user@example.com',
    display_name: 'John Doe',
    bio: 'Software Engineer',
    created_at: new Date().toISOString()
  };
};

export const updateMe = async (request: FastifyRequest, reply: FastifyReply) => {
  const { display_name, bio } = UpdateUserSchema.parse(request.body);
  
  // In real app, update database here
  return {
    success: true,
    data: {
      display_name,
      bio
    }
  };
};