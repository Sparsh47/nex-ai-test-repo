import express from 'express';
import { patchUserSchema } from '../schemas/userSchema';
import { logger } from '../utils/logger';

export const userRouter = express.Router();

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
};

userRouter.get('/api/user/me', (req, res) => {
  logger.info('GET /api/user/me');
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(mockUser);
});

userRouter.patch('/api/user/me', (req, res) => {
  logger.info('PATCH /api/user/me');
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const validatedData = patchUserSchema.parse(req.body);
    Object.assign(mockUser, validatedData);
    res.json(mockUser);
  } catch (error) {
    res.status(400).json({ error: 'Invalid request body' });
  }
});