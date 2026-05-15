import express from 'express';
import { UserUpdateSchema } from '../schemas/user';
import logger from '@nex-ai/logger';

export const userRouter = express.Router();

// GET /api/user/me
userRouter.get('/me', (req, res) => {
  logger.info('Fetching user profile');
  
  // Mock authentication check
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({
    id: '123',
    display_name: 'Test User',
    bio: 'Default bio',
    created_at: new Date()
  });
});

// PATCH /api/user/me
userRouter.patch('/me', (req, res) => {
  logger.info('Updating user profile');
  
  try {
    const updateData = UserUpdateSchema.parse(req.body);
    
    // Mock authentication check
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // In real app, would update database
    const updatedUser = {
      id: '123',
      display_name: updateData.display_name || 'Test User',
      bio: updateData.bio || 'Default bio',
      created_at: new Date()
    };

    res.json(updatedUser);
  } catch (error) {
    logger.error('Validation failed', error);
    res.status(400).json({ error: 'Invalid request data' });
  }
});