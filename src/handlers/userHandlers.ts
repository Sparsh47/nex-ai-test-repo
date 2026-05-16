import { Request, Response } from 'express';
import { userSchema } from '../schemas/userSchema';

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
};

export const getUser = (req: Request, res: Response) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json(mockUser);
};

export const updateUser = (req: Request, res: Response) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const updatedFields = userSchema.parse(req.body);
    Object.assign(mockUser, updatedFields);
    res.json(mockUser);
  } catch (error) {
    res.status(400).json({ error: 'Invalid request body' });
  }
};