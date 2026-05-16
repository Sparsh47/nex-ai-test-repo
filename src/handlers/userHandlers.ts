import { FastifyRequest, FastifyReply } from 'fastify';
import { updateUserSchema } from '../schemas/user';
import { app } from '..';

export const userHandlers = {
  getProfile: async (request: FastifyRequest, reply: FastifyReply) => {
    // In production, fetch from DB
    reply.send({
      id: '123',
      display_name: 'Test User',
      bio: 'Mock bio',
      email: 'user@example.com'
    });
  },
  
  updateProfile: async (request: FastifyRequest, reply: FastifyReply) => {
    const { display_name, bio } = request.body as { 
      display_name?: string;
      bio?: string;
    };

    // In production, update DB
    reply.send({
      ...request.user,
      display_name: display_name || request.user.display_name,
      bio: bio || request.user.bio
    });
  }
};