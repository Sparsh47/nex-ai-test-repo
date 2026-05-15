import { FastifyRequest, FastifyReply } from 'fastify';
import { UserUpdateSchema } from '../schemas/user';
import { createLogger, format, transports } from 'winston';

// Configure winston logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `\n[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new transports.Console()
  ]
});

// Mock user data store
const mockUser = {
  id: '123',
  display_name: 'Test User',
  bio: 'Default bio',
  email: 'user@example.com'
};

export const getUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    logger.info('Fetching user data');
    reply.send(mockUser);
  } catch (error) {
    logger.error(`Error fetching user: ${error}`);
    reply.status(500).send({ error: 'Internal server error' });
  }
};

export const updateUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Validate request body with Zod
    const validatedData = UserUpdateSchema.parse(request.body);
    
    // Apply updates to mock user
    Object.assign(mockUser, validatedData);
    
    logger.info('User data updated', { user: mockUser });
    reply.send(mockUser);
  } catch (error) {
    if (error instanceof Error) {
      // Handle Zod validation errors
      if (error.name === 'ZodError') {
        logger.warn('Validation failed', error);
        return reply.status(400).send({
          error: 'Validation failed',
          details: error.issues
        });
      }
      
      logger.error('Error updating user', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  }
};