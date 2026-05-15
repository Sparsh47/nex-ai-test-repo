import express, { Request, Response } from 'express';
import { getUser, updateUser } from './handlers/user';
import { logger } from '@nex-ai/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/api/user/me', async (req, res) => {
  logger.info('GET /api/user/me requested');
  await getUser(req, res);
});

app.patch('/api/user/me', async (req, res) => {
  logger.info('PATCH /api/user/me requested with body:', req.body);
  await updateUser(req, res);
});

// Error handling
app.use((err: Error, req: Request, res: Response, _next: Function) => {
  logger.error(`Unhandled error in request: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});