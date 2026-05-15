import express from 'express';
import { UserPatchSchema } from '../schemas/user';
import logger from '../index';

const router = express.Router();

// Mock user data
let currentUser = {
  id: '123',
  display_name: 'Test User',
  bio: 'Default bio',
  email: 'user@example.com'
};

// GET /api/user/me
router.get('/me', (req, res) => {
  logger.info('GET /api/user/me requested');
  
  if (!req.user) {
    logger.warn('Unauthenticated access attempt to /api/user/me');
    return res.status(401).json({ error: 'Authentication required' });
  }

  res.json(currentUser);
});

// PATCH /api/user/me
router.patch('/me', (req, res) => {
  logger.info('PATCH /api/user/me requested');
  
  if (!req.user) {
    logger.warn('Unauthenticated access attempt to /api/user/me');
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const validatedData = UserPatchSchema.parse(req.body);
    Object.assign(currentUser, validatedData);
    res.json(currentUser);
  } catch (error) {
    logger.error('Validation failed for PATCH /api/user/me', error);
    res.status(400).json({ error: 'Invalid request data' });
  }
});

export default router;