import express from 'express';
import { UserUpdateSchema } from '../schemas/user';
import { logger } from '@nex-ai/logger';

// Mock user data store
const mockUser = {
  id: '123',
  display_name: 'Test User',
  bio: 'Default bio',
  email: 'user@example.com'
};

export const getUserHandler = async (req: express.Request, res: express.Response) => {
  try {
    logger.info('Fetching user data');
    res.json(mockUser);
  } catch (error) {
    logger.error('Error fetching user', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserHandler = async (req: express.Request, res: express.Response) => {
  try {
    const validatedData = UserUpdateSchema.parse(req.body);
    
    // Apply updates to mock user
    Object.assign(mockUser, validatedData);
    
    logger.info('User data updated', { user: mockUser });
    res.json(mockUser);
  } catch (error) {
    if (error instanceof Error) {
      logger.error('Validation failed', error);
      return res.status(400).json({ error: error.message });
    }
    
    logger.error('Error updating user', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};