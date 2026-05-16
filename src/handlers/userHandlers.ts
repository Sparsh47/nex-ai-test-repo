import { Request, Response } from 'express';
import { User } from './schemas/userSchema';

// Mock user data
const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
};

export const userHandlers = {
  getUser: (req: Request, res: Response) => {
    console.log('GET /api/user/me - Auth check:', req.headers.authorization);
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.json(mockUser);
  },

  updateUser: (req: Request, res: Response) => {
    console.log('PATCH /api/user/me - Auth check:', req.headers.authorization);
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // In a real app, validate and update user data
    const updatedFields = req.body;
    Object.assign(mockUser, updatedFields);

    res.json(mockUser);
  },
};